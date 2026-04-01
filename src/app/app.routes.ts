import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const PRIVATE_ROBOTS = 'noindex, nofollow';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        title: 'Accedi a TimeOffly | Gestione ferie e permessi',
        data: {
          seo: {
            description:
              'Accedi a TimeOffly per gestire ferie, permessi e approvazioni con dashboard, calendario condiviso e workflow ordinati.',
            robots: 'index, follow',
            canonicalPath: '/auth/login'
          }
        },
        loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        title: 'Registrati a TimeOffly | Gestione ferie e permessi',
        data: {
          seo: {
            description:
              'Crea il tuo account TimeOffly e centralizza ferie, permessi e approvazioni in un unico workspace.',
            robots: 'index, follow',
            canonicalPath: '/auth/register'
          }
        },
        loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layout/app-shell.component').then(m => m.AppShellComponent),
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard ferie e permessi | TimeOffly',
        data: {
          seo: {
            description: 'Monitora saldo ferie, richieste e approvazioni dalla dashboard personale di TimeOffly.',
            robots: PRIVATE_ROBOTS,
            canonicalPath: '/dashboard'
          }
        },
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'ferie',
        title: 'Richieste ferie | TimeOffly',
        data: {
          seo: {
            description: 'Gestisci richieste ferie e permessi, filtri e stato delle assenze dalla tua area TimeOffly.',
            robots: PRIVATE_ROBOTS,
            canonicalPath: '/ferie'
          }
        },
        loadComponent: () => import('./pages/ferie/ferie.component').then(m => m.FerieComponent)
      },
      {
        path: 'calendario',
        title: 'Calendario assenze | TimeOffly',
        data: {
          seo: {
            description: 'Consulta calendario condiviso, festivita e pianificazione assenze in TimeOffly.',
            robots: PRIVATE_ROBOTS,
            canonicalPath: '/calendario'
          }
        },
        loadComponent: () => import('./pages/calendario/calendario.component').then(m => m.CalendarioComponent)
      },
      {
        path: 'team',
        canActivate: [RoleGuard],
        title: 'Team e coordinamento | TimeOffly',
        data: {
          roles: ['MANAGER', 'ADMIN'],
          seo: {
            description: 'Analizza disponibilita del team e pianifica ferie e permessi con visibilita centralizzata.',
            robots: PRIVATE_ROBOTS,
            canonicalPath: '/team'
          }
        },
        loadComponent: () => import('./pages/team/team.component').then(m => m.TeamComponent)
      },
      {
        path: 'approvals',
        canActivate: [RoleGuard],
        title: 'Approvazioni ferie | TimeOffly',
        data: {
          roles: ['MANAGER', 'ADMIN'],
          seo: {
            description: 'Gestisci e approva richieste ferie e permessi con workflow dedicati per manager e admin.',
            robots: PRIVATE_ROBOTS,
            canonicalPath: '/approvals'
          }
        },
        loadComponent: () => import('./pages/approvals/approvals.component').then(m => m.ApprovalsComponent)
      },
      {
        path: 'admin',
        canActivate: [RoleGuard],
        title: 'Amministrazione piattaforma | TimeOffly',
        data: {
          roles: ['ADMIN'],
          seo: {
            description: 'Supervisiona utenti, configurazioni e operativita della piattaforma TimeOffly.',
            robots: PRIVATE_ROBOTS,
            canonicalPath: '/admin'
          }
        },
        loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
      },
      {
        path: 'profilo',
        title: 'Profilo utente | TimeOffly',
        data: {
          seo: {
            description: 'Aggiorna dati account, preferenze e riepilogo personale dal profilo TimeOffly.',
            robots: PRIVATE_ROBOTS,
            canonicalPath: '/profilo'
          }
        },
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
