# Pharmavig MVP — Plan de Pruebas Manuales

## Ambiente de prueba
- **Frontend**: http://localhost:5173
- **Backend**: https://pharmavig-mvp-production.up.railway.app/api/v1
- **Base de datos**: PostgreSQL en Railway (seed con datos de prueba)

---

## Test Suite 1: Dashboard (Cola de hallazgos)

### TC-001: Cargar dashboard e inspeccionar KPIs
**Pasos:**
1. Navegar a http://localhost:5173
2. Verificar que se carga la página sin errores
3. Validar que se muestren 4 KPIs: Pendientes (47), En revisión (12), Conflictos (3), Aprobados 7d (184)
4. Verificar que el sidebar muestre "Dashboard" como activo

**Resultado esperado:** ✅ Dashboard carga, muestra datos correctos, sidebar activo

**Criterios de aceptación:**
- [ ] No hay errores en consola
- [ ] Los números de KPIs son visibles
- [ ] Las tarjetas tienen los colores correctos (naranja, amarillo, rojo, verde)
- [ ] La alerta de "Resumen del agente" aparece con tono teal

---

### TC-002: Buscar medicamento en búsqueda activa
**Pasos:**
1. En el hero section, hacer clic en el input "¿Qué medicamento quieres investigar hoy?"
2. Escribir "Atorvastatina"
3. Hacer clic en botón "Investigar" (botón teal con icono sparkle)
4. Verificar respuesta

**Resultado esperado:** ✅ Se busca el medicamento (en demo: muestra alerta)

**Criterios de aceptación:**
- [ ] El input acepta texto
- [ ] El botón "Investigar" responde al clic
- [ ] Se muestra feedback (alerta, navegación, o cambio de estado)

---

### TC-003: Interactuar con chips de medicamentos recientes
**Pasos:**
1. En la sección "Recientes:", hacer clic en "Metformina"
2. Verificar que el input de búsqueda se actualiza con el texto
3. Hacer clic en otro chip (ej. "Warfarina")

**Resultado esperado:** ✅ Los chips actúan como filtros de búsqueda rápida

**Criterios de aceptación:**
- [ ] El chip es clickeable
- [ ] El input se actualiza con el nombre del medicamento
- [ ] El color del chip cambia (fondo blue-700)

---

### TC-004: Ver tarjetas de hallazgos y confianza
**Pasos:**
1. Scroll down a "Hallazgos prioritarios"
2. Verificar que aparecen 4 tarjetas con hallazgos (Atorvastatina, Metformina, Sertralina, Warfarina)
3. Para cada tarjeta:
   - Verificar badge de estado (review, conflict, pending, review)
   - Verificar barra de confianza (teal)
   - Verificar botones "Aprobar" (green) y "Rechazar" (gray)

**Resultado esperado:** ✅ Se muestran todos los hallazgos con correctamente formateados

**Criterios de aceptación:**
- [ ] 4 tarjetas visibles
- [ ] Badges de estado tienen colores semánticos correctos
- [ ] Barras de confianza muestran % correcto
- [ ] Botones son accesibles

---

### TC-005: Navegar a detalle de un hallazgo
**Pasos:**
1. Hacer clic en cualquier tarjeta de hallazgo (ej. "Atorvastatina")
2. Esperar a que cargue la página de detalle

**Resultado esperado:** ✅ Navega a `/findings/icsr-00482` sin errores

**Criterios de aceptación:**
- [ ] URL cambia a `/findings/icsr-00482`
- [ ] El topbar muestra el título correcto: "Atorvastatina 40 mg · Mialgia severa con CK elevada"
- [ ] El breadcrumb muestra: "Casos / Atorvastatina / ICSR‑00482"
- [ ] No hay errores en consola

---

## Test Suite 2: Finding Detail (Detalle ICSR)

### TC-006: Ver métricas del hallazgo
**Pasos:**
1. En la página de detalle de ICSR-00482
2. Scroll down al grid de 4 métricas

**Resultado esperado:** ✅ Se muestran las 4 métricas: Confianza IA (87%), Casos totales (234), Gravedad media (Grado 3), Ventana (90 días)

**Criterios de aceptación:**
- [ ] Las 4 cajas están visibles
- [ ] Los valores son correctos
- [ ] Los colores son semánticos (teal para confianza, rojo para gravedad)

---

### TC-007: Visualizar evidencia por fuente
**Pasos:**
1. Scroll a sección "Evidencia por fuente"
2. Verificar que aparecen 4 filas: FDA FAERS, EudraVigilance, WHO VigiBase, PubMed

**Para cada fuente, validar:**
- Nombre correcto
- Número de casos
- Severidad (Severa/Moderada)
- Barra de confianza
- Botón "Abrir" (icono external)

**Resultado esperado:** ✅ Tabla de evidencia se muestra completa y ordenada

**Criterios de aceptación:**
- [ ] 4 fuentes visibles
- [ ] Datos coinciden con el mock (FDA FAERS: 118 casos, 92%, Severa)
- [ ] Las barras de confianza tienen longitudes diferentes
- [ ] Los botones "Abrir" son clickeables

---

### TC-008: Ver razonamiento del agente
**Pasos:**
1. Scroll a sección "Razonamiento del agente"
2. Leer la lista de 4 pasos de razonamiento

**Resultado esperado:** ✅ Se muestra la lógica detrás del hallazgo

**Criterios de aceptación:**
- [ ] Los 4 pasos aparecen numerados
- [ ] El texto es legible
- [ ] El icono de sparkle aparece junto al título

---

### TC-009: Ver alerta de conflicto
**Pasos:**
1. En la página de detalle, buscar la sección "Conflicto detectado entre fuentes regulatorias"
2. Verificar que el icono de Split y el badge de "Conflicto" aparecen

**Resultado esperado:** ✅ La alerta de conflicto se destaca con color rojo/naranja

**Criterios de aceptación:**
- [ ] El background es color conflict-50
- [ ] El borde izquierdo es rojo
- [ ] El icono es visible
- [ ] El texto explica la discrepancia

---

### TC-010: Escribir comentario y aprobar un hallazgo
**Pasos:**
1. Scroll al área de comentarios (debajo del h1)
2. Hacer clic en el textarea "Añade tu comentario de revisión..."
3. Escribir: "Reacción bien documentada en FAERS. Aprobado para registro."
4. Hacer clic en botón "Aprobar y firmar" (botón green con icono check)

**Resultado esperado:** ✅ Se envía la aprobación al backend (o muestra toast en demo)

**Criterios de aceptación:**
- [ ] El textarea acepta texto
- [ ] El botón se habilita después de escribir
- [ ] Se muestra toast de éxito o navegación a cola de aprobación
- [ ] No hay errores en consola

---

### TC-011: Navegar entre hallazgos con flechas
**Pasos:**
1. En el hero card, hacer clic en botón "Siguiente" (botón ghost con ArrowR)
2. Verificar que navega al siguiente hallazgo

**Resultado esperado:** ✅ Navega entre hallazgos sin recargar la página

**Criterios de aceptación:**
- [ ] La URL cambia
- [ ] El contenido se actualiza
- [ ] No hay parpadeos ni recargas

---

## Test Suite 3: Approval Queue (Cola de aprobación)

### TC-012: Cargar cola de aprobación
**Pasos:**
1. Hacer clic en "Cola de aprobación" en el sidebar
2. Esperar a que cargue la página

**Resultado esperado:** ✅ Se carga la tabla con 10 hallazgos

**Criterios de aceptación:**
- [ ] URL cambia a `/approval`
- [ ] El topbar muestra "Cola de aprobación · 47 hallazgos pendientes"
- [ ] La tabla muestra 10 filas
- [ ] No hay errores en consola

---

### TC-013: Filtrar por estado
**Pasos:**
1. En la barra de filtros, hacer clic en "Pendiente · 24"
2. Verificar que la tabla se actualiza

**Resultado esperado:** ✅ Solo muestra hallazgos con estado "pending"

**Criterios de aceptación:**
- [ ] El chip cambia de color (blue-700 de fondo)
- [ ] La tabla se filtra
- [ ] Solo aparecen hallazgos con badge "Pendiente"

---

### TC-014: Búsqueda en cola
**Pasos:**
1. En el input de búsqueda, escribir "Atorvastatina"
2. Verificar que se filtra la tabla

**Resultado esperado:** ✅ Solo aparecen filas que coinciden con la búsqueda

**Criterios de aceptación:**
- [ ] El input acepta texto
- [ ] La tabla se actualiza en tiempo real
- [ ] Solo aparecen filas que contienen "Atorvastatina"

---

### TC-015: Seleccionar múltiples hallazgos
**Pasos:**
1. Hacer clic en el checkbox de la primera fila (ICSR-00482)
2. Hacer clic en el checkbox de la segunda fila (ICSR-00481)
3. Verificar que aparece la barra de acciones bulk

**Resultado esperado:** ✅ Aparece barra azul con botones de acción

**Criterios de aceptación:**
- [ ] Los checkboxes se marcan
- [ ] Aparece badge "2 seleccionados"
- [ ] Aparecen botones: "Aprobar todos", "Rechazar", "Asignar…"
- [ ] La barra tiene fondo blue-50

---

### TC-016: Ver SLA en la tabla
**Pasos:**
1. Mirar la columna "SLA" en la tabla
2. Verificar que los tiempos se muestran en rojo, amarillo o gris

**Resultado esperado:** ✅ El SLA se colorea según urgencia

**Criterios de aceptación:**
- [ ] < 24h: rojo (danger-700)
- [ ] 24-48h: amarillo (warn-700)
- [ ] > 48h: gris (text)
- [ ] El icono de Clock aparece

---

### TC-017: Hacer clic en una fila para ver detalle
**Pasos:**
1. Hacer clic en cualquier fila de la tabla (ej. ICSR-00481)
2. Esperar a que navegue

**Resultado esperado:** ✅ Navega a la página de detalle de ese hallazgo

**Criterios de aceptación:**
- [ ] URL cambia a `/findings/icsr-00481`
- [ ] El contenido muestra el hallazgo correcto (Metformina, Acidosis láctica)

---

## Test Suite 4: Navegación y Sidebar

### TC-018: Navegar entre todas las secciones del sidebar
**Pasos:**
1. Hacer clic en "Dashboard" → verifica que navega a `/`
2. Hacer clic en "Casos" → verifica que navega a `/findings` (muestra tabla)
3. Hacer clic en "Cola de aprobación" → verifica que navega a `/approval`
4. Hacer clic en "Medicamentos" → verifica que navega a `/drugs`

**Resultado esperado:** ✅ Todas las navegaciones funcionan sin errores

**Criterios de aceptación:**
- [ ] Cada sección tiene su icono correcto
- [ ] El badge de "12" aparece al lado del item activo
- [ ] Las URLs coinciden

---

### TC-019: Verificar que el agente IA está activo en el sidebar
**Pasos:**
1. Scroll down en el sidebar
2. Buscar la sección "Agente IA · activo" con el dot verde

**Resultado esperado:** ✅ Se muestra el estado del agente

**Criterios de aceptación:**
- [ ] El dot está visible y es teal
- [ ] El texto muestra "Última sync hace 14 min"
- [ ] El botón "Ejecutar análisis" está presente

---

### TC-020: Verificar datos del usuario en sidebar
**Pasos:**
1. Scroll down al footer del sidebar
2. Ver avatar "MR" con los datos del usuario

**Resultado esperado:** ✅ Se muestran los datos correctos

**Criterios de aceptación:**
- [ ] Avatar muestra "MR"
- [ ] Nombre: "Dra. Marta Ruiz"
- [ ] Rol: "QPPV · Pharma EU"

---

## Test Suite 5: Responsiveness (Mobile / Tablet)

### TC-021: Probar en móvil (375px ancho)
**Pasos:**
1. Abrir DevTools (F12)
2. Ir a Device Toolbar (Ctrl+Shift+M)
3. Seleccionar iPhone 12 (375px)
4. Navegar a http://localhost:5173
5. Verificar que se vea correctamente

**Resultado esperado:** ✅ El layout se adapta

**Criterios de aceptación:**
- [ ] El sidebar puede colapsarse o está oculto
- [ ] El contenido es legible
- [ ] Los botones son tocables (altura mínima 44px)

---

### TC-022: Probar en tablet (768px ancho)
**Pasos:**
1. En DevTools, seleccionar iPad
2. Navegar a Dashboard
3. Verificar layout

**Resultado esperado:** ✅ El grid se adapta

**Criterios de aceptación:**
- [ ] Las tarjetas de hallazgos están en 1-2 columnas
- [ ] La tabla de aprobación es scrolleable horizontalmente si es necesario

---

## Test Suite 6: Colores y Accesibilidad

### TC-023: Verificar contraste WCAG AA
**Pasos:**
1. Abrir DevTools → Lighthouse
2. Ejecutar auditoría de Accessibility
3. Verificar que el score es ≥ 90

**Resultado esperado:** ✅ Cumple WCAG AA

**Criterios de aceptación:**
- [ ] Todos los textos tienen contraste suficiente
- [ ] Los inputs tienen labels asociados
- [ ] Los botones son accesibles vía teclado

---

### TC-024: Navegación por teclado
**Pasos:**
1. Presionar Tab repetidamente
2. Verificar que todos los botones e inputs se resalten (focus visible)
3. Presionar Enter en un botón

**Resultado esperado:** ✅ La navegación por teclado funciona

**Criterios de aceptación:**
- [ ] Hay focus visible (outline azul)
- [ ] El orden de tab es lógico
- [ ] Los botones responden a Enter

---

## Test Suite 7: Integración con Backend

### TC-025: Conexión a API en producción
**Pasos:**
1. Abrir DevTools → Network
2. Hacer una acción que llame a la API (ej. aprobar un hallazgo)
3. Verificar que se hace un request POST a https://pharmavig-mvp-production.up.railway.app/api/v1/...

**Resultado esperado:** ✅ Las requests se envían al backend correcto

**Criterios de aceptación:**
- [ ] El endpoint es correcto
- [ ] Los headers incluyen Content-Type: application/json
- [ ] La respuesta es 200 o maneja el error gracefully

---

### TC-026: Mock data cuando el backend no responde
**Pasos:**
1. Desactivar internet o bloquear la API
2. Navegar a http://localhost:5173
3. Verificar que se muestra datos mock

**Resultado esperado:** ✅ La app sigue funcionando con mock data

**Criterios de aceptación:**
- [ ] No hay errores en consola (solo warnings de conexión)
- [ ] Se muestran los hallazgos mock
- [ ] Los botones siguen siendo clickeables

---

## Checklist Final

- [ ] TC-001 a TC-026 pasadas
- [ ] No hay errores en consola (excepto warnings esperados)
- [ ] No hay memory leaks (DevTools → Memory)
- [ ] El tiempo de carga es < 3s
- [ ] Las animaciones son smooth (60fps)
- [ ] El responsive design funciona en mobile, tablet, desktop

---

## Bugs encontrados durante testing

(Completar durante las pruebas)

| ID | Descripción | Severidad | Estado |
|-------|-------------|-----------|--------|
| | | | |

---

## Sign-off

- **Probado por:** [Nombre]
- **Fecha:** [Fecha]
- **Resultado:** ✅ PASS / ❌ FAIL

