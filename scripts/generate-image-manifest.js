#!/usr/bin/env node
/**
 * Scans public/optimized/images and emits src/generated/imageManifest.json,
 * keyed by source basename (public/images/{base}.{ext} minus extension).
 *
 * Variant filename shapes:
 *   {base}-{width}w.{avif|webp}                  -> static
 *   {base}-animated-{width}w.webp                -> animatedThumb
 *   {base}-animated-detail-{width}w.webp         -> animatedDetail
 *   {base}-poster-{width}w.webp                  -> poster
 *
 * Also records the intrinsic dimensions (w/h) of each source image in
 * public/images via `sips` when available (macOS), for CLS-free rendering.
 */

const fs = require("fs")
const path = require("path")
const { execFileSync } = require("child_process")

const ROOT = path.join(__dirname, "..")
const OPTIMIZED_DIR = path.join(ROOT, "public", "optimized", "images")
const SOURCE_DIR = path.join(ROOT, "public", "images")
const OUT_FILE = path.join(ROOT, "src", "generated", "imageManifest.json")

const VARIANT_RE = /^(.+?)-(?:(animated-detail|animated|poster)-)?(\d+)w\.(avif|webp)$/
const CLASS_KEYS = { "animated-detail": "animatedDetail", animated: "animatedThumb", poster: "poster" }
const DIMENSION_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"])

const manifest = {}

for (const dir of [OPTIMIZED_DIR, SOURCE_DIR]) {
  if (!fs.existsSync(dir)) {
    console.error(`generate-image-manifest: missing directory ${dir}`)
    process.exit(1)
  }
}

let parsed = 0
for (const file of fs.readdirSync(OPTIMIZED_DIR)) {
  const match = VARIANT_RE.exec(file)
  if (!match) continue
  parsed += 1
  const [, base, variantClass, widthString, format] = match
  const width = Number(widthString)
  const entry = (manifest[base] ??= {})
  if (variantClass) {
    const key = CLASS_KEYS[variantClass]
    ;(entry[key] ??= []).push(width)
  } else {
    entry.static ??= {}
    ;(entry.static[format] ??= []).push(width)
  }
}

if (parsed === 0) {
  console.error(`generate-image-manifest: no variant files parsed in ${OPTIMIZED_DIR}`)
  process.exit(1)
}

for (const entry of Object.values(manifest)) {
  for (const key of ["poster", "animatedThumb", "animatedDetail"]) {
    if (entry[key]) entry[key].sort((a, b) => a - b)
  }
  if (entry.static) {
    for (const widths of Object.values(entry.static)) widths.sort((a, b) => a - b)
  }
}

let sipsAvailable = true
function readDimensions(filePath) {
  if (!sipsAvailable) return null
  try {
    const output = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
    const w = Number(/pixelWidth: (\d+)/.exec(output)?.[1])
    const h = Number(/pixelHeight: (\d+)/.exec(output)?.[1])
    return w && h ? { w, h } : null
  } catch (error) {
    if (error.code === "ENOENT") sipsAvailable = false
    return null
  }
}

for (const file of fs.readdirSync(SOURCE_DIR)) {
  const extension = path.extname(file).toLowerCase()
  if (!DIMENSION_EXTENSIONS.has(extension)) continue
  const base = path.basename(file, path.extname(file))
  const dims = readDimensions(path.join(SOURCE_DIR, file))
  if (!dims) continue
  const entry = (manifest[base] ??= {})
  entry.w = dims.w
  entry.h = dims.h
}

const sorted = Object.fromEntries(
  Object.keys(manifest)
    .sort()
    .map((key) => [key, manifest[key]]),
)

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
fs.writeFileSync(OUT_FILE, `${JSON.stringify(sorted, null, 2)}\n`)
console.log(
  `generate-image-manifest: ${parsed} variant files -> ${Object.keys(sorted).length} entries`,
)
