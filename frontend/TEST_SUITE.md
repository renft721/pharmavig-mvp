# Pharmavig Frontend — Suite de Pruebas Automatizadas

## Configuración

### Dependencias instaladas
```bash
npm install
```

Incluye:
- **Vitest** — testing framework basado en Vite
- **React Testing Library** — testing utilities para componentes React
- **jest-dom** — custom matchers para accesibilidad

---

## Ejecutar pruebas

### Modo watch (desarrollo)
```bash
npm test
```
Corre las pruebas y se queda escuchando cambios.

### Modo UI interactivo
```bash
npm run test:ui
```
Abre un dashboard web en `http://localhost:51204/__vitest__/` donde puedes:
- Ver todas las pruebas
- Filtrar por nombre
- Rerun pruebas individuales
- Ver cobertura en tiempo real

### Coverage (cobertura de código)
```bash
npm run test:coverage
```
Genera un reporte de cobertura en `coverage/` con:
- Líneas cubiertas
- Ramas cubiertas
- Funciones cubiertas

---

## Estructura de pruebas

```
frontend/src/test/
├── setup.js              # Setup global (mocks, cleanup)
├── components.test.jsx   # Unit tests de componentes
├── api.test.js          # Tests de API client
└── integration/         # (próximamente) Tests e2e
```

---

## Suite 1: Tests de Componentes (`components.test.jsx`)

### Qué prueba:
- ✅ Renderizado de todos los iconos SVG
- ✅ Tamaños de iconos personalizados
- ✅ Atributos correctos de SVG (viewBox, stroke, fill)
- ✅ Disponibilidad de todos los iconos en el objeto Icon
- ✅ Diseño tokens CSS (variables de color, fuente, espaciado)

### Ejecutar solo estos tests:
```bash
npm test -- components.test.jsx
```

### Tests incluidos:
1. **Icon.Search** — renderiza SVG con viewBox correcto
2. **Icon.Check** — renderiza con tamaño personalizado
3. **Icon.X** — renderiza con tamaño por defecto
4. **Icon.Sparkle** — renderiza con tamaño custom
5. **Icon.Logo** — renderiza logo
6. **Outlined icons** — tienen atributo stroke="currentColor"
7. **Todos los iconos** — están definidos en el objeto Icon
8. **Design tokens** — variables CSS existen

---

## Suite 2: Tests de API (`api.test.js`)

### Qué prueba:
- ✅ Requests a endpoints correctos
- ✅ Métodos HTTP correctos (GET, POST)
- ✅ Headers JSON configurados
- ✅ Parsing de respuestas
- ✅ Manejo de errores (4xx, 5xx)

### Ejecutar solo estos tests:
```bash
npm test -- api.test.js
```

### Tests incluidos:

#### Findings API:
- `listPending(skip, limit)` — lista hallazgos pendientes
- `get(id)` — obtiene un hallazgo específico
- `approve(id, comment)` — aprueba un hallazgo (POST)
- `reject(id, comment)` — rechaza un hallazgo (POST)
- `addComment(id, comment)` — añade comentario (POST)
- Error handling — maneja errores 404, 500, etc.

#### Drugs API:
- `list()` — lista todos los medicamentos
- `get(id)` — obtiene un medicamento

#### Audit API:
- `list(skip, limit)` — lista logs de auditoría
- `getForRecord(id)` — obtiene logs para un registro

#### Searches API:
- `trigger(drugId)` — inicia búsqueda inmediata
- `schedule(drugId, frequency)` — programa búsqueda periódica

#### Base URL y Headers:
- Usa `/api/v1` como base
- Sets `Content-Type: application/json`

---

## Cómo escribir nuevas pruebas

### Patrón básico (Unit Test):
```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle click', async () => {
    const { user } = render(<MyComponent onClick={vi.fn()} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Patrón para API (Mocking):
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { myApi } from '../api/client';

global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MyAPI', () => {
  it('should call correct endpoint', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    const result = await myApi.get(1);
    expect(result.id).toBe(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/my-endpoint'),
      expect.any(Object)
    );
  });
});
```

### Patrón para Componentes con State:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('FormComponent', () => {
  it('should update state on input change', async () => {
    const user = userEvent.setup();
    render(<FormComponent />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });
});
```

---

## Matchers útiles (RTL + jest-dom)

```javascript
// Existencia
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toBeDisabled()

// Atributos
expect(element).toHaveAttribute('href', '/path')
expect(element).toHaveClass('pv-btn')
expect(element).toHaveStyle('color: red')

// Contenido
expect(element).toHaveTextContent('Hello')
expect(element).toContainHTML('<span>Hello</span>')

// Valores
expect(input).toHaveValue('text')
expect(element).toHaveDisplayValue(['visible'])

// Accesibilidad
expect(element).toHaveAccessibleName('Submit')
expect(element).toHaveAccessibleDescription('Click to submit')
```

---

## Casos de prueba faltantes (TODO)

Para una cobertura completa, añadir tests para:

1. **Dashboard Component Tests**
   - Renderizado de KPIs
   - Búsqueda de medicamentos
   - Filtrado de hallazgos
   - Clicks en tarjetas

2. **FindingDetail Component Tests**
   - Carga de datos ICSR
   - Renderizado de evidencia
   - Envío de comentarios
   - Aprobación/rechazo

3. **ApprovalQueue Component Tests**
   - Filtrado de tabla
   - Selección múltiple
   - Paginación
   - Búsqueda

4. **Integration Tests (e2e)**
   - Flujo completo: Dashboard → Detalle → Aprobación
   - Navegación entre páginas
   - Integración con API real

5. **Responsive Tests**
   - Breakpoints mobile/tablet/desktop
   - Touch events

6. **Accessibility Tests**
   - WCAG AA compliance
   - Keyboard navigation
   - Screen reader labels

---

## Coverage goals

| Métrica | Target | Actual |
|---------|--------|--------|
| Statements | 80% | — |
| Branches | 75% | — |
| Functions | 80% | — |
| Lines | 80% | — |

---

## Debugging tests

### Ver qué está renderizado:
```javascript
import { render, screen } from '@testing-library/react';

it('debug test', () => {
  const { debug } = render(<MyComponent />);
  debug(); // Imprime el DOM
});
```

### Ver logs en los tests:
```javascript
screen.logTestingPlaygroundURL(); // URL para debug en el navegador
```

### Pausar ejecución:
```javascript
it('debug test', async () => {
  render(<MyComponent />);
  await screen.findByText('Loading...');
  // Pausa aquí para inspeccionar
});
```

---

## CI/CD Integration (GitHub Actions)

El siguiente workflow ejecuta tests en cada push:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm test -- --run
      - run: npm run test:coverage
```

---

## Troubleshooting

### Tests cuelgan
```bash
npm test -- --inspect-brk
```
Abre el debugger de Node para pausar en breakpoints.

### Falla de import
Asegúrate que `vitest.config.js` está en la raíz y tiene el plugin de React.

### Mock no funciona
```javascript
import { vi } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks(); // Limpiar después de cada test
});
```

### Timeout en tests async
```javascript
it('slow test', async () => {
  // test
}, 10000); // 10 segundos timeout
```

---

## Recursos

- [Vitest Docs](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
- [Testing Pharmavig Guide](./TESTING.md)

