# SalaryTracker — Landing page

Landing estática (marketing) de **SalaryTracker**, la app de Menu Bar para macOS
que muestra en tiempo real cuánto de tu sueldo periódico ya has ganado.

- **App (repo hermano):** [`autocreativa-salarytracker-app`](https://github.com/autocreativa/autocreativa-salarytracker-app)
  — Swift / SwiftUI, macOS 13+, 100 % local y offline.
- **Deploy:** hosting compartido con PHP (`.htaccess`, `php.ini`, `.user.ini` y
  `cgi-bin` ya están en el build; por eso `dist/` **no** se versiona).

## Stack

Sin framework de UI ni build step obligatorio:

- HTML + Tailwind CSS vía CDN (`cdn.tailwindcss.com`) con tokens de marca en
  `tailwind.config` (paleta `botanical`, tipografías Epilogue / Manrope /
  Share Tech Mono / VT323).
- JavaScript ES modules sin framework (`main.js`): detección de SO para el botón
  de descarga y las tarjetas de plataforma, resalte del SO detectado y un
  contador "vivo" de demonstration (saldo, barra de Menu Bar y progreso) que
  corre a 10 ticks/s.
- Google Fonts por CDN.

## Estructura

```
.
├── index.html          # página completa (hero, features, cómo usarlo, Autocreativa, footer)
├── main.js             # lógica: detección de SO, botón de descarga, contador vivo de demo (10 ticks/s)
├── style.css           # estilos propios (los que Tailwind no cubre)
├── public/             # favicon.svg, icons.svg
├── package.json        # solo para vite (dev server + build → dist/)
└── dist/               # build de despliegue (ignorado por git)
```

`src/` es un resto del scaffold de Vite (demo del contador) y **no** se usa:
la landing se sirve desde `index.html` en la raíz.

## Desarrollo

```bash
npm install

# servidor de desarrollo (http://localhost:5173)
npm run dev

# build de despliegue en dist/
npm run build

# previsualizar el build
npm run preview
```

> Para iterar rápido también puedes abrir `index.html` directamente en el
> navegador: no hay build step real porque Tailwind y las fuentes se cargan por CDN.

## Configuración rápida

- **Botón de descarga:** objeto `DOWNLOADS` al inicio de `main.js`. En macOS,
  `url: '#'` — reemplazar por la URL del `.app`/`.dmg` (alojado en el repo de la
  app o en GitHub Releases) cuando exista.
- **Otros SO:** `OTHER_OS_URL` apunta a `https://autocreativa.com/`.
- **Textos de marketing:** directamente en `index.html`.

## Publicación

1. `npm run build` → `dist/`.
2. Subir el **contenido** de `dist/` al hosting (incluye `.htaccess`, `php.ini`,
   `.user.ini`, `cgi-bin/` y `.well-known/`).
3. Verificar en móvil y escritorio: el diseño es responsive (`lg:` breakpoints).

## No versionado

`node_modules/`, `dist/`, `src/` (restos de Vite), `stitch_*/` (export del diseño)
y `.DS_Store`. Ver `.gitignore`.