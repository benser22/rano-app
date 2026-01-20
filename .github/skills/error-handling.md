# Skill Error Handling

Purpose: manejo consistente de errores.

Rules:

- Capturar errores en cada capa y mapear a respuestas HTTP claras.
- Respuesta pública mínima: { "error": "mensaje corto", "code": "ERR_CODE" }.
- No exponer stack traces en producción.
- Registrar stack trace internamente con request_id.
  Examples:
- 400 Bad Request para validación; 500 para errores internos con code.
- Usar códigos de error consistentes (e.g., ERR_VALIDATION, ERR_INTERNAL).
- Implementar middleware global para manejo de errores.
- Probar escenarios de error en tests unitarios e integración.
