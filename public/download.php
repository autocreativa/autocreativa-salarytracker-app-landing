<?php
/**
 * SalaryTracker — Endpoint de descarga de la app
 *
 * Sirve el instalador `.dmg` (un único fichero) alojado en `downloads/`.
 * Un `.dmg` es un archivo normal, así que no hace falta empaquetar nada: se
 * entrega tal cual con las cabeceras adecuadas.
 *
 * NOTA: este endpoint NO envía correos ni registra descargas. El aviso por
 * correo de cada descarga lo dispara el frontend (main.js → Web3Forms), sin
 * backend. Aquí solo se sirve el archivo.
 *
 * Deploy: se copia solo a dist/ en `npm run build` (vive en public/) y se
 * sube con el resto del build a public_html del hosting, junto a downloads/.
 */

declare(strict_types=1);

// ── Configuración ──────────────────────────────────────────────────────────
const APP_VERSION   = '1.0.0';
const DMG_FILE      = 'SalaryTracker-' . APP_VERSION . '.dmg'; // archivo en downloads/
const DOWNLOAD_NAME = DMG_FILE;                                 // nombre con el que se descarga
const DMG_MIME      = 'application/x-apple-diskimage';

$downloadsDir = __DIR__ . '/downloads';

// ── Localizar el .dmg ──────────────────────────────────────────────────────
// 1) El archivo versionado esperado; 2) cualquier otro .dmg (por si la versión
//    cambia y aún no se ha tocado este endpoint).
$downloadPath = null;
$preferred    = $downloadsDir . '/' . DMG_FILE;
if (is_file($preferred) && is_readable($preferred)) {
    $downloadPath = $preferred;
} else {
    foreach (glob($downloadsDir . '/*.dmg') ?: [] as $candidate) {
        if (is_file($candidate) && is_readable($candidate)) {
            $downloadPath = $candidate;
            break;
        }
    }
}

// ── Verificar que hay algo que servir ──────────────────────────────────────
if ($downloadPath === null) {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo "El instalador no está disponible ahora mismo. Inténtalo más tarde.\n";
    exit;
}

// ── Servir el archivo ──────────────────────────────────────────────────────
http_response_code(200);
header('Content-Type: ' . DMG_MIME);
header('Content-Disposition: attachment; filename="' . DOWNLOAD_NAME . '"');
header('Content-Length: ' . filesize($downloadPath));
header('Content-Transfer-Encoding: binary');
header('Accept-Ranges: none');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate');

// Evita que un output buffering previo infle/corrompa la descarga.
while (ob_get_level() > 0) {
    ob_end_clean();
}

set_time_limit(0);
readfile($downloadPath);
exit;
