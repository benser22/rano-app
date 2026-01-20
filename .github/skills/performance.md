# Skill Performance

Purpose: patrones para mantener latencia y uso de recursos bajos.

Rules:

- Cache in-memory o Redis para respuestas costosas; TTL por endpoint.
- Evitar N+1 queries; usar joins o batch fetching.
- Offload de tareas pesadas a workers/queues.
- Limitar tamaño de payload; permitir fields seleccionables.
  Examples:
- Endpoint /items?fields=id,name&page=1&limit=20
- Usar índices en DB para queries frecuentes.
