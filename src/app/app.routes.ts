import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { CoursesPageComponent } from './pages/courses/courses.component';
import { EventsPageComponent } from './pages/events/events.component';
import { BlogPageComponent } from './pages/blog/blog.component';
import { ContactPageComponent } from './pages/contact/contact.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

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
    path: 'contact', 
    component: ContactPageComponent 
  },
  { 
    path: 'admin/login', 
    component: AdminLoginComponent 
  },
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent 
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
