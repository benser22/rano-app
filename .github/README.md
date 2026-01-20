# 🚀 GitHub Backend Template

[![Template](https://img.shields.io/badge/Template-Ready-brightgreen)](https://github.com/benser22/github-backend-template)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](https://github.com/benser22/github-backend-template/releases)

Template con configuraciones de GitHub Actions, instrucciones de Copilot y guías de backend para nuevos proyectos.

## 📋 ¿Qué incluye?

- **`copilot-instructions.md`**: Reglas estrictas para el agente de IA
- **`skills/`**: Guías detalladas de Logging, Errores y Performance
- **`backend-guidelines.md`**: Arquitectura y seguridad backend
- **`dependabot.yml`**: Actualización automática de dependencias
- **`workflows/`**: Workflows de CI (para copiar a proyectos)
- **`meta.md`**: Prioridades y uso de estos archivos

## 🎯 Uso

### Opción 1: Usar como template (Recomendado)

1. Click en **"Use this template"** → **"Create a new repository"**
2. La carpeta `.github` se creará automáticamente en tu nuevo repo
3. Personaliza según las necesidades de tu proyecto

### Opción 2: Copiar manualmente

```bash
cd tu-proyecto
git clone https://github.com/benser22/github-backend-template.git temp
cp -r temp/.github .
rm -rf temp
```

## 🔄 Mantener actualizado

### Agregar template como remote

```bash
git remote add template https://github.com/benser22/github-backend-template.git
git fetch template
```

### Actualizar desde el template

```bash
git fetch template
git merge template/main --allow-unrelated-histories
# Resolver conflictos si es necesario
```

### Sincronización selectiva

```bash
# Solo actualizar un archivo específico
git checkout template/main -- .github/copilot-instructions.md
```

## 📦 Versionado

- Ver [CHANGELOG.md](CHANGELOG.md) para historial de cambios
- Releases con tags semánticos: `v1.0.0`, `v1.1.0`, etc.
- Consulta la versión actual en el badge superior

## 🎨 Personalización

Después de usar el template:

1. Revisa `meta.md` para entender prioridades
2. Personaliza `copilot-instructions.md` según tu stack
3. Agrega workflows específicos en `workflows/`
4. Actualiza `dependabot.yml` según tu gestor de paquetes

---

**Objetivo**: Consistencia, performance y seguridad mínima por defecto.
