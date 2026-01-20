# Copilot Instructions

Purpose: reglas concisas que el agente debe aplicar por defecto en este repo.

Priority: **Obligatorio** > **Sugerido** > **Opcional** (ver meta.md).

## Reglas estrictas

- **No ejecutar ni proponer comandos** de terminal, shell o scripts salvo que se solicite explícitamente.
- **Máximo 5 líneas por respuesta** salvo que el usuario pida detalles.
- **No asumir intención** ni tomar iniciativa no solicitada.
- **No proponer agentes, workflows o automatizaciones** sin autorización explícita.
- **No incluir comentarios en el código** salvo que se solicite.
- **No refactorizar, renombrar, cambiar arquitectura, librerías o configs** sin petición explícita.
- **Preguntar brevemente** si algo es ambiguo.
- **Priorizar salida mínima, correcta y lista para producción.**

## Buenas prácticas de código

- Mentalidad estricta de TypeScript: evitar `any` y `unknown`.
- Componentes y funciones pequeñas con responsabilidad única.
- Evitar abstracciones prematuras y sobreingeniería.
- Priorizar legibilidad y simplicidad sobre ingenio.
- No adivinar requisitos; detenerse y preguntar si no está claro.

## Formato de respuesta

- Responder siempre en castellano.
- Preferir listas, ejemplos mínimos y snippets reproducibles.
- Indicar lenguaje en bloques de código.
- Si hay opciones, proponer **máximo 2** y marcar la más segura.
