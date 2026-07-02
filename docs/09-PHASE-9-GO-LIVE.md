# KRUZO Mobile — FASE 9: Release Engineering & Go-Live

> Estado tras la auditoría 8F (Release Candidate). Este documento es la **fuente de
> verdad para publicar**: qué quedó verificado, qué falta (y por qué solo puede
> hacerlo el dueño de las cuentas), en qué orden ejecutarlo y cómo comprobar cada
> paso. Con este documento, un desarrollador puede publicar sin contexto previo.

---

## 1 · Barrido de configuración de producción (resultado)

| Ítem                       | Estado | Detalle                                                                                   |
| -------------------------- | :----: | ----------------------------------------------------------------------------------------- |
| `applicationId` / package  |   ✅   | `bo.kruzo.app` consistente (app.config, gradle, google-services)                          |
| versionName / versionCode  |   ✅   | `1.0.0` / EAS **remote** + `autoIncrement` (eas.json) — no tocar el `1` local de gradle   |
| Iconos / adaptive / splash |   ✅   | Presentes y referenciados; splash con variante dark. ⚠️ son placeholder "K" — ver §5      |
| Permisos Android           |   ✅   | Mínimos y justificados. `RECORD_AUDio` y `SYSTEM_ALERT_WINDOW` **bloqueados** (Fase 9)    |
| Deep links / App Links     |   ✅   | `kruzo://` + intent-filters `https://kruzo.bo/{business,post,user}` con autoVerify        |
| `usesCleartextTraffic`     |   ✅   | No presente (solo HTTPS)                                                                  |
| Componentes exportados     |   ✅   | 7, todos estándar (launcher/firebase/expo receivers)                                      |
| New Architecture / Hermes  |   ✅   | `newArchEnabled: true` (default estable SDK 53) + Hermes                                  |
| `.env` / secretos          |   ✅   | Gitignored; validados con Zod al arranque (fail-fast); config Firebase pública por diseño |
| `eas.json`                 |   ✅   | dev (APK) / preview (APK) / production (**AAB** + autoIncrement + channel + submit)       |
| expo-doctor                |   ✅   | **18/18 checks**                                                                          |
| Alineación SDK deps        |   ✅   | `expo install --check` → "Dependencies are up to date"                                    |

**Permisos finales del manifest merged de release** (evidencia
`manifest-merger-release-report.txt`): INTERNET, ACCESS_NETWORK_STATE,
ACCESS_WIFI_STATE, CAMERA (fotos del negocio), POST_NOTIFICATIONS,
FOREGROUND_SERVICE, RECEIVE_BOOT_COMPLETED, READ_APP_BADGE, VIBRATE, WAKE_LOCK,
READ/WRITE_EXTERNAL_STORAGE (legacy Android ≤12 para el picker),
USE_BIOMETRIC/USE_FINGERPRINT (expo-secure-store). **`ACCESS_FINE/COARSE_LOCATION`
ELIMINADOS** (auditoría de privacidad: ninguna feature usaba ubicación — se
removió `expo-location`, plugin + dependencia — la app NO solicita ubicación).
`SYSTEM_ALERT_WINDOW` eliminado vía `blockedPermissions` (era el overlay de dev de RN;
Play lo marca como sensible).

## 2 · Dependencias (auditoría)

- `npm audit` (prod): la **high de `undici`** y 2 moderates (`js-yaml`, `protobufjs`)
  se corrigieron con `npm audit fix` (no-breaking, lockfile actualizado, QA verde).
- Quedan **14 moderates**, todas de la familia `@expo/*` de **tooling de build**
  (cli/config-plugins/prebuild): solo se arreglan subiendo a **Expo SDK 57**
  (breaking mayor). **Riesgo aceptado para v1.0.0** — ese código NO se embarca en el
  APK. Plan: upgrade de SDK como primera tarea post-launch.
- Sin paquetes abandonados en runtime; `@gorhom/bottom-sheet` (muerto) ya eliminado en 8B.

## 3 · Métricas del build (RC v1.0.2)

| Métrica                        | Valor                                              |
| ------------------------------ | -------------------------------------------------- |
| APK universal (arm64+x86_64)   | **54.6 MB** (69.5 MB descomprimido)                |
| → dex (sin minificar)          | 23.7 MB                                            |
| → nativo por ABI               | ~18-19.5 MB c/u                                    |
| → JS (Hermes bytecode)         | 5.8 MB                                             |
| **Descarga estimada vía Play** | **~30-35 MB** (el AAB sirve 1 ABI por dispositivo) |

**Optimización post-launch documentada (no aplicada al RC por riesgo/beneficio):**
habilitar R8/`shrinkResources` vía `expo-build-properties`
(`enableProguardInReleaseBuilds`) reduciría el dex sensiblemente; requiere una
pasada de QA completa sobre el APK minificado antes de adoptarla.

## 4 · Checklist Play Store

**Código / build (hecho aquí):**

- ✅ RC estable: instalación limpia, arranque frío, 4 tabs, 0 FATAL / 0 errores JS (logcat)
- ✅ QA: prettier / eslint / tsc / jest 13/13 / expo-doctor 18/18
- ✅ Eliminación de cuenta in-app (requisito Play) — CF `deleteAccount` desplegada y validada E2E
- ✅ Reglas Firestore endurecidas desplegadas; matriz de writes 100% compatible
- ✅ Target API 35 (requisito Play 2025+) · minSdk 24
- ✅ Permisos podados y justificados; sin cleartext; catálogo interno fuera de release
- ✅ `/terms` y `/privacy` publicables (web Fase 7) — URLs requeridas por la ficha

**Cuentas / consola (requieren al dueño — manual §5):**

- ⚠️ `eas login` + `eas init` (projectId; también habilita push token)
- ⚠️ Keystore de release (EAS managed) + primer `.aab`
- ⚠️ Play Console: cuenta ($25), ficha, data safety, clasificación, screenshots
- ⚠️ `google-services.json` (FCM) — sin él no hay push en el build de tienda
- ⚠️ OAuth Android con SHA-1 **de release/Play App Signing** (Google Sign-In de tienda)
- ⚠️ Maps API key restringida (package + SHA-1 de release)
- ⚠️ `assetlinks.json` hosteado en `kruzo.bo/.well-known/` (App Links verificados)
- ⚠️ Arte final: icono/splash de marca (hoy placeholder "K"); screenshots de ficha

**Bloqueantes reales:** ninguno técnico. ❌ **No publicar sin:** keystore EAS,
ficha Play completa y data-safety coherente con los permisos declarados.

## 5 · Manual de lanzamiento (orden exacto)

> Ejecutar en este orden. Cada paso indica verificación y errores típicos.

**Paso 0 — Prerrequisitos.** Cuenta Expo (gratis), cuenta Google Play Console
($25 única vez), acceso al proyecto Firebase `kruzo-web` y a Google Cloud Console
del mismo proyecto, y control DNS/hosting de `kruzo.bo`.

**Paso 1 — Vincular EAS.** En `mobile/`: `npm i -g eas-cli && eas login && eas init`.
_Por qué:_ crea `extra.eas.projectId` (builds en la nube + `getExpoPushTokenAsync`).
_Verificar:_ `app.config.ts`/`app.json` muestra el projectId; `eas whoami` responde.
_Error típico:_ "not authorized" → la cuenta no es owner del slug `kruzo`; usa la
cuenta que creó el proyecto o cambia `slug`/`owner`.

**Paso 2 — Credenciales Android.** `eas credentials` → Android → Keystore →
"Set up a new keystore" (EAS lo genera y custodia). _Por qué:_ Play rechaza el
debug keystore; perder la upload key = no poder actualizar. _Verificar:_
`eas credentials` lista un keystore con SHA-1/SHA-256. **Anota ambos SHA.**

**Paso 3 — FCM.** Firebase Console → Project settings → añade app Android
`bo.kruzo.app` (con el SHA-1 del paso 2) → descarga `google-services.json` →
colócalo en `mobile/` (gitignored) y como secreto EAS:
`eas env:create --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json`.
_Por qué:_ sin él el build de tienda no recibe push FCM. _Verificar:_ el build de
Paso 6 no loguea "Default FirebaseApp is not initialized".

**Paso 4 — OAuth Google Sign-In.** Google Cloud Console (proyecto `kruzo-web`) →
Credentials → Create OAuth client → **Android**: package `bo.kruzo.app` + SHA-1
del paso 2. Mantén el **Web client** existente en `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
_Después del primer upload a Play:_ Play Console → App integrity → copia el SHA-1
de **Play App Signing** y crea un segundo cliente OAuth Android con ese SHA.
_Por qué:_ Play re-firma el APK; sin ese SHA el botón Google falla solo en tienda
(`DEVELOPER_ERROR`). _Verificar:_ login Google funciona en build interna.

**Paso 5 — Maps API key.** Google Cloud → APIs → habilita "Maps SDK for Android"
→ crea API key restringida (Android apps: `bo.kruzo.app` + SHA-1 del paso 2 y el
de Play App Signing) → ponla como secreto EAS `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY`
(`eas env:create`). _Verificar:_ pestaña Mapa del negocio renderiza tiles (no gris).

**Paso 6 — Build de producción.** `eas build --profile production --platform android`.
Produce el `.aab` firmado. _Verificar:_ estado "finished" en expo.dev; descarga y
prueba el artefacto con `bundletool` o sube directo a testing interno.
_Error típico:_ falla por `requireCommit` → commitea todo antes.

**Paso 7 — Play Console.** Crear app (KRUZO, español, gratis) → **acepta Play App
Signing** → completa: ficha (descripción corta/larga), screenshots (usa
`builds/kruzo-8f-rc-*.png` como base, mínimo 2, 16:9 o 9:16), icono 512px, feature
graphic 1024×500, clasificación de contenido, **Data safety** — responder con el
**anexo de mapeo de [PRIVACY_POLICY.md](PRIVACY_POLICY.md)** (email/nombre/fotos
sí; **ubicación NO** — permisos removidos; sin anuncios; sin venta de datos;
eliminación de cuenta in-app disponible), URL de privacidad
`https://kruzo.bo/privacy`.
_Verificar:_ panel sin secciones en rojo.

**Paso 8 — Subir y probar.** `eas submit --profile production --platform android --latest`
(track **internal**, ya configurado). Añade testers → instala desde el link de
testing interno → smoke test: registro, login Google, crear negocio, favoritos,
push, eliminar cuenta. **Ahora ejecuta la 2ª parte de los pasos 4-5** (SHA de Play
App Signing). _Error típico:_ primer submit puede requerir hacerlo manual desde la
consola (subir el .aab a mano) porque la app aún no existe en el track.

**Paso 9 — App Links.** Sube `docs/deeplinks/assetlinks.json` a
`https://kruzo.bo/.well-known/assetlinks.json` **actualizando el SHA-256 al de Play
App Signing**. _Verificar:_
`adb shell pm verify-app-links --re-verify bo.kruzo.app` o abrir un link
`https://kruzo.bo/business/...` en el teléfono → debe abrir la app sin diálogo.

**Paso 10 — Datos de lanzamiento.** Sembrar contenido real: aprobar (status
`active`) al menos 10-15 negocios reales con fotos vía `/admin` — **hoy producción
tiene 1 negocio `pending`** y Explorar se ve vacío. Crear el primer admin a mano
(users/{uid}.role='admin' en la consola Firebase).

**Paso 11 — Promoción a producción.** Tras días de testing interno sin crashes
(Play Console → Vitals), promociona el release del track internal → production
(rollout escalonado 20%→100%).

## 6 · Riesgos (por criticidad)

| #   | Riesgo                                                                      | Sev.               | Mitigación                                                                |
| --- | --------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------- |
| 1   | **Marketplace vacío** al lanzar (1 negocio pending) — mata retención        | 🔴 Alta (producto) | Paso 10 antes del rollout público                                         |
| 2   | Google Sign-In roto en tienda por SHA de Play App Signing ausente           | 🔴 Alta            | Paso 4 (2ª parte) + probar desde testing interno                          |
| 3   | Pérdida de upload key → imposible actualizar                                | 🔴 Alta            | EAS managed credentials (custodia en la nube)                             |
| 4   | Push sin `google-services.json`/projectId (degrada silencioso, ya logueado) | 🟠 Media           | Pasos 1 y 3                                                               |
| 5   | Moderates `@expo/*` (tooling) hasta SDK 57                                  | 🟠 Media           | Upgrade SDK post-launch; no embarca en APK                                |
| 6   | Sin crash reporting en producción (logger local únicamente)                 | 🟠 Media           | Añadir Sentry (`sentry-expo`) post-launch; Vitals de Play cubre lo básico |
| 7   | Búsqueda por texto es solo filtros (paridad web aceptada)                   | 🟡 Baja            | Roadmap: Algolia/typesense                                                |
| 8   | Escalabilidad de favoritos (N getDoc por pantalla)                          | 🟡 Baja            | OK para v1; batch `in`-queries si crece                                   |
| 9   | Assets placeholder "K"                                                      | 🟡 Baja            | Arte final antes de la ficha (Paso 7)                                     |

## 7 · Evidencias de esta fase

- expo-doctor 18/18 · `expo install --check` limpio · `npm audit fix` aplicado
  (high undici eliminada) · QA completo verde post-merge del PR #10
- Manifest merged de release inspeccionado (permisos §1); merger report como fuente
- Métricas de APK (§3) del RC real `builds/kruzo-v1.0.2-rc-release.apk`
- Capturas RC: `builds/kruzo-8f-rc-{inicio,explorar,favoritos,perfil}.png`
