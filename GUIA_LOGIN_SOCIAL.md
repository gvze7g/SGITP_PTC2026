# Guía: subida de imágenes y login con Google / Apple

Documento de referencia para SGITP_PTC2026. Cubre qué se arregló, qué falta
configurar y cómo probar cada cosa.

---

## Parte 0 — Lo primero: bug que rompía el backend en Linux

El archivo `SGITP_BACKEND/src/Routes/loginemployee.js` estaba escrito con **e
minúscula**, pero `app.js` lo importaba como `loginEmployee.js` con **E
mayúscula**.

- En Windows y macOS el sistema de archivos ignora mayúsculas → funcionaba.
- En Linux (que es donde corre casi cualquier servidor de despliegue: Render,
  Railway, una VPS) el import falla y **el backend no arranca**.

Ya está renombrado a `loginEmployee.js`. Si al hacer `git pull` les aparece un
conflicto raro con ese archivo, borren la copia local y vuelvan a bajarlo.

### Otro detalle del repositorio

`SGITP_BACKEND/node_modules/` está **subido a Git** (unos 1.975 archivos), aunque
el `.gitignore` ya lo excluye. Se subió antes de que existiera el `.gitignore`, y
la copia que está en el repo está incompleta: le faltan `cors`, `cloudinary`,
`multer` y `google-auth-library`. Eso hace que quien clone el proyecto se
encuentre con una carpeta que parece instalada pero no sirve.

Para limpiarlo (una sola vez, desde la raíz del repo):

```bash
git rm -r --cached SGITP_BACKEND/node_modules
git commit -m "chore: quitar node_modules del control de versiones"
```

Después cada quien corre `npm install` normalmente.

---

## Parte 1 — Subida de imágenes a Cloudinary

### Qué estaba mal

El código de multer + Cloudinary **sí existía y la lógica era correcta**. Los
problemas eran de configuración y de manejo de errores:

| Problema | Consecuencia |
|---|---|
| Los nombres de variables del README no coinciden con `src/config.js` | Si armaban el `.env` copiando del README, Cloudinary quedaba sin credenciales |
| Sin credenciales, Cloudinary fallaba con "Must supply api_key" | Error 500 sin explicación |
| Los errores de multer no se convertían a JSON | Express devolvía HTML, el frontend hacía `response.json()`, reventaba y mostraba "Error de conexión con el servidor" aunque el servidor sí estaba encendido |
| No había filtro de tipo de archivo | Se podía subir un PDF o un .exe como si fuera imagen |
| Al **editar** un producto y agregar una sola foto, se borraban todas las anteriores de Cloudinary | Pérdida de imágenes |

### Qué se cambió

- `src/utils/cloudinaryConfig.js`: detecta si faltan credenciales y avisa en
  consola al arrancar; filtra por tipo MIME (JPG, PNG, WEBP, GIF, AVIF); expone
  helpers reutilizables para subir y borrar.
- `app.js`: manejador de errores global que traduce los errores de multer a JSON
  con mensajes en español (archivo muy pesado, formato inválido, campo
  incorrecto).
- `src/Controller/productController.js`: mensajes claros cuando Cloudinary no
  está configurado o falla, y al editar solo se borran las imágenes que el
  usuario realmente quitó.
- `SGITP_PRIV/.../CreateProductModal.jsx`: ahora manda `existingImages` con las
  fotos que se conservan.
- Se quitó `upload.array()` de la ruta `DELETE` (no recibe archivos).

### Cómo configurarlo

1. Entrar a [cloudinary.com](https://cloudinary.com) → Dashboard.
2. Copiar **Cloud name**, **API Key** y **API Secret**.
3. En `SGITP_BACKEND/`, copiar `.env.example` a `.env` y llenar:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefg_hijklmnop
```

> **Ojo con los nombres.** Estos son los que lee `src/config.js`. El README
> principal listaba `MONGODB_URI`, `SERVER_PORT`, `JWT_SECRET` y `EMAIL_USER`,
> que el código **ignora**. Los correctos son `DB_URI`, `PORT`,
> `JWT_SECRET_KEY`, `USER_EMAIL`. Ver `.env.example`.

### Cómo probar

Arrancar el backend. Si las credenciales faltan, ahora sale este aviso:

```
[Cloudinary] Faltan credenciales en el .env ...
```

Si no sale, están bien puestas. Después, desde el panel admin: crear un producto
con imagen. Si algo falla, el mensaje ahora dice **qué** falló.

Prueba directa con curl (reemplazar la cookie por una de sesión de admin real):

```bash
curl -X POST http://localhost:4000/api/products \
  -H "Cookie: authCookie=EL_TOKEN_DE_TU_SESION" \
  -F "name=Body manga larga" \
  -F "description=Prueba" \
  -F "category=Ropa" \
  -F "price=12.50" \
  -F "variants=[{\"size\":\"S\",\"stock\":10}]" \
  -F "images=@/ruta/a/una/foto.jpg"
```

---

## Parte 2 — Login con Google

### Estado

| Módulo | Antes | Ahora |
|---|---|---|
| Backend | Endpoint `/api/auth/google` funcionando, pero solo aceptaba el client ID de la web | Acepta los 4 client IDs (web, iOS, Android, Expo) y devuelve el token también en el body |
| SGITP_WEB | Ya implementado con Google Identity Services | Igual, solo falta la variable de entorno |
| SGITP_MOVIL | Botón decorativo, no hacía nada | Implementado con `expo-auth-session` |

### Paso 1 — Crear el proyecto en Google Cloud

1. [console.cloud.google.com](https://console.cloud.google.com) → crear un
   proyecto (ej. "Peques").
2. Menú → **APIs y servicios** → **Pantalla de consentimiento de OAuth**.
   - Tipo: **Externo**.
   - Nombre de la app: Peques. Correo de soporte: el de ustedes.
   - Alcances: dejar los que vienen (`email`, `profile`, `openid`).
   - En **Usuarios de prueba**, agregar los correos con los que van a probar.
     Mientras la app esté en modo "Prueba", solo esos correos pueden entrar.

### Paso 2 — Client ID para la web

**APIs y servicios** → **Credenciales** → **Crear credenciales** → **ID de
cliente de OAuth** → tipo **Aplicación web**.

- Orígenes autorizados de JavaScript:
  - `http://localhost:5173`
  - `http://localhost:5174`
- URIs de redireccionamiento: no hace falta ninguno (Google Identity Services
  usa el flujo de popup con `credential`).

Copiar el Client ID (termina en `.apps.googleusercontent.com`) y ponerlo en
**dos** lugares:

```env
# SGITP_BACKEND/.env
GOOGLE_CLIENT_ID=1234-abc.apps.googleusercontent.com

# SGITP_WEB/.env
VITE_GOOGLE_CLIENT_ID=1234-abc.apps.googleusercontent.com
```

Reiniciar Vite (`npm run dev`). El botón de Google en `/login` y `/` ya debería
abrir el selector de cuentas real.

### Paso 3 — Client IDs para móvil

En la misma pantalla de Credenciales, crear:

**Android:**
- Nombre del paquete: `com.peques.sgitpmovil` (el que quedó en `app.json`).
- Huella SHA-1: se saca con
  `npx expo credentials` o, para desarrollo local:
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```

**iOS:**
- Bundle ID: `com.peques.sgitpmovil`.

Poner los tres en el `.env` del backend y en el de móvil:

```env
# SGITP_BACKEND/.env
GOOGLE_CLIENT_ID_IOS=...
GOOGLE_CLIENT_ID_ANDROID=...

# SGITP_MOVIL/.env
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=...
```

### Paso 4 — Instalar las librerías del móvil

Desde `SGITP_MOVIL/`:

```bash
npx expo install expo-auth-session expo-web-browser expo-apple-authentication expo-crypto
```

> Usar `npx expo install` y **no** `npm install`: Expo resuelve la versión
> compatible con el SDK 54. Las versiones que quedaron escritas en
> `package.json` son las esperadas, pero este comando las corrige si alguna
> no calza.

### ⚠️ Limitación importante: Expo Go no sirve para el login social

`expo-auth-session` con Google y `expo-apple-authentication` necesitan código
nativo que **Expo Go no incluye**. Para probarlos hay que generar un
*development build*:

```bash
# Android, con el celular conectado por USB o un emulador abierto
npx expo run:android

# iOS, solo desde una Mac con Xcode
npx expo run:ios
```

O usando EAS (compila en la nube, no necesita Mac para Android):

```bash
npm install -g eas-cli
eas build --profile development --platform android
```

**Recomendación práctica para el PTC:** prueben primero el login con Google en
**SGITP_WEB**, que funciona solo con poner la variable de entorno y no necesita
compilar nada. El código del móvil ya queda listo para cuando tengan el
development build.

---

## Parte 3 — Login con Apple

### Lo que hay que saber antes de empezar

Sign in with Apple **requiere una cuenta del Apple Developer Program: 99 USD al
año**. No hay plan gratuito ni modo de prueba. Sin esa cuenta no se puede
completar, y no es un problema de código.

Además:

- El botón de Apple en el móvil **solo funciona en iOS** (iPhone real o
  simulador con iOS 13+). En Android no existe.
- El login de Apple en la web exige que la URL de retorno sea **HTTPS**.
  `http://localhost` no sirve; hay que usar un túnel como
  [ngrok](https://ngrok.com) o `cloudflared` durante el desarrollo.
- Regla de la App Store: si una app ofrece login con Google o Facebook,
  **está obligada a ofrecer también Sign in with Apple**. Por eso conviene
  dejarlo implementado aunque no lo activen ahora.

### Qué se implementó

Todo el código está listo y probado. Lo único que falta son las credenciales.

- `SGITP_BACKEND/src/Controller/appleAuthController.js`: verifica el
  `identityToken` descargando las llaves públicas de Apple
  (`https://appleid.apple.com/auth/keys`), validando la firma RS256, el emisor y
  la audiencia. Las llaves se guardan en caché 24 h y se refrescan solas cuando
  Apple las rota.
- Ruta `POST /api/auth/apple`.
- `SGITP_WEB/src/components/auth/AppleAuthButton.jsx`: botón real con el SDK de
  Apple, en lugar del "próximamente".
- `SGITP_MOVIL/src/hooks/useSocialAuth.js`: flujo nativo con
  `expo-apple-authentication`, y el botón se oculta solo si no es iOS.
- El modelo `customer` ahora guarda `appleId` y acepta `provider: "apple"`.

### Paso 1 — App ID (para la app móvil)

1. [developer.apple.com](https://developer.apple.com) → **Certificates,
   Identifiers & Profiles** → **Identifiers** → **+**.
2. Tipo: **App IDs** → **App**.
3. Bundle ID (explicit): `com.peques.sgitpmovil` — tiene que ser **idéntico** al
   de `app.json`.
4. En Capabilities, marcar **Sign in with Apple**.

### Paso 2 — Services ID (para la web)

1. **Identifiers** → **+** → **Services IDs**.
2. Identifier: `com.peques.web` (no puede ser igual al Bundle ID).
3. Marcar **Sign in with Apple** → **Configure**:
   - Primary App ID: el App ID del paso 1.
   - Domains: el dominio donde corre la web (ej. `peques-abc.ngrok-free.app`).
   - Return URLs: la URL completa, **con https** (ej.
     `https://peques-abc.ngrok-free.app/login`).

### Paso 3 — Variables de entorno

```env
# SGITP_BACKEND/.env  — separados por coma, sin espacios
APPLE_CLIENT_IDS=com.peques.web,com.peques.sgitpmovil

# SGITP_WEB/.env
VITE_APPLE_CLIENT_ID=com.peques.web
VITE_APPLE_REDIRECT_URI=https://peques-abc.ngrok-free.app/login
```

> No hace falta la llave privada `.p8` ni el client secret de Apple, porque el
> backend verifica el token directamente con las llaves públicas en lugar de
> intercambiar el authorization code. Un paso menos.

### Detalle a tener en cuenta

Apple manda el **nombre del usuario una sola vez**: la primera vez que esa
persona autoriza la app. Si en esa primera prueba algo falla, el nombre se
pierde para siempre en esa cuenta. Para volver a recibirlo hay que ir a
**Ajustes → [tu nombre] → Inicio de sesión y seguridad → Iniciar sesión con
Apple**, buscar la app y darle **Dejar de usar Apple ID**.

El código ya contempla esto: manda el `fullName` junto con el token en ese
primer login.

---

## Parte 4 — Cambios en las sesiones (aplica a los tres módulos)

React Native no conserva cookies de forma confiable entre reinicios de la app.
Por eso ahora:

- El backend devuelve el token **también en el body** de la respuesta, además de
  la cookie httpOnly que sigue usando la web.
- El middleware `validateAuthCookie` acepta tanto la cookie como la cabecera
  `Authorization: Bearer <token>`.
- La app móvil guarda el token en `expo-secure-store` y lo manda en cada
  petición (`src/services/sessionStore.js`).

La web **no cambia**: sigue usando la cookie y simplemente ignora el token del
body.

### Cookies en producción

En `.env` del backend:

```env
# desarrollo (http)
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

# producción (https, frontend y backend en dominios distintos)
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

Sin esto, al desplegar con HTTPS la cookie se descarta y el usuario aparece
deslogueado aunque el login haya salido bien.

---

## Resumen: qué falta para que todo funcione

| Tarea | Requisito | Costo |
|---|---|---|
| Subida de imágenes | Cuenta de Cloudinary (ya la tienen) → llenar `.env` | Gratis |
| Google en web | Client ID web de Google Cloud Console | Gratis |
| Google en móvil | Client IDs iOS/Android + development build | Gratis |
| Apple en web | Apple Developer Program + Services ID + dominio HTTPS | 99 USD/año |
| Apple en móvil | Apple Developer Program + App ID + Mac con Xcode o EAS | 99 USD/año |

El camino más corto para tener algo demostrable: **Cloudinary + Google en la
web**. Las dos cosas se resuelven llenando el `.env`, sin compilar ni pagar nada.
