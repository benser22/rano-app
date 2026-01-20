# Skill Logging

Purpose: reglas para logs claros y útiles.

Rules:

- Logs en JSON con campos: timestamp; level; service; request_id; message; context.
- Niveles: debug (local), info (producción), warn, error.
- No incluir PII ni secretos; aplicar redaction.
- Propagar request_id en headers y logs.
  Examples:
- {"timestamp":"...","level":"info","service":"auth","request_id":"...","message":"user login","context":{"user_id":123}}
