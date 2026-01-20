# Backend Guidelines

Purpose: buenas prácticas aplicables a cualquier backend.

## Arquitectura

- Separar capas: rutas/controladores, servicios, repositorios.
- Interfaces claras para dependencias externas; inyectar por constructor.

## Seguridad

- Validar y sanear todos los inputs.
- No exponer secretos en código ni logs.
- Usar HTTPS y tokens con expiración; rotación de claves.

## Performance

- Cachear respuestas idempotentes; TTL por endpoint.
- Evitar operaciones bloqueantes en el hilo principal.
- Paginación y streams para grandes volúmenes.

## Base de Datos

- Migraciones versionadas; no cambios manuales en prod.
- Índices obligatorios en campos de búsqueda frecuentes.
- Transacciones para operaciones que involucren múltiples tablas/entidades.

## Validación

- Esquemas de validación (Zod/Joi) en la entrada de cada endpoint.
- Sanitización de strings para evitar XSS/Injection.
- Tipado estricto en toda la cadena de datos.

## Testing

- Tests unitarios por módulo; tests de integración para endpoints críticos.
- CI: lint, tests, build y análisis estático.

## Observabilidad

- Logs estructurados JSON con request_id.
- Métricas: latencia, errores por endpoint, throughput.
