# Crear solicitud — ejemplos request/response

Base URL desarrollo: `http://localhost:3000/api` (ver `src/environments/environment.ts`).
Crear siempre deja la solicitud en `PENDIENTE`.

## Crear (201)

```bash
curl -X POST http://localhost:3000/api/solicitudes \
  -H 'Content-Type: application/json' \
  -d '{
    "titulo": "Impresora de contabilidad no imprime",
    "descripcion": "La impresora HP del piso 3 marca error de tóner y no responde.",
    "solicitanteNombre": "Laura Díaz",
    "solicitanteEmail": "laura.diaz@empresa.com",
    "solicitanteArea": "Contabilidad",
    "tipoServicioId": 1,
    "prioridad": "ALTA"
  }'
```

Response `201`:

```json
{
  "data": {
    "id": 1,
    "codigo": "SOL-000001",
    "titulo": "Impresora de contabilidad no imprime",
    "estado": "PENDIENTE",
    "prioridad": "ALTA"
  }
}
```

## Error de validación (400)

Request con `titulo` de 3 caracteres:

```json
{
  "error": {
    "codigo": "VALIDACION",
    "mensaje": "Error de validación.",
    "detalles": [{ "campo": "titulo", "mensaje": "El título debe tener al menos 5 caracteres." }]
  }
}
```

El frontend pinta cada `detalles[].campo` como error inline del control (`setErroresServidor`)
además del toast de advertencia.

## Conflicto de estado (409)

Editar una solicitud que ya no está en `PENDIENTE`:

```json
{
  "error": {
    "codigo": "CONFLICTO",
    "mensaje": "Solo se puede editar en estado PENDIENTE."
  }
}
```

El frontend evita este caso deshabilitando el botón editar fuera de `PENDIENTE`
(`puedeEditar` en `models/solicitud.ts`); si igual llega, el interceptor muestra el
mensaje de negocio en un toast de error.
