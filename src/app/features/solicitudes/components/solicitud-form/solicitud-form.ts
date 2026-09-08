import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import type { ApiErrorDetalle } from '../../../../core/models/api-error';
import type {
  CrearSolicitud,
  EditarSolicitud,
  Prioridad,
  Solicitud,
  TipoServicio,
} from '../../models/solicitud';

const PRIORIDADES: Prioridad[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

/** Formulario crear/editar en `p-dialog`. Dumb: valida y emite, no llama al API. */
@Component({
  selector: 'ti-solicitud-form',
  imports: [ReactiveFormsModule, Button, Dialog, InputText, Message, Select, Textarea],
  templateUrl: './solicitud-form.html',
  styleUrl: './solicitud-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudForm {
  readonly visible = model<boolean>(false);
  /** `null` = crear, con valor = editar. */
  readonly solicitud = input<Solicitud | null>(null);
  readonly tipos = input<TipoServicio[]>([]);
  readonly saving = input<boolean>(false);
  readonly guardar = output<CrearSolicitud | EditarSolicitud>();

  protected readonly prioridades = PRIORIDADES;
  protected readonly esEdicion = computed(() => this.solicitud() !== null);
  protected readonly editable = computed(() => {
    const s = this.solicitud();
    return !s || s.estado === 'PENDIENTE';
  });

  private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    solicitanteNombre: ['', [Validators.required, Validators.maxLength(150)]],
    solicitanteEmail: ['', [Validators.required, Validators.email]],
    solicitanteArea: ['', [Validators.maxLength(100)]],
    tipoServicioId: [null as number | null, [Validators.required, Validators.min(1)]],
    prioridad: ['MEDIA' as Prioridad, [Validators.required]],
  });

  constructor() {
    // Solo inicializa al ABRIR el diálogo o al cambiar de solicitud.
    // Sin esta guarda, cualquier re-evaluación con el diálogo abierto
    // hacía form.reset() y borraba lo digitado (bug al usar el p-select).
    let abiertoAntes = false;
    let solicitudAnterior: number | 'nueva' | null = null;
    effect(() => {
      const abierto = this.visible();
      const actual = this.solicitud();
      const claveActual: number | 'nueva' | null = !abierto ? null : actual ? actual.id : 'nueva';
      const recienAbierto = abierto && !abiertoAntes;
      if (abierto && (recienAbierto || claveActual !== solicitudAnterior)) {
        untracked(() => this.inicializar(actual));
      }
      abiertoAntes = abierto;
      solicitudAnterior = claveActual;
    });
  }

  private inicializar(s: Solicitud | null): void {
    if (s) {
      this.form.reset({
        titulo: s.titulo,
        descripcion: s.descripcion,
        solicitanteNombre: s.solicitanteNombre,
        solicitanteEmail: s.solicitanteEmail,
        solicitanteArea: s.solicitanteArea ?? '',
        tipoServicioId: s.tipoServicio?.id ?? null,
        prioridad: s.prioridad,
      });
    } else {
      this.form.reset({ solicitanteArea: '', tipoServicioId: null, prioridad: 'MEDIA' });
    }
  }

  /** Pinta errores 400 VALIDACION del backend como errores inline del campo. */
  setErroresServidor(detalles: readonly ApiErrorDetalle[]): void {
    for (const detalle of detalles) {
      if (!detalle.campo) continue;
      const control = this.form.get(detalle.campo);
      if (control) control.setErrors({ server: detalle.mensaje });
    }
  }

  protected onGuardar(): void {
    if (!this.editable()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (this.esEdicion()) {
      const dto: EditarSolicitud = {
        titulo: v.titulo ?? undefined,
        descripcion: v.descripcion ?? undefined,
        solicitanteNombre: v.solicitanteNombre ?? undefined,
        solicitanteEmail: v.solicitanteEmail ?? undefined,
        solicitanteArea: v.solicitanteArea ?? undefined,
        tipoServicioId: v.tipoServicioId ?? undefined,
        prioridad: v.prioridad ?? undefined,
      };
      this.guardar.emit(dto);
    } else {
      const dto: CrearSolicitud = {
        titulo: v.titulo ?? '',
        descripcion: v.descripcion ?? '',
        solicitanteNombre: v.solicitanteNombre ?? '',
        solicitanteEmail: v.solicitanteEmail ?? '',
        solicitanteArea: v.solicitanteArea || undefined,
        tipoServicioId: v.tipoServicioId ?? 0,
        prioridad: v.prioridad ?? 'MEDIA',
      };
      this.guardar.emit(dto);
    }
  }
}
