# StreamSpace - Plataforma Privada de Tutoriales con DRM

Esta es una plataforma privada diseñada para alojar y servir tutoriales protegidos por DRM (VdoCipher). Cuenta con dos roles: **Administrador** (quien gestiona el contenido y usuarios) y **Estudiante** (quien consume los tutoriales que le han sido asignados).

## Arquitectura

- **Frontend**: React + Vite + Tailwind CSS + React Router (HashRouter). Se hospeda en GitHub Pages de forma estática.
- **Backend**: Cloudflare Worker + Hono. Autentica las peticiones y genera los OTP de VdoCipher de manera segura.
- **Base de Datos**: Supabase (PostgreSQL) con Row Level Security (RLS) habilitado.
- **DRM**: VdoCipher.

## Configuración y Despliegue

### 1. Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Entra al editor SQL de Supabase y ejecuta el contenido del archivo `supabase/migrations/00001_initial_schema.sql` para crear las tablas y políticas.
3. Para crear el primer **Administrador**:
   - Ve a Authentication -> Users y crea un usuario (ej. `admin@ejemplo.com`).
   - Ve a Table Editor -> `profiles`.
   - Edita el rol del usuario recién creado cambiándolo de `student` a `admin`.
   - Actualiza también el campo `full_name`.
4. Obtén tu **Project URL**, **Anon Key** y **Service Role Key** desde Settings -> API.

### 2. VdoCipher

1. Crea una cuenta de prueba o contrata un plan en [VdoCipher](https://www.vdocipher.com). (La prueba dura 30 días, asegúrate de verificar cuándo empieza).
2. Sube tus videos desde el panel de VdoCipher y espera a que estén listos.
3. Copia el `Video ID` de cada video subido.
4. Obtén tu **API Secret Key** desde la sección de configuración de API en VdoCipher.
5. **Importante**: Cuando finalice el período de prueba de 30 días, deberás adquirir un plan de pago para que la reproducción siga funcionando.

### 3. Backend (Cloudflare Worker)

1. Ve a la carpeta `apps/worker` o usa el comando desde la raíz.
2. Necesitarás tener instalada la CLI de Wrangler y haber hecho login (`npx wrangler login`).
3. Configura los secretos del Worker. No los pongas en texto plano, usa Wrangler:
   ```bash
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_ANON_KEY
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   npx wrangler secret put VDOCIPHER_API_SECRET
   npx wrangler secret put ALLOWED_ORIGIN  # (ej: https://USUARIO.github.io)
   npx wrangler secret put IP_HASH_SALT    # (un texto aleatorio para hashear IPs)
   ```
4. Despliega el Worker:
   ```bash
   npm run deploy --workspace=apps/worker
   ```
5. Anota la URL del Worker (ej: `https://streamspace-worker.TU_USUARIO.workers.dev`).

### 4. Frontend (GitHub Pages)

El frontend está preparado para desplegarse mediante GitHub Actions.

1. En tu repositorio de GitHub, ve a Settings -> Secrets and variables -> Actions.
2. Crea las siguientes variables de repositorio (Repository variables, no secrets ya que son públicas para Vite):
   - `VITE_SUPABASE_URL`: Tu URL de Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Tu Anon Key de Supabase.
   - `VITE_WORKER_API_URL`: La URL de tu Cloudflare Worker desplegado.
3. Para que GitHub Pages funcione, ve a Settings -> Pages, y selecciona `GitHub Actions` como fuente (Source).
4. El workflow `.github/workflows/deploy.yml` se encargará de compilar y subir el sitio en cada push a la rama `main`.
5. **Nota sobre Base URL**: Si tu repositorio se llama `StreamSpace`, la URL base será `/StreamSpace/`. El archivo `vite.config.ts` leerá automáticamente el nombre del repositorio.

## Variables de Entorno Locales

Para desarrollo local, copia el archivo `.env.example` a `.env` en la raíz del proyecto y completa los valores.

```bash
cp .env.example .env
```

## Comandos Locales

Instalar dependencias:
```bash
npm install
```

Ejecutar desarrollo concurrente (Frontend + Worker):
```bash
npm run dev
```

Ejecutar pruebas:
```bash
npm run test
```

## Limitaciones de DRM y Protección
- El DRM de VdoCipher impide la descarga y captura de pantalla por software en la mayoría de dispositivos modernos y navegadores compatibles con Widevine/FairPlay/PlayReady (ej. Chrome, Edge, Safari).
- Las capturas mediante hardware externo no pueden ser bloqueadas.
- La aplicación incluye métodos para dificultar el clic derecho, arrastrar, y combinación de teclas de desarrollador, pero esto es solo para disuadir usuarios no técnicos. La protección real recae en VdoCipher.
- Si el DRM no es compatible con el dispositivo del estudiante, se mostrará un mensaje de error y el video no reproducirá. Se recomienda sugerir al estudiante que use Google Chrome o Microsoft Edge actualizados.

## Checklist para probar la plataforma

1. [ ] Crear admin en Supabase.
2. [ ] Iniciar sesión como administrador en la plataforma.
3. [ ] Crear un usuario estudiante desde el panel de Gestión de Usuarios.
4. [ ] Agregar un tutorial usando un Video ID de VdoCipher y publicarlo.
5. [ ] Asignar el tutorial al estudiante con una fecha de expiración.
6. [ ] Cerrar sesión e ingresar como el estudiante.
7. [ ] Reproducir el video, comprobar que funciona, que la marca de agua está presente, y que la interfaz de descarga no existe.
8. [ ] Comprobar los registros de actividad en el panel de administrador.
