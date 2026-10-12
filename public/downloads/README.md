# public/downloads/ — Distribución de la app

Carpeta para **subir el instalador junto con el proyecto**. El build
(`npm run build`) copia este directorio a `dist/downloads/` y se sube tal cual a
`public_html/downloads/` del hosting.

## Contenido

| Archivo | Descripción |
|---|---|
| `SalaryTracker-<versión>.dmg` | Instalador de la app (imagen de disco UDIF comprimida). Es la **fuente de verdad**: `download.php` lo sirve **tal cual** (un `.dmg` es un fichero único, no hay que empaquetar nada). **No** se versiona en git: es un artefacto del build del repo de la app. |

## Flujo de descarga

1. El botón "Descargar para macOS" apunta a `/download.php` (ver `main.js`).
2. Al hacer clic, `main.js` dispara **desde el navegador** el aviso por correo
   (Web3Forms) — sin backend.
3. `download.php` sirve el `.dmg` con `Content-Disposition: attachment; filename="SalaryTracker-<versión>.dmg"`
   y `Content-Type: application/x-apple-diskimage`.

> `download.php` **no** envía correos ni registra descargas: el aviso por correo
> es 100 % frontend (ver `WEB3FORMS_ACCESS_KEY` en `main.js`).

## Para publicar una versión nueva

1. Sustituye el `.dmg` por el de la versión nueva, con el nombre
   `SalaryTracker-<versión>.dmg` (p. ej. `SalaryTracker-1.0.1.dmg`).
2. Actualiza `APP_VERSION` en `public/download.php` **y** en `main.js` (de ahí
   salen el nombre del archivo servido y el texto del aviso por correo).
3. Sube el `.dmg` nuevo al hosting (`downloads/`).
