# KRUZO Mobile — FASE 5: Release Engineering & Deployment Readiness

> Convierte la app en un artefacto desplegable. No agrega funcionalidades; audita,
> configura y automatiza todo lo posible. Lo que depende de credenciales/cuentas
> externas queda documentado con instrucciones exactas.

## Área 1 — Auditoría de producción (resumen)

| Ítem                              | Estado                        | Acción                                                       |
| --------------------------------- | ----------------------------- | ------------------------------------------------------------ |
| Assets (icon/splash/adaptive)     | ❌ faltaban                   | ✅ generados (placeholder pro, vector "K")                   |
| `app.config` icon/adaptive/splash | ❌ sin referenciar            | ✅ referenciados                                             |
| `eas.json` perfiles               | ⚠️ básico                     | ✅ base + dev/preview/production + channels + submit         |
| `google-services.json`            | ❌ ausente                    | ⚙️ opcional condicional (no rompe build); requerido para FCM |
| Deep links (App Links)            | ⚠️ sólo config                | ✅ + `assetlinks.json`/`AASA` generados + instrucciones      |
| `expo-system-ui`                  | ❌ ausente (warning prebuild) | ✅ instalado                                                 |
| Secretos en repo                  | ✅ ninguno                    | `.env`/keystore/google-services gitignored                   |
| Build local Android               | ❓                            | ✅ ejecutado (ver Área 10)                                   |

## Área 2 — EAS Build

`eas.json`: perfil `base` (node 20.18.0, resourceClass medium) heredado por
`development` (dev client, APK), `preview` (APK interno) y `production`
(AAB, autoIncrement). Channels para EAS Update. `submit.production` → track
`internal`. `requireCommit: true` (builds reproducibles). **Pendiente externo:**
`eas login` + `eas init` (crea `extra.eas.projectId`) para builds en la nube.

## Área 3 — Firebase production

- Proyecto **`kruzo-web`** (mismo backend que web). Config pública vía
  `EXPO_PUBLIC_FIREBASE_*` (válida; tomada de la web). Auth/Firestore/Storage
  funcionan con el JS SDK sin `google-services.json`.
- `android.package = bo.kruzo.app` consistente.
- **FCM (push):** requiere `google-services.json` (consola Firebase → app Android
  `bo.kruzo.app`). Sin él, el build funciona pero no se obtiene token de
  dispositivo FCM.

## Área 4 — Google Sign-In

- Cliente listo (`@react-native-google-signin` + `signInWithCredential`).
- **Falta (externo):**
  1. Crear cliente **OAuth Android** en Google Cloud para `bo.kruzo.app` con el
     **SHA-1** de la firma. SHA-1 (debug actual): `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.
  2. Crear/usar el cliente **OAuth Web** y poner su id en
     `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
  3. (Para release) repetir con el SHA-1 de la clave de release / Play App Signing.

## Área 5 — Google Maps

- `react-native-maps` configurado; key Android vía
  `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY` → `app.config.android.config.googleMaps`.
- **Falta (externo):** crear API key de **Maps SDK for Android** (Google Cloud,
  restringida por package + SHA-1) y ponerla en el env. Sin key, el mapa carga en
  blanco; el resto de la app funciona.

## Área 6 — Push notifications

Cliente **completo** (permiso, canal Android, token → `users/{uid}.expoPushToken`,
handler de primer plano, deep-link al tocar). `expo-notifications` con plugin de
color de marca. **Falta (externo, NO backend nuevo aquí):** `eas init` (projectId
para `getExpoPushTokenAsync`), `google-services.json` (FCM), y un emisor servidor
(Cloud Function con Expo Push API/FCM) — documentado en `docs/06`.

## Área 7 — App Links

Generados en `docs/deeplinks/`: `assetlinks.json` (Android, con package +
SHA-256 actual), `apple-app-site-association` (iOS, `TEAMID` a reemplazar) y
`README` con instrucciones de hosting en `kruzo.bo/.well-known/`. El esquema
`kruzo://` funciona sin hosting.

## Área 8 — Assets de producción

Generados con `scripts/generate-icons.cjs` (vector "K" sobre gradiente de marca,
sin dependencia de fuentes): `icon.png` (1024), `adaptive-icon.png` (foreground),
`splash-icon.png`, `favicon.png`. **Recomendado:** reemplazar por arte final de
marca antes de publicar (mismas rutas/medidas).

## Área 9 — Seguridad

- Sin secretos en el repo: `.env`, `*.keystore`, `google-services.json`,
  `*.apk/*.aab`, `builds/` gitignored. La clave privada del Admin SDK (web) NO se
  usa ni se copia al móvil.
- Config Firebase pública por diseño; autoridad = reglas de Firestore.
- Permisos Android mínimos vía plugins; `RECORD_AUDIO` bloqueado.
- Release firmado (test) con debug keystore — **reemplazar por keystore propio**
  para producción (Play App Signing recomendado).

## Área 10 — APK real (build local) — ✅ GENERADO

**Resultado:** ✅ **APK release generado y verificado.**

| Dato              | Valor                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| Artefacto         | `builds/kruzo-v1.0.0-arm64-v8a-release.apk` (gitignored)                  |
| Origen del build  | `android/app/build/outputs/apk/release/app-release.apk`                   |
| Tamaño            | **34.91 MB** (36 610 912 bytes)                                           |
| SHA-256 (archivo) | `C6F89B398778293B33484BA85937E805BF0A34A35CBCF423FD8471E4AF2FF4D2`        |
| `applicationId`   | `bo.kruzo.app` · label `KRUZO`                                            |
| Versión           | versionName `1.0.0` · versionCode `1`                                     |
| SDK               | minSdk **24** (Android 7.0+) · targetSdk **35**                           |
| ABI               | `arm64-v8a` (build de 1 ABI por velocidad; ver nota)                      |
| JS                | **Embebido** (`assets/index.android.bundle`) → autónomo, sin Metro        |
| Nativo            | New Architecture: `libreactnative.so`, `libhermes.so`, `libappmodules.so` |
| Firma             | **APK Signature Scheme v2 = VERIFIED** (debug keystore de prueba)         |
| Cert SHA-256      | `fa:c6:17:45:…:03:3b:9c` (coincide con `assetlinks.json`)                 |
| Cert SHA-1        | `5e:8f:16:06:…:f6:25` (para OAuth Android)                                |

**Toolchain:** Android Studio JBR (**OpenJDK 21**) + Android SDK
(`%LOCALAPPDATA%\Android\Sdk`), NDK **27.1.12297006**, CMake **3.22.1**.
JDK 8 del sistema NO sirve (AGP requiere 17+).

Comando final:
`gradlew generateCodegenArtifactsFromSchema :app:assembleRelease -x lint -x lintVitalRelease -PreactNativeArchitectures=arm64-v8a,x86_64`
(release firmado con debug keystore → APK instalable y autónomo, con JS embebido;
sin credenciales externas).

> ⚠️ **NUNCA compilar sólo `arm64-v8a` para un APK que se vaya a probar en
> emulador.** Los emuladores de Android Studio en PC son **x86_64**: un APK sin
> esas libs muere en `MainApplication.onCreate` con
> `SoLoaderDSONotFoundError: couldn't find DSO to load: libreactnative.so`
> (la instalación NO falla porque las imágenes modernas anuncian traducción
> ARM, pero SoLoader no encuentra las libs). Ver `docs/08` — fue la causa #1
> del crash de arranque auditado. Incluir siempre `arm64-v8a,x86_64`, o quitar
> el flag para los 4 ABIs. En emulador, instalar con
> `adb install -r --abi x86_64 app-release.apk` para fijar el ABI primario.

### Obstáculos reales encontrados y resueltos durante el build

1. **NDK corrupto.** La instalación de `ndk;27.1.12297006` estaba incompleta
   (sólo `.installer`, sin `source.properties`) → `[CXX1101] … did not have a
source.properties file`. Reinstalado (descarga reanudable del paquete oficial
   r27b, validado y colocado en `ndk/27.1.12297006`).
2. **Ruta con espacios.** `…/Proyecto Epico/…` rompe la New Architecture (codegen
   y CMake). El _junction_ no basta porque Gradle/Node canonizan a la ruta real.
   Solución: **copia real del proyecto a una ruta sin espacios** (`C:\kr`) y build
   desde ahí.
3. **Orden de codegen.** `:app:configureCMakeRelWithDebInfo` hace `add_subdirectory`
   de `…/codegen/jni/` de varias libs (async-storage, google-signin,
   gesture-handler, edge-to-edge) cuyas tareas de codegen no corrían antes →
   _"which is not an existing directory"_. Solución: **pre-pasada explícita**
   `generateCodegenArtifactsFromSchema` (todas las subprojects) y luego
   `assembleRelease` en la misma invocación.

> **Nota ABI:** se compiló sólo `arm64-v8a` (la inmensa mayoría de dispositivos
> actuales) para acelerar el build local. Para un APK universal o AAB de tienda,
> quitar `-PreactNativeArchitectures` (o usar `production` con AAB en EAS), lo que
> añade `armeabi-v7a`, `x86`, `x86_64`.

> **Reproducir:** requiere ruta sin espacios, NDK 27.1.12297006 + CMake 3.22.1
> completos, JDK 17+ (JBR 21). Pasos exactos arriba.

## Área 11 — Firma de release & publicación (camino correcto) — ⭐ LEER ANTES DE PUBLICAR

El APK local de `builds/` está firmado con el **debug keystore** (ver Área 10). Es
válido para pruebas internas (emulador/dispositivo propio) pero **Google Play lo
RECHAZA**: necesita una clave de subida (upload key) estable y, una vez subido, no
podrás actualizar la app si pierdes esa clave. El bloque `signingConfigs` de
`android/app/build.gradle` **no es la fuente de verdad** — `android/` está
gitignored y se regenera en cada `expo prebuild`. **No edites ahí la firma.**

**Camino recomendado (EAS Managed Credentials → AAB firmado):** es el flujo que ya
declara `eas.json` (`production` → `app-bundle` + `autoIncrement`; `submit` →
track `internal`). EAS genera/custodia el keystore de release en la nube y firma el
`.aab` — el debug keystore local queda fuera del circuito.

```bash
# 1. Login + vincular el proyecto (crea extra.eas.projectId en app.config.ts)
eas login
eas init

# 2. (Una sola vez) Generar/gestionar credenciales de Android. Acepta que EAS
#    cree el keystore de release, o sube el tuyo. NO se commitea nunca.
eas credentials            # Android → Keystore → Set up a new keystore

# 3. Build de producción firmado (Android App Bundle .aab)
eas build --profile production --platform android

# 4. Subir a Play (track internal configurado en eas.json → submit.production)
eas submit --profile production --platform android --latest
```

**Play App Signing:** al crear la app en Play Console, deja que Google gestione la
clave de firma de la app y entrega tu _upload key_ (la de EAS). Tras el primer
upload, registra el **SHA-1/SHA-256 de la clave de firma de Play** en:

- el cliente **OAuth Android** de Google Cloud (Sign-In en builds de tienda),
- la **Maps SDK** API key (restricción por package + SHA-1),
- `docs/deeplinks/assetlinks.json` (verificación de App Links del APK de tienda).

> Los SHA de la Área 4/10 son del **debug keystore**; sólo sirven para builds
> locales. Los de release/Play son distintos y se obtienen tras el primer upload.

**Alternativa (build local firmado para release, sin EAS):** genera un keystore
propio y compílalo fuera del repo (`*.keystore` está gitignored):

```bash
keytool -genkeypair -v -keystore kruzo-upload.keystore -alias kruzo \
  -keyalg RSA -keysize 2048 -validity 10000
# Pasa store/keyPass por variables o gradle.properties (NUNCA al repo) y compila
# ./gradlew :app:bundleRelease  (AAB)  o  :app:assembleRelease  (APK)
```

### Backend que debe estar desplegado para que la app de tienda funcione

- **Reglas Firestore endurecidas** — ✅ desplegadas.
- **Cloud Functions** `onReviewWritten`, `onUserFavoritesWritten`,
  `onBusinessWritten` — ✅ desplegadas.
- **`deleteAccount` (callable, NUEVA)** — ⏳ requiere
  `firebase deploy --only functions:deleteAccount`. Da soporte al requisito de
  **eliminación de cuenta in-app** de Google Play (Settings → Zona de peligro).
  Sin este deploy, el botón "Eliminar cuenta" devolverá `functions/internal`.

## Clasificación de preparación

| Dimensión          | Estado                                                                    |
| ------------------ | ------------------------------------------------------------------------- |
| Código             | ✅ Listo (tsc/eslint/jest/doctor/bundle en verde)                         |
| Arquitectura       | ✅ Listo                                                                  |
| Seguridad          | ✅ Listo (sin secretos; reglas autoritativas)                             |
| Firebase           | ✅ Auth/Firestore/Storage listos; ⚠️ FCM requiere `google-services.json`  |
| Android (build)    | ✅ APK release v2-firmado **generado y verificado** (arm64-v8a, 34.91 MB) |
| Producción (store) | ⚠️ Requiere credenciales externas (ver abajo)                             |

## Bloqueos restantes (sólo dependen de credenciales/cuentas externas)

1. **EAS:** `eas login` + `eas init` (projectId) para builds en la nube y push token.
2. **`google-services.json`** (Firebase consola) para FCM.
3. **Google OAuth** (cliente Android+Web, SHA-1) para Sign-In en dispositivo.
4. **Maps API key** (Google Cloud) para el mapa.
5. **Keystore de release** + **Play Console** para publicar → usar **EAS Managed
   Credentials** (camino exacto en **Área 11**); el debug keystore NO sirve para Play.
6. **Hosting** de `assetlinks.json` / AASA en `kruzo.bo` para verificación de links.
7. **Deploy de `deleteAccount`** (`firebase deploy --only functions:deleteAccount`)
   para habilitar la eliminación de cuenta in-app exigida por Google Play.
