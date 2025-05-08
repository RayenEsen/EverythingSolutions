import { Routes } from '@angular/router';
import { LoginComponent } from './Login/Login.component';
import { HomeComponent } from './Home/Home.component';
import { AuthGuard } from './Guards/auth.guard';
import { LoginGuard } from './Guards/login.guard';
import { BanqueComponent } from './Banque/Banque.component';
import { RetraitComponent } from './Retrait/Retrait.component';
import { PrintTraiteComponent } from './PrintTraite/PrintTraite.component';
export const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent,
    title: 'Login',
    canActivate: [LoginGuard]
  },
  {
    path: 'Banque',
    component: BanqueComponent,
    title: 'Banque',
    canActivate: [AuthGuard]
  },
  {
    path: '',
    component: RetraitComponent,
    title: 'Retrait',
    canActivate: [AuthGuard]
  },
  {
    path: 'RetraitDetails/:id',
    component: PrintTraiteComponent,
    title: 'Détails Retrait',
    canActivate: [AuthGuard]
  }

];
