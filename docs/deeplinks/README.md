# Deep links — hosting instructions

The app declares App Links / Universal Links for `kruzo.bo` (see `app.config.ts`
→ `android.intentFilters` and `ios.associatedDomains`). For the OS to **verify**
them (open links directly in the app, no chooser), host these two files on the
domain over HTTPS:

## Android — `https://kruzo.bo/.well-known/assetlinks.json`

Use `assetlinks.json` from this folder. It contains:

- `package_name`: `bo.kruzo.app`
- `sha256_cert_fingerprints`: the **signing cert** SHA-256.
  - The value committed here is the **debug** keystore (current test APK).
  - **Before production:** replace it with your **release / Play App Signing**
    SHA-256 (Play Console → Setup → App signing). You can include multiple
    fingerprints (upload key + Play signing key).
  - Get a key's SHA-256:
    `keytool -list -v -keystore <keystore> -alias <alias>`

Served `Content-Type: application/json`, no redirects.

## iOS — `https://kruzo.bo/.well-known/apple-app-site-association`

Use `apple-app-site-association` (no extension). Replace `TEAMID` with your Apple
Developer **Team ID**. Served as `application/json`, no redirects, no `.json`
extension.

## Test (after hosting)

```bash
# Android verification status (on device):
adb shell pm get-app-links bo.kruzo.app

# Manually trigger a deep link:
adb shell am start -a android.intent.action.VIEW -d "https://kruzo.bo/business/some-slug"
adb shell am start -a android.intent.action.VIEW -d "kruzo://business/some-slug"
```

## Note

The custom scheme `kruzo://business|post|user/...` works **immediately** without
any hosting (no domain verification needed) — useful for testing the test APK.
