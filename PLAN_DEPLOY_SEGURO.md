# Plan de Deploy Seguro - Optimización + PWA

## 🎯 Objetivo
Implementar mejoras sin afectar producción, con validación móvil en cada paso.

## 📊 Arquitectura de Ambientes

```
┌─────────────────────────────────────────────────────────┐
│ PRODUCCIÓN (main branch)                                │
│ URL: https://icbfs-dashboard.vercel.app                 │
│ Deploy: Solo cuando merge a main                        │
│ Usuarios: Todos los gerentes (CRÍTICO)                  │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │ merge solo si OK
                           │
┌─────────────────────────────────────────────────────────┐
│ STAGING - Paso 1 (feature/optimizacion-paso1)          │
│ URL: https://icbfs-dashboard-<hash>.vercel.app          │
│ Deploy: Automático al push                              │
│ Validación: Móvil + Desktop                             │
│ Duración: 1-2 días                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ STAGING - PWA (feature/pwa-implementation)              │
│ URL: https://icbfs-dashboard-<hash2>.vercel.app         │
│ Deploy: Automático al push                              │
│ Validación: Móvil + Desktop + Instalación PWA           │
│ Duración: 2-3 días                                       │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Paso a Paso - FASE 1: Optimización (30 min desarrollo + validación)

### 1.1 Crear branch y hacer cambios

```bash
# 1. Crear branch desde main
git checkout main
git pull origin main
git checkout -b feature/optimizacion-paso1

# 2. Hacer cambios (los ejecuto yo con Edit tool)
# - Eliminar console.logs
# - Configurar Terser
# - Optimizar autoSizeAllColumns

# 3. Commit
git add .
git commit -m "Feature: Optimización básica bundle - Paso 1

- Eliminar console.logs de producción (useCubeData.js)
- Configurar Terser para minificación agresiva
- Remover autoSizeAllColumns (performance)
- Optimizar vite.config con drop_console

Beneficios:
- ↓ 10-15% tamaño bundle
- Performance mejorada en carga inicial
- Código más limpio en producción

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Push al branch
git push origin feature/optimizacion-paso1
```

### 1.2 Vercel Auto-Deploy

**Vercel detecta el push y automáticamente:**
1. ✅ Hace build del branch
2. ✅ Crea preview deployment
3. ✅ Genera URL única (ej: `icbfs-dashboard-git-feature-optimizacion-abc123.vercel.app`)
4. ✅ Comenta en GitHub (si tienes integración) con la URL

**Acceder a URL preview:**
- Opción A: GitHub → Pull Request → Vercel bot comment
- Opción B: Vercel Dashboard → Deployments → Buscar branch
- Opción C: CLI: `vercel inspect <deployment-url>`

### 1.3 Validación en Móvil

**Cómo validar:**

```bash
# Obtener URL del preview
vercel ls --scope=<tu-team>

# O desde dashboard Vercel:
# https://vercel.com/<tu-team>/icbfs-dashboard/deployments
```

**Checklist de validación móvil:**

En tu celular (iPhone/Android):
1. ✅ Abrir URL preview en Safari/Chrome
2. ✅ Verificar que carga (debe cargar igual que prod)
3. ✅ Cambiar entre vistas (Categoría → Cliente → SKU)
4. ✅ Aplicar filtros (Mes, Sociedad, EERR)
5. ✅ Revisar Quick Filter
6. ✅ Drill down (click en una fila)
7. ✅ Verificar que NO hay errores en consola
8. ✅ Comparar velocidad vs producción (debe sentirse igual o mejor)

**Métricas a medir:**
```javascript
// Abrir DevTools en móvil:
// Chrome Android: chrome://inspect
// Safari iOS: Conectar a Mac → Safari → Develop

// Verificar bundle size en Network tab
// ANTES: ag-grid-*.js = 2.0 MB
// DESPUÉS: ag-grid-*.js = ~1.8 MB (↓10%)
```

### 1.4 Deploy a Producción (si OK)

```bash
# Si validación móvil es exitosa:
git checkout main
git merge feature/optimizacion-paso1
git push origin main

# Vercel auto-deploya a producción
# Esperar ~2 minutos
# Verificar en URL producción
```

---

## 🔧 Paso a Paso - FASE 2: PWA (7 hrs desarrollo + validación)

### 2.1 Crear branch y desarrollo

```bash
# 1. Partir desde main actualizado
git checkout main
git pull origin main
git checkout -b feature/pwa-implementation

# 2. Desarrollo PWA (7 hrs)
# - Service Worker
# - Manifest.json
# - Cache strategy
# - Icons
# - Testing local

# 3. Commits incrementales
git add public/sw.js public/manifest.json
git commit -m "feat: Service Worker básico con cache de assets"
git push origin feature/pwa-implementation

git add src/hooks/useCubeDataWithCache.js
git commit -m "feat: Hook cache-aware para Cube.js queries"
git push origin feature/pwa-implementation

# ... etc
```

### 2.2 Validación PWA en Móvil (CRÍTICO)

**Vercel auto-genera URL preview, pero PWA requiere validación especial:**

#### A. Validación en Desktop (primero)

```bash
# 1. Abrir preview URL en Chrome
# 2. Abrir DevTools → Application tab
# 3. Verificar:
#    ✅ Service Worker: Registered
#    ✅ Manifest: Valid
#    ✅ Cache Storage: Contiene assets
#    ✅ Offline: Funciona sin red

# 4. Lighthouse audit
# Chrome DevTools → Lighthouse → PWA
# Score esperado: >80
```

#### B. Validación en Móvil (segundo)

**iPhone (Safari):**
```
1. Abrir preview URL en Safari iOS
2. Tap botón "Compartir"
3. Buscar "Agregar a pantalla de inicio"
4. Verificar:
   ✅ Icono aparece en home screen
   ✅ Al abrir, se ve fullscreen (sin Safari UI)
   ✅ Splash screen aparece
   ✅ Cache funciona (cambiar vistas rápido)
```

**Android (Chrome):**
```
1. Abrir preview URL en Chrome Android
2. Banner "Instalar app" debe aparecer
   (o menú → "Instalar aplicación")
3. Instalar
4. Verificar:
   ✅ Icono en launcher
   ✅ Abre standalone
   ✅ Cache funciona
   ✅ Puede trabajar offline (UI al menos)
```

#### C. Validación de Cache de Data

**Test manual:**
```
1. Abrir preview en móvil
2. Vista "Categoría" → Anotar tiempo de carga (~1 seg)
3. Cambiar a "Cliente" → Anotar tiempo (~1 seg)
4. VOLVER a "Categoría" → Debe ser <0.2 seg ✅ (cache hit)
5. Cambiar a "SKU" → ~1 seg
6. VOLVER a "Cliente" → <0.2 seg ✅ (cache hit)
7. Esperar 1 hora (o cambiar hora del sistema)
8. Volver a "Categoría" → ~1 seg (cache expirado, nueva query)
```

**Checklist completo:**
```
□ Service Worker registrado
□ Manifest válido
□ Iconos correctos (192x192, 512x512)
□ Instalable en iOS
□ Instalable en Android
□ Cache de assets funciona
□ Cache de data funciona
□ Cache expira correctamente (1 hora)
□ Update prompt funciona
□ Offline graceful degradation
□ Performance mejorada (2da visita)
□ Sin errores en consola
□ Lighthouse PWA score >80
```

### 2.3 Deploy a Producción

**Solo si TODAS las validaciones pasan:**

```bash
# Crear Pull Request en GitHub
gh pr create --title "Feature: PWA con cache inteligente" \
  --body "Implementación completa de PWA con cache de data por hora.

## Cambios
- Service Worker con estrategia cache-first para assets
- Cache de queries Cube.js con TTL de 1 hora
- Manifest.json para instalación
- Iconos y splash screens
- Update prompt para nuevas versiones

## Validación
✅ Desktop Chrome - OK
✅ Mobile Safari iOS - OK
✅ Mobile Chrome Android - OK
✅ Lighthouse PWA score: 92
✅ Cache funciona correctamente
✅ Instalación verificada

## Beneficios
- 50x más rápido en visitas repetidas
- Instalable como app nativa
- Mejor UX en móvil
- Menos carga en servidor Cube.js"

# Esperar aprobación (o auto-aprobar si eres tú solo)
gh pr merge --squash

# Vercel auto-deploya a producción
```

---

## 🔥 Rollback Plan (si algo sale mal)

### Si hay problema en Preview:
```bash
# Simplemente NO hacer merge
# Seguir trabajando en el branch
# Preview se actualiza con cada push
```

### Si hay problema en Producción (post-merge):
```bash
# Opción A: Revert del commit
git revert HEAD
git push origin main
# Vercel auto-deploya versión anterior

# Opción B: Desde Vercel Dashboard
# Deployments → Buscar deployment anterior → "Promote to Production"
# Click → Rollback instantáneo
```

---

## 📱 Cómo Compartir Preview URL para Validación

### Opción 1: QR Code (más fácil)

```bash
# Generar QR de la preview URL
# Usar: https://www.qr-code-generator.com/
# O desde terminal:
npx qrcode-terminal https://tu-preview-url.vercel.app

# Escanear con celular → Abre directo
```

### Opción 2: Link corto

```bash
# Si URL preview es muy larga:
# https://icbfs-dashboard-git-feature-pwa-abc123xyz.vercel.app

# Usar acortador:
# https://bit.ly/icbfs-pwa-test
```

### Opción 3: Slack/Email

```
Para equipo:
"Preview PWA listo para validar en móvil:
📱 iOS: <URL>
🤖 Android: <URL>

Por favor probar:
1. Instalar en pantalla inicio
2. Navegar entre vistas
3. Verificar velocidad

Feedback en #dev antes de viernes"
```

---

## 🎯 Timeline Realista

### Semana 1

**Lunes AM (2 hrs):**
- [ ] Crear branch feature/optimizacion-paso1
- [ ] Implementar Paso 1 (console.logs, terser, etc)
- [ ] Push → Vercel preview auto-deploy
- [ ] Validar en desktop

**Lunes PM (1 hr):**
- [ ] Validar preview en móvil (iPhone + Android)
- [ ] Si OK → Merge a main
- [ ] Verificar en producción

**Martes-Miércoles (7 hrs):**
- [ ] Crear branch feature/pwa-implementation
- [ ] Implementar Service Worker
- [ ] Implementar cache strategy
- [ ] Manifest + icons
- [ ] Commits incrementales → Preview se actualiza
- [ ] Testing local

**Jueves (3 hrs):**
- [ ] Validación exhaustiva en preview móvil
- [ ] Ajustes basados en testing
- [ ] Push fixes → Preview se actualiza

**Viernes (1 hr):**
- [ ] Validación final
- [ ] Pull Request
- [ ] Merge a main
- [ ] Monitorear producción

---

## ✅ Ventajas de Este Approach

1. **Cero riesgo producción** - Main siempre estable
2. **Validación real en móvil** - Preview URL accesible desde cualquier device
3. **Iteración rápida** - Push → Auto-deploy → Test → Repeat
4. **Fácil rollback** - Desde Vercel dashboard (1 click)
5. **Historial claro** - Cada feature en su branch
6. **CI/CD gratis** - Vercel maneja todo automáticamente

---

## 🔍 Monitoreo Post-Deploy

### Después del merge a producción:

```javascript
// En src/main.jsx - Agregar analytics básico

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('✅ SW registered:', registration);

        // Track PWA install
        window.addEventListener('appinstalled', () => {
          console.log('📱 PWA installed');
          // Opcional: Enviar a analytics
          // fetch('/api/analytics', {
          //   method: 'POST',
          //   body: JSON.stringify({ event: 'pwa_installed' })
          // });
        });
      },
      (error) => {
        console.error('❌ SW registration failed:', error);
      }
    );
  });
}
```

### Métricas a revisar (Vercel Analytics):

1. **Performance**
   - Time to First Byte (TTFB)
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)

2. **Engagement**
   - Usuarios activos diarios
   - Sesiones promedio
   - Tiempo en sitio

3. **PWA**
   - Instalaciones (si trackeas)
   - Cache hit rate (via Service Worker logs)

---

## 🚨 FAQs

**Q: ¿Puedo tener múltiples preview deployments activos?**
A: Sí, Vercel mantiene un preview por branch. Puedes tener feature/paso1 y feature/pwa al mismo tiempo.

**Q: ¿Preview deployments expiran?**
A: No, permanecen mientras exista el branch. Se eliminan al borrar el branch.

**Q: ¿Puedo proteger preview con password?**
A: Sí, en Vercel → Project Settings → Deployment Protection. Útil si hay data sensible.

**Q: ¿Cómo pruebo PWA en iPhone sin certificado HTTPS?**
A: Vercel auto-provee HTTPS en todos los deployments (prod + preview). No necesitas configurar nada.

**Q: ¿Y si quiero que otros validen el preview?**
A: Comparte la URL preview. Vercel es público por defecto (o configura auth si prefieres).
