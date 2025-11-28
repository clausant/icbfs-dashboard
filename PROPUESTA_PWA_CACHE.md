# Propuesta: PWA con Cache Inteligente de Data

## 🎯 Objetivo
Cachear tanto UI como data del dashboard, con invalidación automática cada hora.

## 📊 Beneficios Concretos

### Performance
- **Primera carga**: 5-8 seg (igual que ahora)
- **Cargas subsecuentes**: 0.1-0.3 seg (50x más rápido)
- **Cambios de vista**: Instantáneos (data ya en cache)
- **Navegación**: Sin delays entre niveles (cliente → categoría → sku)

### Experiencia de Usuario
```
Usuario típico (gerente revisando KPIs):
9:15 - Abre dashboard "Categoría" → 0.2 seg ✅
9:20 - Revisa "Cliente" → 0.1 seg ✅
9:25 - Vuelve a "Categoría" → 0.05 seg ✅
9:40 - Revisa "SKU" → 0.1 seg ✅
10:00 - Data se actualiza automáticamente
10:05 - Abre "Categoría" → 1 seg (nueva data) ✅

SIN PWA: Cada vista = 1 seg de espera
CON PWA: Solo primera = 1 seg, resto instantáneo
```

## 🏗️ Arquitectura de Cache

### Estrategia de 3 Capas

#### Capa 1: Assets Estáticos (Cache First)
```javascript
// Service Worker cachea indefinidamente:
- /index.html
- /ag-grid-*.js
- /react-vendor-*.js
- /level-definitions-*.js
- /logo-icbfs.png

Invalidación: Solo cuando hay nueva versión del app
```

#### Capa 2: Data de Cube.js (Cache con TTL de 1 hora)
```javascript
// Estrategia: Stale-While-Revalidate con tiempo

Cache Key: Query + Filtros + Timestamp (hora)
Ejemplo:
- "categoria_2024-11_all_9" → Data de 9:00-9:59
- "categoria_2024-11_all_10" → Data de 10:00-10:59

Comportamiento:
1. Usuario hace query
2. Service Worker busca en cache con timestamp actual
3. Si existe (misma hora) → Retorna instantáneo
4. Si no existe → Fetch de Cube.js + guarda con timestamp
5. Cache expira automáticamente en siguiente hora
```

#### Capa 3: Configuración de Usuario (IndexedDB)
```javascript
// Guardar preferencias localmente:
- Último mes seleccionado
- Última vista activa
- Sociedad filtrada
- Estado EERR toggle
- Header visible/oculto

Beneficio: App se abre exactamente como la dejó
```

## 🔧 Implementación Técnica

### Service Worker Strategy
```javascript
// public/sw.js

const CACHE_VERSION = 'v1';
const DATA_CACHE_HOURS = 1; // Cache de data válido 1 hora

// Obtener hora actual (sin minutos/segundos)
const getCurrentHour = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
};

// Cache de consultas Cube.js
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Detectar queries a Cube.js
  if (url.hostname.includes('cube') || url.pathname.includes('/cubejs-api/')) {
    event.respondWith(
      caches.open('data-cache-' + getCurrentHour()).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            console.log('✅ Cache HIT:', event.request.url);
            return response; // Retornar cache si existe
          }

          // No hay cache, hacer fetch
          return fetch(event.request).then((fetchResponse) => {
            cache.put(event.request, fetchResponse.clone());
            console.log('📥 Cache MISS, guardando:', event.request.url);
            return fetchResponse;
          });
        });
      })
    );
  }
});

// Limpiar caches viejos cada hora
setInterval(() => {
  const currentHour = getCurrentHour();
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      if (cacheName.startsWith('data-cache-') && !cacheName.includes(currentHour)) {
        caches.delete(cacheName);
        console.log('🗑️ Cache eliminado:', cacheName);
      }
    });
  });
}, 60 * 60 * 1000); // Cada hora
```

### Hook optimizado: useCubeData con cache
```javascript
// src/hooks/useCubeDataWithCache.js

export const useCubeDataWithCache = (query, isQueryReady = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    if (!isQueryReady) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Service Worker maneja el cache automáticamente
    cubeApi
      .load(query)
      .then((resultSet) => {
        const tableData = resultSet.tablePivot();
        setData(tableData);
        setLoading(false);

        // Detectar si vino del cache (rápido < 100ms)
        const loadTime = performance.now();
        setFromCache(loadTime < 100);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, [JSON.stringify(query), isQueryReady]);

  return { data, loading, fromCache };
};
```

### Indicador visual de cache
```javascript
// En ProyeccionView.jsx
const { data: rowData, loading, fromCache } = useCubeDataWithCache(query, true);

// Mostrar badge si data viene del cache
{fromCache && (
  <span style={{ color: 'green', fontSize: '12px' }}>
    ⚡ Cache (actualizado a las {new Date().getHours()}:00)
  </span>
)}
```

## 📈 Métricas de Éxito

### Antes (sin PWA cache):
```
- Primera carga: 5-8 seg
- Cambio de vista: 1-2 seg cada vez
- 20 vistas por sesión: ~30 seg de loading total
- Sensación: "Lento"
```

### Después (con PWA cache):
```
- Primera carga: 5-8 seg (igual)
- Cambio de vista: 0.1 seg (cache hit)
- 20 vistas por sesión: ~2 seg de loading total (↓93%)
- Sensación: "Instantáneo, nativo"
```

## ⚠️ Consideraciones

### 1. Staleness de Data
**Problema**: Usuario puede ver data de hace 59 minutos
**Solución**:
- Mostrar timestamp de última actualización
- Botón "🔄 Forzar actualización"
- Badge visual indicando cache

### 2. Tamaño del Cache
**Problema**: Cache puede crecer mucho
**Solución**:
- Límite de 50 MB (aprox 500 queries)
- LRU eviction (eliminar menos usados)
- Limpiar al cerrar app

### 3. Actualizaciones de Estructura
**Problema**: Nueva columna (ej: PFocoProy$) no se ve
**Solución**:
- Service Worker version bump
- Limpiar cache automáticamente
- Prompt: "Nueva versión disponible"

## 🎯 Plan de Implementación

### Fase 1: Service Worker Básico (1-2 hrs)
- [ ] Crear public/sw.js
- [ ] Registrar en main.jsx
- [ ] Cache de assets estáticos
- [ ] Testing básico

### Fase 2: Cache de Data (2-3 hrs)
- [ ] Implementar estrategia por hora
- [ ] Modificar useCubeData
- [ ] Invalidación automática
- [ ] Testing de diferentes vistas

### Fase 3: PWA Manifest (1 hr)
- [ ] Crear manifest.json
- [ ] Iconos en diferentes tamaños
- [ ] Splash screen
- [ ] Testing instalación

### Fase 4: UX Refinements (1 hr)
- [ ] Indicador de cache
- [ ] Botón forzar recarga
- [ ] Timestamp última actualización
- [ ] Update prompt

**TOTAL: 5-7 horas** (puede ser menos con experiencia)

## 💰 ROI Estimado

### Usuarios: 10 gerentes
### Uso promedio: 30 aperturas/día/usuario

```
Ahorro por usuario:
- Sin PWA: 30 vistas x 1.5 seg = 45 seg/día
- Con PWA: 30 vistas x 0.1 seg = 3 seg/día
- Ahorro: 42 seg/día/usuario

Ahorro total:
- 10 usuarios x 42 seg = 420 seg/día = 7 minutos/día
- Por mes (20 días): 140 minutos = 2.3 horas ahorradas
- Por año: 28 horas de productividad recuperadas

Inversión: 7 horas desarrollo
Break-even: ~3 meses
```

## ✅ Recomendación Final

**SÍ, implementar PWA con cache de data es MUY RECOMENDABLE** dado que:

1. ✅ Data se actualiza cada hora (perfecto para cache)
2. ✅ Múltiples consultas a misma data
3. ✅ Navegación entre vistas frecuente
4. ✅ ROI positivo en 3 meses
5. ✅ UX dramáticamente mejor

**Prioridad: ALTA**

### Orden sugerido:
1. **Optimización bundle (Paso 1)** - 30 min → Deploy
2. **PWA con cache** - 7 hrs → Deploy
3. **Monitorear métricas** - 1 semana
4. **Ajustes basados en uso real**
