/* eslint-disable */
// Generates KRUZO placeholder app assets (icon / adaptive icon / splash) as PNGs.
// Uses a vector "K" (no font dependency) on the brand gradient. Replace with the
// final brand artwork before a Play Store release (see docs/07).
//
// Run:  node scripts/generate-icons.cjs
// Requires `sharp` (this repo borrows it from ../web/node_modules at build time;
// for CI/local without web, run `npm i -D sharp` first).
const fs = require('fs')
const path = require('path')

let sharp
try {
  sharp = require('sharp')
} catch {
  sharp = require(path.resolve(__dirname, '../../web/node_modules/sharp'))
}

const OUT = path.resolve(__dirname, '../assets')
fs.mkdirSync(OUT, { recursive: true })

// Bold vector "K" paths centered on a 1024 canvas (white fill).
const K = `
  <rect x="356" y="300" width="118" height="424" rx="16"/>
  <path d="M474 512 L636 300 L762 300 L556 540 Z"/>
  <path d="M556 484 L762 724 L636 724 L474 512 Z"/>
`

const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ff6b35"/><stop offset="1" stop-color="#ff4500"/>
  </linearGradient></defs>
  <rect width="1024" height="1024" rx="224" fill="url(#g)"/>
  <g fill="#ffffff">${K}</g>
</svg>`

// Adaptive foreground: white K on transparent (background color set in app.config).
const fgSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <g fill="#ffffff">${K}</g>
</svg>`

// Splash logo: brand-orange K on transparent (visible on light & dark splash bg).
const splashSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <g fill="#ff4500">${K}</g>
</svg>`

async function gen() {
  await sharp(Buffer.from(iconSvg)).png().toFile(path.join(OUT, 'icon.png'))
  await sharp(Buffer.from(fgSvg)).png().toFile(path.join(OUT, 'adaptive-icon.png'))
  await sharp(Buffer.from(splashSvg)).png().toFile(path.join(OUT, 'splash-icon.png'))
  await sharp(Buffer.from(iconSvg)).resize(48, 48).png().toFile(path.join(OUT, 'favicon.png'))
  console.log('Generated:', fs.readdirSync(OUT).join(', '))
}
gen().catch((e) => {
  console.error(e)
  process.exit(1)
})
