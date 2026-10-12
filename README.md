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
├── public/             # favicon.svg, icons.svg, download.php, downloads/ (la app)
├── package.json        # solo para vite (dev server + build → dist/)
└── dist/               # build de despliegue (ignorado por git)
```

`public/download.php` + `public/downloads/` se copian solos al build (vite copia
todo `public/` a la raíz de `dist/`): el botón de descarga Mac sirve el
`SalaryTracker.app`, que `download.php` empaqueta **al vuelo** en un zip
(porque un `.app` es un directorio y no se puede descargar directo). El aviso
por correo de cada descarga es **100 % frontend** (`main.js` → Web3Forms), sin
backend. Ver `public/downloads/README.md`.

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

- **Botón de descarga:** objeto `DOWNLOADS` al inicio de `main.js`. En macOS
  apunta a `/download.php`, que empaqueta al vuelo `public/downloads/SalaryTracker.app`
  en un zip y lo sirve con el nombre `SalaryTracker.app`. El endpoint solo sirve
  el archivo; no envía correos (constantes `APP_BUNDLE` / `DOWNLOAD_NAME` en
  `public/download.php`).
  - Nota: un `.app` es un directorio; el archivo servido es en realidad un zip
    con extensión `.app`. Safari lo expande solo; en Chrome/Firefox hay que
    renombrarlo a `.zip` para abrirlo (para máxima compatibilidad, usar
    `SalaryTracker.app.zip` o un `.dmg`).
- **Aviso por correo de descargas (sin backend):** al pulsar "Descargar para
  macOS", `main.js` hace un POST a **Web3Forms** con los datos de contexto. Crea
  una `access_key` gratis en <https://web3forms.com> (te llega por correo) y
  pégala en `WEB3FORMS_ACCESS_KEY` al inicio de `main.js`. El aviso llega a la
  dirección con la que registraste la key; la key es pública y segura en el
  cliente. El aviso se dispara al hacer clic (no se puede confirmar desde el
  navegador que la descarga terminó).
- **Otros SO:** `OTHER_OS_URL` apunta a `https://autocreativa.com/`.
- **Textos de marketing:** directamente en `index.html`.

## Publicación

1. `npm run build` → `dist/` (incluye `download.php` y `downloads/` copiados de `public/`).
2. Subir el **contenido** de `dist/` al hosting (incluye `.htaccess`, `php.ini`,
   `.user.ini`, `cgi-bin/`, `.well-known/`, `download.php` y `downloads/`).
3. Asegurar que la carpeta `downloads/` exista en el hosting y sea escribible
   por PHP para cachear el zip generado desde el `.app` (`downloads/.cache/`).
   Si no hay permiso de escritura, usa el directorio temporal del sistema.
4. Verificar en móvil y escritorio: el diseño es responsive (`lg:` breakpoints).

## No versionado

`node_modules/`, `dist/`, `src/` (restos de Vite), los binarios de la app
(`public/downloads/*.app/`, `*.zip` y `.cache/`), `logs/`, `stitch_*/` (export
del diseño) y `.DS_Store`. Ver `.gitignore`.