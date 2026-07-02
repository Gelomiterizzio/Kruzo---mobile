# Política de privacidad de KRUZO

> **Fuente pública:** esta política se publica en `https://kruzo.bo/privacy`
> (código: `web/app/(main)/privacy/page.tsx`). Este archivo es la copia de
> referencia del repositorio y la base del formulario **Data Safety** de Google
> Play. Última actualización: **14 de junio de 2026**.

KRUZO ("la plataforma", "nosotros") es un marketplace de negocios y
emprendimientos locales de Santa Cruz de la Sierra, Bolivia, disponible como
sitio web y como aplicación Android. Esta política describe con precisión qué
datos personales recopilamos, para qué los usamos, dónde se almacenan, con quién
se comparten y qué derechos tienes sobre ellos. Aplica al sitio web y a la
aplicación móvil, salvo donde se indique lo contrario.

## 1 · Datos que recopilamos

**1.1 Cuenta**

- **Registro con email:** email y contraseña. La contraseña la gestiona Firebase
  Authentication de forma cifrada; nunca la vemos ni la almacenamos en texto plano.
- **Inicio de sesión con Google:** nombre, email y foto de perfil, tal como los
  comparte Google al autorizar.

**1.2 Perfil (opcional, lo completa el usuario)** — nombre visible, foto,
teléfono, biografía, ciudad (campo de **texto libre**, por defecto "Santa Cruz de
la Sierra, Bolivia") y preferencias de notificaciones.

**1.3 Contenido publicado**

- **Negocios:** la información comercial que su dueño publica (nombre,
  descripción, dirección, zona, WhatsApp/teléfono, email, web, horarios, fotos).
  Es **pública por diseño**.
- **Publicaciones:** título, descripción, precio, fotos.
- **Reseñas:** calificación y comentario, mostrados con el nombre y foto del autor.
- **Fotos:** subidas desde galería o cámara a Firebase Storage (máx. 5 MB).

**1.4 Actividad** — favoritos; contadores **agregados y anónimos** (visitas,
número de favoritos, promedios de calificación — no se registra qué usuario
visitó qué negocio); fechas de alta y última actividad.

**1.5 Push (solo app, opcional)** — si el usuario acepta notificaciones se
genera un token de dispositivo (Expo/FCM) asociado a su cuenta. Revocable desde
los ajustes de Android.

## 2 · Datos que NO recopilamos

- **Ubicación del dispositivo:** la app **no solicita permisos de ubicación ni
  accede al GPS** (verificado: sin `expo-location`, sin `showsUserLocation`). El
  mapa muestra la dirección publicada del negocio, no la posición del usuario.
- **Contactos, SMS, llamadas, micrófono:** no se solicitan (RECORD_AUDIO
  bloqueado explícitamente en el build).
- **Pagos:** no se procesan ni almacenan datos financieros.
- **Publicidad/rastreo en la app:** sin SDKs de anuncios, sin advertising ID,
  **sin SDK de analítica en la app Android**.
- El contacto con negocios ocurre por WhatsApp/llamada **fuera de KRUZO**.

## 3 · Permisos Android (y su uso real)

| Permiso                  | Uso                                            |
| ------------------------ | ---------------------------------------------- |
| Internet / estado de red | Funcionamiento y modo sin conexión             |
| Cámara + fotos/galería   | Solo al subir imágenes elegidas por el usuario |
| Notificaciones           | Avisos (nueva reseña, negocio aprobado)        |

## 4 · Dónde se almacenan

- **Servidores (Google Firebase):** Authentication, Cloud Firestore y Cloud
  Functions en **southamerica-east1 (São Paulo, Brasil)**; Storage/otros servicios
  pueden procesar en otras regiones de Google con sus salvaguardas contractuales.
- **Dispositivo:** sesión (AsyncStorage), caché de contenido para offline
  (expira en 24 h), favoritos y preferencia de tema. Se borran al cerrar sesión o
  desinstalar.

## 5 · Para qué se usan

Operar la plataforma (negocios/publicaciones/reseñas/favoritos), mantener la
sesión, sincronizar web↔app, notificaciones, estadísticas agregadas para dueños
de negocio, y moderación/prevención de abuso. **No vendemos datos personales** ni
los compartimos con terceros con fines de marketing.

## 6 · Terceros (encargados del tratamiento)

- **Google Firebase** (auth, base de datos, storage, functions, FCM) —
  [firebase.google.com/support/privacy](https://firebase.google.com/support/privacy)
- **Google Sign-In** (opcional) — [policies.google.com/privacy](https://policies.google.com/privacy)
- **Google Maps** (mapa del negocio; Google recibe datos técnicos estándar de la
  solicitud, p. ej. IP)
- **Expo** (entrega de push) — [expo.dev/privacy](https://expo.dev/privacy)
- **Solo web:** Firebase Analytics (agregado) y cookies de Google AdSense **si**
  hay anuncios activos. La app Android no incluye analítica ni anuncios.

## 7 · Cookies (solo web)

Una cookie de sesión propia estrictamente necesaria. Cookies de terceros solo si
hay anuncios activos (§6). La app Android no usa cookies.

## 8 · Seguridad

TLS/HTTPS en tránsito; reglas de seguridad de Firestore validadas (cada usuario
solo modifica lo suyo; campos sensibles —roles, verificación, sanciones— solo
admin/servidor); contraseñas gestionadas por Firebase Authentication; la
eliminación de cuenta la ejecuta una Cloud Function privilegiada.

## 9 · Transferencias internacionales

Procesamiento en la infraestructura global de Google Cloud (principalmente São
Paulo, Brasil), con el marco contractual de Google (incluidas cláusulas
contractuales tipo) cuando cruza fronteras.

## 10 · Eliminación de cuenta y conservación

Desde la **app** (Configuración → Eliminar cuenta) o la web. La Cloud Function
`deleteAccount` elimina: la cuenta de acceso, el perfil y notificaciones, los
negocios propios (con sus publicaciones y reseñas recibidas) y las reseñas
escritas en otros negocios (los promedios se recalculan). Inmediata y **no
reversible**. Copias de seguridad operativas pueden persistir un periodo
limitado antes de purgarse. Los contadores agregados y anónimos no identifican a
la cuenta y pueden conservarse.

## 11 · Derechos del usuario

Acceso y rectificación desde Configuración; eliminación vía borrado de cuenta;
para otras solicitudes (acceso, corrección, eliminación, oposición,
portabilidad): **hola@kruzo.bo** _(placeholder — confirmar buzón real)_.

## 12 · Menores

Plataforma de uso general para mayores de 13 años; no dirigida a niños. Cuentas
de menores de 13 detectadas serán eliminadas.

## 13 · Cambios

Los cambios relevantes actualizan la fecha del encabezado y se anuncian en la
plataforma antes de entrar en vigor.

## 14 · Contacto

Responsable: KRUZO _(completar razón social/persona responsable)_. Privacidad:
**hola@kruzo.bo** _(placeholder)_.

---

### Anexo — mapeo al formulario Data Safety de Google Play (guía interna)

| Pregunta Play                        | Respuesta correcta                                     |
| ------------------------------------ | ------------------------------------------------------ |
| ¿Recopila datos?                     | Sí                                                     |
| Email / Nombre / Foto                | Sí — funcionalidad de la app (cuenta); opcional Google |
| Teléfono / Bio / Ciudad              | Sí — opcional, perfil público                          |
| Fotos                                | Sí — subidas por el usuario (contenido)                |
| **Ubicación (precisa o aproximada)** | **NO** (sin permisos de ubicación)                     |
| IDs de dispositivo / advertising ID  | No                                                     |
| Historial de navegación / apps       | No                                                     |
| Datos financieros                    | No                                                     |
| ¿Se comparten datos con terceros?    | No (proveedores = encargados, no "sharing" según Play) |
| ¿Datos cifrados en tránsito?         | Sí                                                     |
| ¿Eliminación de datos disponible?    | Sí — in-app (Configuración → Eliminar cuenta)          |
| ¿Anuncios?                           | No (app sin anuncios)                                  |
