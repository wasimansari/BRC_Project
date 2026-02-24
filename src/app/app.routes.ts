import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { CoursesPageComponent } from './pages/courses/courses.component';
import { EventsPageComponent } from './pages/events/events.component';
import { BlogPageComponent } from './pages/blog/blog.component';
import { ContactPageComponent } from './pages/contact/contact.component';
import { GalleryPageComponent } from './pages/gallery/gallery.component';
import { DownloadsPageComponent } from './pages/downloads/downloads.component';
import { SearchSchoolComponent } from './pages/search-school/search-school.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminSignupComponent } from './admin/admin-login/admin-signup.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent
  },
  { 
    path: 'home', 
    component: HomeComponent
  },
  { 
    path: 'about', 
    component: AboutComponent 
  },
  { 
    path: 'courses', 
    component: CoursesPageComponent 
  },
  { 
    path: 'events', 
    component: EventsPageComponent 
  },
  { 
    path: 'blog', 
    component: BlogPageComponent 
  },
  { 
    path: 'gallery', 
    component: GalleryPageComponent 
  },  {
    path: 'downloads',
    component: DownloadsPageComponent
  },
  {
    path: 'search-school',
    component: SearchSchoolComponent
  },
  { 
    path: 'contact', 
    component: ContactPageComponent 
  },
  { 
    path: 'admin/login', 
    component: AdminLoginComponent 
  },
  { 
    path: 'admin/signup', 
    component: AdminSignupComponent 
  },
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
