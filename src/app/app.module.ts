import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routes';

import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { CoursesPageComponent } from './pages/courses/courses.component';
import { EventsPageComponent } from './pages/events/events.component';
import { BlogPageComponent } from './pages/blog/blog.component';
import { ContactPageComponent } from './pages/contact/contact.component';
import { HeaderComponent } from './components/header/header.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { ServicesComponent } from './components/services/services.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { NewsComponent } from './components/news/news.component';
import { LibraryComponent } from './components/library/library.component';
import { TestimonialComponent } from './components/testimonial/testimonial.component';
import { FooterComponent } from './components/footer/footer.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminSignupComponent } from './admin/admin-login/admin-signup.component';
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
    HeaderComponent,
    HeroSectionComponent,
    ServicesComponent,
    StatisticsComponent,
    NewsComponent,
    LibraryComponent,
    TestimonialComponent,
    FooterComponent,
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminSignupComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
