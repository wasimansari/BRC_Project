import { NgModule } from '@angular/core';
import { ScrollAnimateDirective } from './core/directives/scroll-animate.directive';
import { SmoothScrollDirective } from './core/directives/smooth-scroll.directive';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { CoursesPageComponent } from './pages/courses/courses.component';
import { EventsPageComponent } from './pages/events/events.component';
import { BlogPageComponent } from './pages/blog/blog.component';
import { ContactPageComponent } from './pages/contact/contact.component';
import { GalleryPageComponent } from './pages/gallery/gallery.component';
import { DownloadsPageComponent } from './pages/downloads/downloads.component';
import { SearchSchoolComponent } from './pages/search-school/search-school.component';
import { HeaderComponent } from './components/header/header.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { ServicesComponent } from './components/services/services.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { NoticesComponent } from './components/notices/notices.component';
import { NewsComponent } from './components/news/news.component';
import { EventsComponent } from './components/events/events.component';
import { LibraryComponent } from './components/library/library.component';
import { TestimonialComponent } from './components/testimonial/testimonial.component';
import { FooterComponent } from './components/footer/footer.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminSignupComponent } from './admin/admin-login/admin-signup.component';
import { TeacherLoginComponent } from './teacher/teacher-login/teacher-login.component';
import { TeacherSignupComponent } from './teacher/teacher-signup/teacher-signup.component';
import { TeacherDashboardComponent } from './teacher/teacher-dashboard/teacher-dashboard.component';
import { AdminGalleryComponent } from './admin/admin-gallery/admin-gallery.component';
import { AdminDownloadsComponent } from './admin/admin-downloads/admin-downloads.component';
import { AdminSchoolComponent } from './admin/admin-school/admin-school.component';
import { AdminNewsComponent } from './admin/admin-news/admin-news.component';
import { DepartmentNewsComponent } from './pages/department-news/department-news.component';
import { NewsPreviewComponent } from './components/news-preview/news-preview.component';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    CoursesPageComponent,
    EventsPageComponent,
    BlogPageComponent,
    ContactPageComponent,
    GalleryPageComponent,
    DownloadsPageComponent,
    SearchSchoolComponent,
    HeaderComponent,
    HeroSectionComponent,
    ServicesComponent,
    StatisticsComponent,
    NoticesComponent,
    NewsComponent,
    EventsComponent,
    LibraryComponent,
    TestimonialComponent,
    FooterComponent,
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminSignupComponent,
    TeacherLoginComponent,
    TeacherSignupComponent,
    TeacherDashboardComponent,
    AdminGalleryComponent,
    AdminDownloadsComponent,
    AdminSchoolComponent,
    AdminNewsComponent,
    DepartmentNewsComponent,
    NewsPreviewComponent,
    ScrollAnimateDirective,
    SmoothScrollDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
