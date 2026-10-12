# public/downloads/ — Distribución de la app

Carpeta para **subir la app junto con el proyecto**. El build (`npm run build`)
copia este directorio a `dist/downloads/` y se sube tal cual a `public_html/downloads/`
del hosting.

## Contenido

| Archivo | Descripción |
|---|---|
| `SalaryTracker.app/` | El bundle de la app (copiado de `~/Downloads`). Es la **fuente de verdad**: `download.php` lo empaqueta al vuelo. Un bundle es un directorio y no se puede descargar por HTTP tal cual, por eso se zipea en el servidor. |
| `.cache/` | Zips generados por `download.php` (se crea en el servidor; no se versiona). |

> Ya **no** se mantiene un `.zip` estático: `download.php` genera el empaquetado
> a partir de `SalaryTracker.app/`. Si existe un zip antiguo, solo se usa como
> fallback cuando el bundle no está presente.

## Flujo de descarga

1. El botón "Descargar para macOS" apunta a `/download.php` (ver `main.js`).
2. Al hacer clic, `main.js` dispara **desde el navegador** el aviso por correo
   (Web3Forms) — sin backend.
3. `download.php` solo sirve el archivo:
   - empaqueta `SalaryTracker.app/` en un zip (preservando permisos, p. ej. el
     bit ejecutable) y lo cachea en `downloads/.cache/`; si el servidor no
     permite escribir ahí, usa el directorio temporal del sistema,
   - lo sirve con el nombre `SalaryTracker.app` y `Content-Disposition: attachment`.

> OJO: un `.app` es un directorio, así que el archivo servido es un **zip** con
> nombre `.app`. macOS lo categoriza por la extensión: en **Safari** (con
> "abrir archivos seguros") se expande y queda la app; en **Chrome/Firefox** se
> descarga un comprimido llamado `.app` que hay que renombrar a `.zip` para
> abrirlo. Si se quiere máximo compatibilidad, servir como
> `SalaryTracker.app.zip` (macOS lo expande solo) o empaquetar un `.dmg`.

> `download.php` **no** envía correos ni registra descargas: el aviso por correo
> es 100 % frontend (ver `WEB3FORMS_ACCESS_KEY` en `main.js`).

## Para publicar una versión nueva

1. Reemplaza el `SalaryTracker.app/` por el bundle de la nueva versión.
2. Actualiza `APP_VERSION` en `public/download.php` y `main.js` (nombre del zip
   legacy y texto del aviso por correo).
3. La caché se invalida sola (la firma del bundle cambia con mtime/tamaño).
