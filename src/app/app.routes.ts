import { Routes } from '@angular/router';
import { LoginComponent } from './Login/Login.component';
import { HomeComponent } from './Home/Home.component';
import { AuthGuard } from './Guards/auth.guard';
import { LoginGuard } from './Guards/login.guard';
import { BanqueComponent } from './Banque/Banque.component';
import { RetraitComponent } from './Retrait/Retrait.component';
import { PrintTraiteComponent } from './PrintTraite/PrintTraite.component';
import { ResetPasswordComponent } from './ResetPassword/ResetPassword.component';
import { RetenueSourceComponent } from './RetenueSource/RetenueSource.component';
import { PrintRetenueComponent } from './PrintRetenue/PrintRetenue.component';
import { CommingSoonComponent } from './CommingSoon/CommingSoon.component';
import { LayoutComponent } from './layout/layout.component';
import { ProfileComponent } from './Profile/Profile.component';
import { DashboardComponent } from './Dashboard/Dashboard.component';
import { AdminGuard } from './Guards/admin.guard';
import { PaymentSuccessComponent } from './PaymentSuccess/PaymentSuccess.component';
import { PaymentFailComponent } from './PaymentFail/PaymentFail.component';
import { PaymentInfoComponent } from './PaymentInfo/PaymentInfo.component';
import { ArticleComponent } from './Article/Article.component';
import { EntrepriseDetailsComponent } from './EntrepriseDetails/EntrepriseDetails.component';
import { FournisseurComponent } from './Fournisseur/Fournisseur.component';
import { TVAComponent } from './TVA/TVA.component';
import { StockComponent } from './Stock/Stock.component';
import { ClientComponent } from './Client/Client.component';
import { DevisComponent } from './Devis/Devis.component';
import { ImprimerDevisComponent } from './ImprimerDevis/ImprimerDevis.component';
import { DevisCreateComponent } from './Devis/DevisCreate.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login',
    canActivate: [LoginGuard]
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Réinitialiser le mot de passe',
    canActivate: [LoginGuard]
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
        title: 'Quick Soft',
      },
      {
        path: 'Banque',
        component: BanqueComponent,
        title: 'Banque',
        canActivate: [AuthGuard]
      },
      {
        path: 'Trait',
        component: RetraitComponent,
        title: 'Trait',
      },
      {
        path: 'RetraitDetails/:id',
        component: PrintTraiteComponent,
        title: 'Imprimer Trait',
      },
      {
        path: 'Retenue',
        component: RetenueSourceComponent,
        title: 'Retenue a la source',
        canActivate: [AuthGuard]
      },
      {
        path: 'ImprimerRetenue/:id',
        component: PrintRetenueComponent,
        title: 'Imprimer Retenue a la source',
        canActivate: [AuthGuard]
      },
      {
        path: 'CommingSoon',
        component: CommingSoonComponent,
        title: 'Bientôt disponible Soon',
      },
      {
        path: 'Profil',
        component: ProfileComponent,
        title: 'Profil',
      },
      {
        path: 'Dashboard',
        component: DashboardComponent,
        title: 'Dashboard',
        canActivate: [AdminGuard]  // Only admin users
      },
      {
        path: 'payment-success',
        component: PaymentSuccessComponent,
        title: 'Payment Success'
      },
      {
        path: 'payment-fail',
        component: PaymentFailComponent,
        title: 'Payment Failed'
      },
      {
        path: 'payment-info',
        component: PaymentInfoComponent,
        title: 'Payment Information'
      },
      {
        path: 'ListArticle',
        component: ArticleComponent,
        title: 'Liste Article',
        canActivate: [AuthGuard]
      },
      {
        path: 'Fournisseur',
        component: FournisseurComponent,
        title: 'Gestion des Fournisseurs',
        canActivate: [AuthGuard]
      },
      {
        path: 'TVA',
        component: TVAComponent,
        title: 'Gestion TVA',
        canActivate: [AuthGuard]
      },
      {
        path: 'entreprise-details/:id',
        component: EntrepriseDetailsComponent,
        title: 'Entreprise Details',
        canActivate: [AdminGuard]
      },
      {
        path: 'Stock',
        component: StockComponent
      },
      {
        path: 'Client',
        component: ClientComponent,
        title: 'Gestion des Clients',
        canActivate: [AuthGuard]
      },
      {
        path: 'Devis/nouveau',
        component: DevisCreateComponent,
        title: 'Créer un Devis',
        canActivate: [AuthGuard]
      },
      {
        path: 'Devis',
        component: DevisComponent,
        title: 'Gestion des Devis',
        canActivate: [AuthGuard]
      },
      {
        path: 'ImprimerDevis/:id',
        component: ImprimerDevisComponent,
        title: 'Imprimer Devis',
        canActivate: [AuthGuard]
      }
    ]
  },
  // fallback to home or 404
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
