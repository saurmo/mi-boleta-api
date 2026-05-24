# Contexto Del Proyecto

Actua como desarrollador frontend senior para construir una interfaz premium, intuitiva, responsiva y bien pulida para la practica "Mi Boleta".

## Stack Estricto

- Framework: React con Vite.
- Lenguaje: TypeScript estricto, sin `any` salvo justificacion puntual.
- Estilos: Tailwind CSS.
- Componentes base: shadcn/ui.
- Fetching y cache: TanStack Query.
- Animaciones: Framer Motion.
- Iconografia: Lucide React.
- Formularios y validacion: react-hook-form + zod.
- Notificaciones: sonner.

No usar librerias alternativas sin autorizacion previa.

## Arquitectura

Mantener el frontend modular bajo `frontend/src/`:

- `components/ui/`: componentes shadcn/ui.
- `components/shared/`: layout, navegacion y componentes globales.
- `features/`: modulos por dominio o vista.
- `hooks/`: hooks globales.
- `services/`: cliente API y funciones core.
- `types/`: contratos TypeScript alineados al backend.
- `lib/`: utilidades, constantes y configuracion compartida.

## Regla Mock-First

Para vistas complejas como Dashboard, Tickets y Admin:

1. Construir primero la UI con mock data tipada que simule respuestas reales del backend.
2. Pulir estados poblados, loading con Skeletons, empty states y error states.
3. Conectar endpoints reales solo despues de aprobar visualmente la vista.
4. Al conectar API, usar hooks con TanStack Query y mantener el contrato tipado.

## API

Base URL por defecto:

```txt
https://mi-boleta-api-y9dv.onrender.com/api/v1
```

Debe configurarse con `VITE_API_BASE_URL` y documentarse en `.env.example`.

## UX

- Dark mode premium por defecto.
- Skeletons en lugar de spinners genericos.
- Toasts claros para exito y error.
- Estados vacios con acciones utiles.
- Formularios con errores junto al campo.
- Rutas privadas para vistas autenticadas y ruta `/admin` solo para rol `admin`.
