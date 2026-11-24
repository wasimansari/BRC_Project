/**
 * Cloudinary File Proxy Utility
 * 
 * Reliably fetches files (PDFs, images) from Cloudinary and streams them
 * to the Express response. Handles:
 * - URLs with/without .pdf extension (tries both for backward compatibility)
 * - HTTP redirects (301, 302, 307, 308)
 * - Timeouts without crashing (ERR_HTTP_HEADERS_SENT prevention)
 * - Legacy /image/upload/ → /raw/upload/ path correction for PDFs
 */
const https = require('https');

/**
 * Fetch a URL and return the response stream.
 * Rejects on timeout or network error.
 */
function fetchUrl(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout }, (response) => {
      resolve({ response, request });
    });
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('TIMEOUT'));
    });
    request.on('error', (err) => {
      // Ignore errors from request.destroy() called in timeout handler
      if (err.code !== 'ECONNRESET') {
        reject(err);
      }
    });
  });
}

/**
 * Proxy a Cloudinary file to an Express response.
 * 
 * @param {string} storedUrl - The URL stored in MongoDB
 * @param {object} res - Express response object
 * @param {object} options
 * @param {string} options.fileName - Filename for Content-Disposition header
 * @param {string} options.contentType - MIME type (e.g. 'application/pdf', 'image/jpeg')
 * @param {number} options.timeout - Request timeout in ms (default 30000)
 */
async function proxyCloudinaryFile(storedUrl, res, options = {}) {
  const { fileName, contentType, timeout = 30000 } = options;

  // Fix legacy /image/upload/ paths for PDFs
  let url = storedUrl;
  if (contentType === 'application/pdf' && url.includes('/image/upload/')) {
    url = url.replace('/image/upload/', '/raw/upload/');
  }

  // Set response headers before streaming
  if (fileName) {
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
  }
  if (contentType) {
    res.setHeader('Content-Type', contentType);
  }

  // Build list of URLs to try:
  // 1. Stored URL as-is
  // 2. If URL ends with .pdf, try without it (Cloudinary raw files don't have extensions)
  const urlsToTry = [url];
  if (url.endsWith('.pdf')) {
    urlsToTry.push(url.slice(0, -4));
  }

  for (const tryUrl of urlsToTry) {
    try {
      let currentUrl = tryUrl;
      let redirectsLeft = 5;

      while (redirectsLeft > 0) {
        const { response, request } = await fetchUrl(currentUrl, timeout);

        // Follow HTTP redirects
        if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
          request.destroy();
          currentUrl = response.headers.location;
          redirectsLeft--;
          continue;
        }

        // Success — pipe the file to the client
        if (response.statusCode === 200) {
          response.pipe(res);
          response.on('error', () => {
            if (!res.headersSent) {
              res.status(502).json({ message: 'Error streaming file' });
            }
          });
          return; // Done!
        }

        // Non-200, non-redirect — try the next URL variant
        request.destroy();
        break;
      }
    } catch (err) {
      // Timeout or network error — try the next URL variant
      console.error(`Failed to fetch ${tryUrl}:`, err.message);
      continue;
    }
  }

  // All URL variants failed
  if (!res.headersSent) {
    res.status(502).json({ message: 'Failed to fetch file from cloud storage' });
  }
}

module.exports = { proxyCloudinaryFile };
