<?php
/**
 * SalaryTracker — Endpoint de descarga de la app
 *
 * Un `.app` de macOS es un *bundle* (un directorio), y un directorio no se
 * puede descargar por HTTP tal cual. Por eso este endpoint **empaqueta el
 * bundle al vuelo** en un zip (preservando permisos, p. ej. el bit ejecutable)
 * cuando no hay una copia cacheada, y sirve ese zip.
 *
 * El archivo se sirve con el nombre `SalaryTracker.app`, como se pidió. OJO:
 * macOS clasifica un fichero llamado `.app` por su extensión, así que si el
 * navegador NO lo auto-expande (típico en Chrome/Firefox) el usuario recibe un
 * comprimido llamado `.app` que no abre. En Safari, al ser un `application/zip`
 * y tener "abrir archivos seguros" activado, se expande. Si se quiere máxima
 * fiabilidad, servir como `SalaryTracker.app.zip` (macOS lo expande solo).
 *
 * NOTA: este endpoint NO envía correos ni registra descargas. El aviso por
 * correo de cada descarga lo dispara el frontend (main.js → Web3Forms), sin
 * backend. Aquí solo se sirve el archivo.
 *
 * Deploy: se copia solo a dist/ en `npm run build` (vive en public/) y se
 * sube con el resto del build a public_html del hosting.
 */

declare(strict_types=1);

// ── Configuración ──────────────────────────────────────────────────────────
const APP_NAME      = 'SalaryTracker';
const APP_VERSION   = '1.0.0-macos-universal';
const APP_BUNDLE    = 'SalaryTracker.app';       // nombre del bundle en disco
const DOWNLOAD_NAME = 'SalaryTracker.app';       // nombre con el que se descarga

$downloadsDir = __DIR__ . '/downloads';
$appDir       = $downloadsDir . '/' . APP_BUNDLE;
$cacheDir     = $downloadsDir . '/.cache';
// Zip "estático" legado (opcional). Solo se usa si por algún motivo no está el
// .app; el bundle es la fuente de verdad.
$legacyZip    = $downloadsDir . '/' . APP_NAME . '-' . APP_VERSION . '.zip';

// ── Helpers ────────────────────────────────────────────────────────────────
function disabledFunctions(): array
{
    $raw = (string) ini_get('disable_functions');
    return array_values(array_filter(array_map('trim', explode(',', $raw)), static fn ($f) => $f !== ''));
}

// Firma del bundle: cambia cuando cambia cualquier archivo (mtime/tamaño), para
// invalidar la caché al publicar una versión nueva.
function bundleSignature(string $dir): string
{
    $parts = [];
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    foreach ($it as $path => $info) {
        /** @var SplFileInfo $info */
        $parts[] = substr((string) $path, strlen($dir)) . ':' . $info->getMTime() . ':' . $info->getSize();
    }
    sort($parts);
    return substr(sha1(implode('|', $parts)), 0, 12);
}

// Añade el árbol del bundle a un ZipArchive preservando permisos Unix.
function addBundleToZip(ZipArchive $zip, string $dir): void
{
    $base = rtrim(dirname($dir), '/\\');
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    foreach ($it as $path => $info) {
        /** @var SplFileInfo $info */
        $rel = str_replace('\\', '/', substr((string) $path, strlen($base) + 1));
        if ($info->isDir()) {
            $zip->addEmptyDir($rel . '/');
        } elseif ($info->isFile()) {
            $zip->addFile((string) $path, $rel);
            $perms = @fileperms((string) $path) & 0xFFFF; // incluye S_IFREG + modo
            if ($perms > 0 && method_exists($zip, 'setExternalAttributesName')) {
                $zip->setExternalAttributesName($rel, ZipArchive::OPSYS_UNIX, $perms << 16);
            }
        }
    }
}

// Construye el zip del bundle de forma atómica (tmp + rename) para que las
// descargas concurrentes nunca lean un archivo a medias.
function buildBundleZip(string $dir, string $dest): bool
{
    $tmp = $dest . '.' . getmypid() . '.tmp';
    @unlink($tmp);

    // 1) ext-zip (PHP puro): preserva el bit ejecutable vía external attributes.
    if (class_exists('ZipArchive')) {
        $zip = new ZipArchive();
        if ($zip->open($tmp, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            addBundleToZip($zip, $dir);
            $ok = $zip->close();
            if ($ok && is_file($tmp) && filesize($tmp) > 0) {
                return @rename($tmp, $dest);
            }
            @unlink($tmp);
        }
    }

    // 2) CLI `zip`: preserva permisos y symlinks de forma nativa (fallback).
    if (function_exists('exec') && !in_array('exec', disabledFunctions(), true)) {
        $base = rtrim(dirname($dir), '/\\');
        $root = basename($dir);
        $out  = [];
        $code = 0;
        exec(
            'cd ' . escapeshellarg($base) . ' && zip -r -y -q '
                . escapeshellarg($tmp) . ' ' . escapeshellarg($root) . ' 2>&1',
            $out,
            $code
        );
        if ($code === 0 && is_file($tmp) && filesize($tmp) > 0) {
            return @rename($tmp, $dest);
        }
        @unlink($tmp);
    }

    return false;
}

// ── Resolver qué servir ────────────────────────────────────────────────────
$downloadPath = null;
$downloadName = DOWNLOAD_NAME;

if (is_dir($appDir)) {
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
    }

    $signature = bundleSignature($appDir);
    $cacheFile = $cacheDir . '/' . APP_NAME . '-' . $signature . '.zip';

    // Si no hay caché válida, generar (en .cache o, si no es escribible, en el tmp del sistema).
    if (!is_file($cacheFile) || filesize($cacheFile) === 0) {
        if (!is_dir($cacheDir) || !is_writable($cacheDir)) {
            $cacheFile = rtrim(sys_get_temp_dir(), '/\\') . '/' . APP_NAME . '-' . $signature . '.zip';
        }
        if (!is_file($cacheFile) || filesize($cacheFile) === 0) {
            buildBundleZip($appDir, $cacheFile);
        }
    }

    if (is_file($cacheFile) && is_readable($cacheFile)) {
        $downloadPath = $cacheFile;
    }
} elseif (is_file($legacyZip) && is_readable($legacyZip)) {
    // Fallback por si el bundle no está desplegado pero sí un zip preexistente.
    $downloadPath = $legacyZip;
    $downloadName = basename($legacyZip);
}

// ── Verificar que hay algo que servir ──────────────────────────────────────
if ($downloadPath === null) {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo "La app aún no está disponible. Inténtalo más tarde.\n";
    exit;
}

// ── Servir el archivo ──────────────────────────────────────────────────────
http_response_code(200);
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $downloadName . '"');
header('Content-Length: ' . filesize($downloadPath));
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate');

readfile($downloadPath);
exit;
