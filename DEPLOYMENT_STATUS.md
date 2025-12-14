# Estado Actual del Deployment - Rano App

**Fecha:** 2025-12-14  
**Servidor:** 137.184.59.141

---

## ✅ Lo que ESTÁ funcionando

- **Servicios corriendo:** Frontend (puerto 4000), Backend (puerto 4001), PostgreSQL (puerto 5434)
- **Frontend:** Funcionando perfectamente en `http://137.184.59.141:4000`
- **Backend:** Strapi arrancando correctamente
- **Panel Admin:** Accesible en `http://137.184.59.141:4001/admin`
- **Content Types:** VISIBLES en Content-Type Builder (productos, categorías, órdenes, etc.)
- **GitHub Actions:** Configurado y funcionando - auto-deploy en cada push a main
- **Base de datos:** PostgreSQL conectado y funcionando

---

## ❌ Problema Actual

### Error: Rutas de API no cargan en Panel de Permisos

**Síntoma:**

- Al ir a Settings → Roles → Authenticated → Permissions
- Error 500: `Cannot read properties of undefined (reading 'type')`
- Las rutas de los content types no aparecen para configurar permisos

**Causa Raíz:**

- Conflicto entre archivos TypeScript (`.ts`) en `/app/src/` y JavaScript compilados (`.js`) en `/app/dist/`
- El plugin `users-permissions` de Strapi intenta leer rutas pero encuentra `undefined` al mezclar TS/JS

**Stack Trace:**

```
TypeError: Cannot read properties of undefined (reading 'type')
    at /app/node_modules/@strapi/plugin-users-permissions/dist/server/services/users-permissions.js:133:51
```

---

## 🔧 Intentos de Solución Realizados

1. ✅ **Copiar solo schemas JSON** - Content types no aparecían
2. ✅ **Copiar src completo** - Content types aparecen pero rutas fallan
3. ✅ **Eliminar src completamente** - Content types desaparecen
4. ❌ **Copiar src y eliminar archivos .ts** - Error persiste (además, problema de espacio en disco)

---

## 🎯 Problema Adicional Detectado

**"No space left on device"** durante el build de Docker.

**Solución requerida:**

```bash
docker system prune -a --volumes -f
```

---

## 📚 Próximos Pasos (según documentación oficial de Strapi)

### Opción 1: Configurar autoReload en producción

Strapi v5 tiene un nuevo comportamiento de carga de archivos. Necesitamos verificar:

- Configuración de `autoReload` en producción
- Variable `STRAPI_DISABLE_ADMIN_PANEL_BUILD` si está afectando

### Opción 2: Estructura de directorios correcta

Según docs de Strapi v5, en producción debería:

- Usar SOLO archivos compilados de `dist/`
- `src/` NO debería estar presente en producción
- Los schemas deberían estar en `dist/src/api/*/content-types/*/schema.json`

### Opción 3: Revisar configuración de plugins

El plugin `users-permissions` puede requerir configuración específica en `config/plugins.js` para producción.

---

## 📝 Configuración Actual

**Puertos:**

- Frontend: 4000
- Backend: 4001
- PostgreSQL: 5434

**Variables de Entorno:**

- NODE_ENV=production
- Database: PostgreSQL
- Secrets: Generados y configurados

**Deployment:**

- GitHub Actions configurado
- SSH keys en GitHub Secrets
- Auto-deploy funcionando

---

## 🔍 Referencias a Revisar

1. [Strapi v5 Production Guide](https://docs.strapi.io/dev-docs/deployment)
2. [Strapi Docker Deployment](https://docs.strapi.io/dev-docs/installation/docker)
3. [Users-Permissions Plugin Config](https://docs.strapi.io/dev-docs/plugins/users-permissions)
4. [Strapi TypeScript Guide](https://docs.strapi.io/dev-docs/typescript)

**Keywords para buscar:** "strapi v5 production routes", "strapi typescript production", "strapi users-permissions production"
