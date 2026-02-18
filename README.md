# CAD – Central de Seguridad Ciudadana

Sistema CAD (Computer-Aided Dispatch) web para la gestión de incidentes y despacho de unidades en una central de seguridad ciudadana municipal.

---

## Requisitos previos

- **Node.js** ≥ 18
- **npm** ≥ 9
- Cuenta de Firebase con acceso al proyecto `cad-seguridad-municipal`

## Estructura del proyecto

```
CAD2/
├── frontend/            # Aplicación web (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Páginas (Login, Dashboard)
│   │   ├── hooks/       # Hooks personalizados (useAuth, useIncidents, useUnits)
│   │   ├── services/    # Capa de acceso a Firebase (auth, incidents, units, eventLogs)
│   │   ├── types/       # Interfaces y tipos TypeScript
│   │   └── config/      # Configuración de Firebase
│   └── package.json
├── firebase.json        # Configuración de Firebase (Hosting, Firestore)
├── .firebaserc          # Alias del proyecto Firebase
├── firestore.rules      # Reglas de seguridad de Firestore
└── firestore.indexes.json
```

## Levantar el proyecto en local

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Iniciar el servidor de desarrollo

```bash
cd frontend
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`.

### 3. (Opcional) Usar emuladores de Firebase

```bash
# Desde la raíz del proyecto
npx firebase-tools emulators:start
```

## Desplegar a Firebase Hosting

### 1. Compilar el frontend

```bash
cd frontend
npm run build
```

### 2. Desplegar

```bash
# Desde la raíz del proyecto
npx firebase-tools deploy --only hosting
```

### 3. Verificar el despliegue

La aplicación estará disponible en:
`https://cad-seguridad-municipal.web.app`

## Tecnologías

| Área | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Autenticación | Firebase Authentication |
| Base de datos | Cloud Firestore (tiempo real) |
| Hosting | Firebase Hosting |
| Mapas | Leaflet + OpenStreetMap |

## Modelo de datos

### Incidentes (`incidents`)
Registro de cada incidente reportado con tipo, prioridad, estado, dirección y unidades asignadas.

### Unidades (`units`)
Vehículos y recursos de seguridad con estado, tipo, ubicación y código de radio.

### Usuarios (`users`)
Operadores, supervisores y administradores del sistema.

### Registro de eventos (`eventLogs`)
Log inmutable de todas las acciones realizadas sobre incidentes.

---

**Desarrollado para la Central de Seguridad Ciudadana Municipal – Santiago de Chile**
