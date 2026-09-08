import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'solicitudes' },
  {
    path: 'solicitudes',
    loadComponent: () =>
      import('./features/solicitudes/pages/solicitudes-list/solicitudes-list').then((m) => m.SolicitudesList),
  },
  {
    path: 'solicitudes/:id',
    loadComponent: () =>
      import('./features/solicitudes/pages/solicitud-detalle/solicitud-detalle').then((m) => m.SolicitudDetalle),
  },
  {
    path: 'maestros',
    loadComponent: () =>
      import('./features/catalogos/pages/catalogos-list/catalogos-list').then((m) => m.CatalogosList),
  },
  { path: '**', redirectTo: 'solicitudes' },
];
