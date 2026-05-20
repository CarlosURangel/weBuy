# WeBuy - Plataforma de Compras Grupales

Plataforma web para organizar compras grupales. Los usuarios crean publicaciones para alcanzar un volumen mínimo de unidades y obtener precios por mayoreo.

---

## Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Base de Datos:** PostgreSQL con Prisma ORM
- **Autenticación:** NextAuth.js v4 (credenciales con JWT)
- **Estilos:** TailwindCSS v4
- **UI:** Radix UI primitives
- **Iconos:** Lucide React
- **Validación:** Zod v4
- **Notificaciones:** Sonner

---

## Requisitos Previos

- Node.js 18+
- PostgreSQL (o Neon serverless)

---

## Configuración Inicial

1. Clonar el repositorio e instalar dependencias:
```
git clone <repo-url>
cd webuy
npm install
```

2. Crear archivo `.env` con las variables necesarias:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto"
```

3. Ejecutar migraciones de Prisma:
```
npx prisma migrate dev
```

4. Iniciar servidor de desarrollo:
```
npm run dev
```

---

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Compila para producción
- `npm start` - Inicia servidor de producción
- `npm run lint` - Ejecuta linter
- `npx prisma studio` - Abre explorador de base de datos

---

## Rutas del Frontend

**`/`** - Redirige a `/dashboard`

**`/dashboard`** - Catálogo principal. Muestra todas las publicaciones activas, solicitudes pendientes del usuario y solicitudes al creador. Incluye barra de búsqueda y filtro por localidad. Requiere autenticación.

**`/login`** - Página de inicio de sesión con formulario de correo y contraseña. Redirige a `/dashboard` o `/admin/reportes` si el usuario es administrador. No requiere autenticación.

**`/signup`** - Página de registro con formulario de nombre, correo, contraseña, teléfono y localidad (selector de estados de México). No requiere autenticación.

**`/perfil`** - Perfil del usuario con pestañas: Activas, Completadas, Pendientes, Solicitudes, Mis Publicaciones y Reseñas. Muestra datos personales y reputación. Requiere autenticación.

**`/crear-publicacion`** - Formulario para crear una nueva publicación de compra grupal con título, descripción, URL origen, imagen, precios, meta de unidades y fecha límite. Requiere autenticación.

**`/producto/[id]`** - Detalle de producto con galería de imágenes, precios, barra de progreso, participantes y espacio de coordinación (posts y comentarios para miembros aprobados). Lectura libre, unirse requiere autenticación.

**`/admin`** - Panel de administración con tres pestañas: Reportes (gestionar reportes, penalizar usuarios), Reseñas (ver y eliminar) y Usuarios (ver y penalizar). Solo accesible para administradores.

---

## API REST (Endpoints HTTP)

**`GET, POST /api/auth/[...nextauth]`**
Manejador de NextAuth. Proveedor de credenciales con email y contraseña usando bcrypt. Los callbacks JWT y Session añaden `id`, `rol` y `localidad` al token y sesión del usuario.

**`GET /api/perfil`**
Obtiene los datos del perfil del usuario autenticado. Devuelve datos del usuario, sus publicaciones con total de unidades y sus participaciones.

---

## Server Actions (Lógica de Negocio)

Las Server Actions reemplazan a los controladores tradicionales. Se llaman directamente desde componentes del cliente.

### Autenticación - `src/app/actions/auth.ts`

- **registrarUsuario(formData)** - Registra un nuevo usuario. Valida con Zod, hashea la contraseña con bcrypt y crea el registro en la base de datos.

### Publicaciones - `src/app/actions/publicaciones.ts`

- **crearPublicacion(formData)** - Crea una nueva publicación de compra grupal. Valida con Zod y requiere sesión activa.
- **borrarPublicacion(id_publicacion)** - Elimina una publicación. Solo el creador o un administrador pueden hacerlo.
- **obtenerPublicacionPorId(id)** - Obtiene detalle de publicación con datos del creador y participaciones. Si la meta se alcanza, actualiza el estado a META_ALCANZADA.
- **unirseCompraGrupal(id_publicacion, cantidad)** - (Legacy) Crea una participación con estado pendiente.

### Participaciones - `src/app/actions/participaciones.ts`

- **solicitarUnirse(formData)** - Solicita unirse a una compra grupal. Verifica penalizaciones activas, duplicados y auto-participación.
- **aprobarParticipacion(participacionId)** - El creador aprueba una solicitud y registra la fecha de aprobación.
- **rechazarParticipacion(participacionId)** - El creador rechaza una solicitud.
- **obtenerSolicitudesCreador()** - Obtiene todas las solicitudes pendientes para las publicaciones del creador.
- **obtenerMisSolicitudes()** - Obtiene todas las solicitudes del usuario actual.

### Coordinación - `src/app/actions/coordinacion.ts`

- **crearPostCoordinacion(formData)** - Crea un post en el espacio de coordinación. Solo el creador o participantes aprobados.
- **crearComentarioCoordinacion(formData)** - Comenta en un post de coordinación. Mismas restricciones de acceso.
- **obtenerPostsCoordinacion(publicacionId)** - Obtiene todos los posts con sus comentarios para una publicación.
- **obtenerComentariosPost(postId)** - Obtiene comentarios de un post específico.
- **eliminarPostCoordinacion(postId)** - Elimina un post. Solo el autor o el creador de la publicación.
- **editarPostCoordinacion(postId, titulo, contenido, tipo)** - Edita un post. Solo el autor.
- **eliminarComentarioCoordinacion(comentarioId)** - Elimina un comentario. Puede hacerlo el autor del comentario, el autor del post o el creador de la publicación.
- **editarComentarioCoordinacion(comentarioId, contenido)** - Edita un comentario. Solo el autor.

### Historial y Perfil - `src/app/actions/historial.ts`

- **obtenerHistorialCompras()** - Obtiene el historial completo del usuario: participaciones activas, completadas y pendientes.
- **obtenerDatosPerfil(usuarioId?)** - Obtiene datos del perfil de un usuario. Si no se pasa ID, devuelve los del usuario autenticado.

### Reputación y Reportes - `src/app/actions/reputacion.ts`

- **crearResena(formData)** - Crea una reseña para un usuario. Valida que no sea auto-reseña ni duplicada. Recalcula la reputación automáticamente.
- **crearReporte(formData)** - Reporta un usuario. Razones disponibles: FRAUDE, SPAM, COMPORTAMIENTO_INAPROPIADO, OTRO.
- **obtenerReputacionUsuario(usuarioId)** - Obtiene la calificación promedio y el conteo de compras completadas de un usuario.
- **recalcularReputacion(usuarioId)** - Recalcula el promedio de calificación basado en todas las reseñas recibidas.
- **obtenerResenasUsuario(usuarioId)** - Obtiene todas las reseñas recibidas por un usuario.

### Administración - `src/app/actions/admin.ts`

- **obtenerReportes()** - Obtiene todos los reportes con datos del reportero y del reportado.
- **actualizarEstadoReporte(reporteId, estado)** - Cambia el estado de un reporte (PENDIENTE, REVISADO, RESUELTO).
- **aplicarPenalizacion(usuarioId, dias)** - Penaliza a un usuario por N días. No puede unirse a compras ni publicar durante ese período.
- **quitarPenalizacion(usuarioId)** - Remueve la penalización de un usuario.
- **obtenerTodasResenas()** - Obtiene todas las reseñas del sistema.
- **eliminarResenaAdmin(resenaId)** - Elimina una reseña (acción de administrador).
- **obtenerUsuarios()** - Obtiene todos los usuarios con sus datos y conteo de reportes pendientes.

---

## Modelos de Base de Datos

### Usuario
Campos: id_usuario (PK), nombre, correo (único), contrasena (hasheada con bcrypt), telefono, localidad, rol (COMPRADOR o ADMINISTRADOR), penalizado_hasta, calificacion_promedio, compras_completadas.

Relaciones: tiene publicaciones, participaciones, mensajes, posts, comentarios, reseñas (dadas y recibidas) y reportes (hechos y recibidos).

### Publicacion
Campos: id_publicacion (PK), creador_id (FK), titulo, descripcion, url_origen, imagen_url, precio_unitario, precio_mayoreo, meta_unidades, fecha_limite, estado (ACTIVA, META_ALCANZADA, CANCELADA).

Relaciones: pertenece a un usuario (creador), tiene participaciones, mensajes y posts de coordinación.

### Participacion
Campos: id_participacion (PK), usuario_id (FK), publicacion_id (FK), cantidad, estado (PENDING, APPROVED, REJECTED), fecha_solicitud, fecha_aprobacion.

Relaciones: pertenece a un usuario y a una publicación, tiene comentarios de coordinación.

### CoordinationPost
Campos: id_post (PK), publicacion_id (FK), autor_id (FK), titulo, contenido, tipo (GENERAL, UBICACION, PAGO, ACUERDO, ANUNCIO), fecha_creacion.

Relaciones: pertenece a una publicación y a un usuario (autor), tiene comentarios.

### CoordinationComment
Campos: id_comentario (PK), post_id (FK), autor_id (FK), participacion_id (FK, opcional), contenido, fecha_creacion.

Relaciones: pertenece a un CoordinationPost, a un usuario (autor) y opcionalmente a una Participación.

### Review
Campos: id_resena (PK), resena_de_id (FK), resena_a_id (FK), calificacion (1-5), comentario, fecha_creacion.

Relaciones: dos relaciones a Usuario (quien reseña y quien recibe la reseña).

### Report
Campos: id_reporte (PK), reportero_id (FK), reportado_id (FK), razon (FRAUDE, SPAM, COMPORTAMIENTO_INAPROPIADO, OTRO), descripcion, estado (PENDIENTE, REVISADO, RESUELTO), fecha_reporte.

Relaciones: dos relaciones a Usuario (reportero y reportado).

---

## Middleware

El archivo `middleware.ts` protege las rutas `/perfil/*`, `/crear-publicacion`, `/foro/*` y `/dashboard`, redirigiendo a `/login` si el usuario no está autenticado. Utiliza `withAuth` de NextAuth.

---

## Estructura del Proyecto

```
webuy/
├── middleware.ts                 # Protección de rutas con NextAuth
├── prisma/
│   └── schema.prisma             # Modelos de base de datos (8 modelos, 5 enums)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts    # NextAuth handler
│   │   │   └── perfil/route.ts                # API de perfil
│   │   ├── actions/               # Server Actions (controladores)
│   │   │   ├── auth.ts
│   │   │   ├── publicaciones.ts
│   │   │   ├── participaciones.ts
│   │   │   ├── coordinacion.ts
│   │   │   ├── historial.ts
│   │   │   ├── reputacion.ts
│   │   │   └── admin.ts
│   │   ├── dashboard/             # Catálogo principal
│   │   ├── login/                 # Inicio de sesión
│   │   ├── signup/                # Registro
│   │   ├── perfil/                # Perfil de usuario
│   │   ├── crear-publicacion/     # Crear publicación
│   │   ├── producto/[id]/         # Detalle de producto
│   │   └── admin/                 # Panel de administración
│   ├── components/                # Componentes compartidos
│   │   ├── ui/                    # Botones, inputs, cards, tabs, etc.
│   │   ├── producto/              # Galería, botones de producto
│   │   └── ...                    # CoordinationFeed, ProgressBar, etc.
│   ├── lib/
│   │   ├── prisma.ts              # Cliente Prisma singleton
│   │   └── utils.ts               # Función cn() para clases CSS
│   └── ...
└── types/
    └── next-auth.d.ts             # Tipos extendidos de NextAuth
```
