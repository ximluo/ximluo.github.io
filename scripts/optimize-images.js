#!/usr/bin/env node

/* eslint-disable no-console */

const fs = require("fs/promises")
const path = require("path")
let sharp

try {
  sharp = require("sharp")
} catch (error) {
  console.warn("sharp is not installed. Skipping image optimization.")
  console.warn("Install it with: npm install --save-dev sharp")
  process.exit(0)
}

const ROOT = process.cwd()
const PUBLIC_DIR = path.join(ROOT, "public")
const SOURCE_DIR = path.join(PUBLIC_DIR, "images")
const OUTPUT_DIR = path.join(PUBLIC_DIR, "optimized", "images")
const PUBLIC_MANIFEST_PATH = path.join(OUTPUT_DIR, "manifest.json")
const SRC_MANIFEST_PATH = path.join(ROOT, "src", "generated", "imageManifest.json")

const TARGET_WIDTHS = [320, 640, 960, 1280]
const GIF_POSTER_WIDTH = 640
const LARGE_GIF_THRESHOLD_BYTES = 2 * 1024 * 1024

const STILL_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"])
const GIF_EXTENSION = ".gif"

const WEBP_QUALITY = 90
const AVIF_QUALITY = 52

function toPosixPath(value) {
  return value.split(path.sep).join("/")
}

function toPublicPath(absolutePath) {
  const relative = toPosixPath(path.relative(PUBLIC_DIR, absolutePath))
  return `/${relative}`
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function ensureDirectory(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function safeStat(filePath) {
  try {
    return await fs.stat(filePath)
  } catch {
    return null
  }
}

async function isUpToDate(outputFilePath, sourceMtimeMs) {
  const stat = await safeStat(outputFilePath)
  return Boolean(stat && stat.mtimeMs >= sourceMtimeMs)
}

async function walkFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue
    const entryPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath)))
      continue
    }
    files.push(entryPath)
  }
  return files
}

function getOptimizedWidths(sourceWidth) {
  if (!sourceWidth || sourceWidth <= 0) return TARGET_WIDTHS
  const widths = TARGET_WIDTHS.filter((width) => width < sourceWidth)
  widths.push(sourceWidth)
  return Array.from(new Set(widths)).sort((a, b) => a - b)
}

async function writeVariantIfNeeded({ sourcePath, outputPath, width, encoder, sourceMtimeMs }) {
  const upToDate = await isUpToDate(outputPath, sourceMtimeMs)
  if (!upToDate) {
    const pipeline = sharp(sourcePath).resize({ width, withoutEnlargement: true })
    if (encoder === "webp") {
      await pipeline.webp({ quality: WEBP_QUALITY }).toFile(outputPath)
    } else {
      await pipeline.avif({ quality: AVIF_QUALITY }).toFile(outputPath)
    }
  }
  const outputStat = await fs.stat(outputPath)
  return outputStat.size
}

async function optimizeStillImage(sourcePath, sourceStat) {
  const metadata = await sharp(sourcePath).metadata()
  const relativeFromSource = path.relative(SOURCE_DIR, sourcePath)
  const parsed = path.parse(relativeFromSource)
  const outputDir = path.join(OUTPUT_DIR, parsed.dir)
  await ensureDirectory(outputDir)

  const widths = getOptimizedWidths(metadata.width || 0)
  const variants = []

  for (const width of widths) {
    const webpPath = path.join(outputDir, `${parsed.name}-${width}w.webp`)
    const avifPath = path.join(outputDir, `${parsed.name}-${width}w.avif`)

    const webpBytes = await writeVariantIfNeeded({
      sourcePath,
      outputPath: webpPath,
      width,
      encoder: "webp",
      sourceMtimeMs: sourceStat.mtimeMs,
    })
    const avifBytes = await writeVariantIfNeeded({
      sourcePath,
      outputPath: avifPath,
      width,
      encoder: "avif",
      sourceMtimeMs: sourceStat.mtimeMs,
    })

    variants.push({
      src: toPublicPath(webpPath),
      w: width,
      type: "image/webp",
      bytes: webpBytes,
    })
    variants.push({
      src: toPublicPath(avifPath),
      w: width,
      type: "image/avif",
      bytes: avifBytes,
    })
  }

  variants.sort((a, b) => {
    if (a.w !== b.w) return a.w - b.w
    return a.type.localeCompare(b.type)
  })

  return {
    width: metadata.width || null,
    height: metadata.height || null,
    variants,
  }
}

async function buildGifPosterIfNeeded(sourcePath, sourceStat) {
  const metadata = await sharp(sourcePath, { animated: true, limitInputPixels: false }).metadata()
  const result = {
    width: metadata.width || null,
    height: metadata.height || null,
    variants: [],
    poster: null,
  }

  if (sourceStat.size <= LARGE_GIF_THRESHOLD_BYTES) {
    return result
  }

  const relativeFromSource = path.relative(SOURCE_DIR, sourcePath)
  const parsed = path.parse(relativeFromSource)
  const outputDir = path.join(OUTPUT_DIR, parsed.dir)
  const posterPath = path.join(outputDir, `${parsed.name}-poster-${GIF_POSTER_WIDTH}w.webp`)

  await ensureDirectory(outputDir)
  const upToDate = await isUpToDate(posterPath, sourceStat.mtimeMs)
  if (!upToDate) {
    await sharp(sourcePath, { animated: false, limitInputPixels: false })
      .resize({ width: GIF_POSTER_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(posterPath)
  }

  const posterStat = await fs.stat(posterPath)
  result.poster = {
    src: toPublicPath(posterPath),
    w: metadata.width ? Math.min(metadata.width, GIF_POSTER_WIDTH) : GIF_POSTER_WIDTH,
    type: "image/webp",
    bytes: posterStat.size,
  }
  return result
}

function selectComparisonSize(entry) {
  const webpVariants = entry.variants.filter((variant) => variant.type === "image/webp")
  if (webpVariants.length === 0) {
    return entry.poster ? entry.poster.bytes : null
  }
  const largestWebp = webpVariants.reduce((largest, variant) => {
    if (!largest || variant.w > largest.w) return variant
    return largest
  }, null)
  return largestWebp ? largestWebp.bytes : null
}

async function main() {
  const sourceDirStat = await safeStat(SOURCE_DIR)
  if (!sourceDirStat) {
    console.log("No public/images directory found. Skipping image optimization.")
    return
  }

  await ensureDirectory(OUTPUT_DIR)
  await ensureDirectory(path.dirname(SRC_MANIFEST_PATH))

  const sourceFiles = await walkFiles(SOURCE_DIR)
  const imageFiles = sourceFiles.filter((filePath) => {
    const extension = path.extname(filePath).toLowerCase()
    return STILL_EXTENSIONS.has(extension) || extension === GIF_EXTENSION
  })

  const manifestImages = {}
  const gifOffenders = []
  const comparisonRows = []

  for (const sourcePath of imageFiles) {
    try {
      const sourceStat = await fs.stat(sourcePath)
      const extension = path.extname(sourcePath).toLowerCase()
      const sourcePublicPath = toPublicPath(sourcePath)

      let manifestEntry = null
      if (STILL_EXTENSIONS.has(extension)) {
        manifestEntry = await optimizeStillImage(sourcePath, sourceStat)
      } else if (extension === GIF_EXTENSION) {
        manifestEntry = await buildGifPosterIfNeeded(sourcePath, sourceStat)
        if (sourceStat.size > LARGE_GIF_THRESHOLD_BYTES) {
          gifOffenders.push({
            src: sourcePublicPath,
            bytes: sourceStat.size,
            posterBytes: manifestEntry.poster ? manifestEntry.poster.bytes : null,
            posterSrc: manifestEntry.poster ? manifestEntry.poster.src : null,
          })
        }
      }

      if (!manifestEntry) continue
      manifestImages[sourcePublicPath] = manifestEntry
      comparisonRows.push({
        src: sourcePublicPath,
        before: sourceStat.size,
        after: selectComparisonSize(manifestEntry),
      })
    } catch (error) {
      console.warn(`Skipped ${toPublicPath(sourcePath)}: ${error.message}`)
    }
  }

  const publicManifest = {
    generatedAt: new Date().toISOString(),
    widths: TARGET_WIDTHS,
    images: manifestImages,
  }

  const runtimeImages = {}
  for (const [sourcePath, entry] of Object.entries(manifestImages)) {
    runtimeImages[sourcePath] = {
      width: entry.width,
      height: entry.height,
      variants: entry.variants
        .filter((variant) => variant.type === "image/webp")
        .map((variant) => ({
          src: variant.src,
          w: variant.w,
          type: variant.type,
        })),
      poster: entry.poster
        ? {
            src: entry.poster.src,
            w: entry.poster.w,
            type: entry.poster.type,
          }
        : null,
    }
  }

  const runtimeManifest = {
    generatedAt: publicManifest.generatedAt,
    widths: TARGET_WIDTHS,
    images: runtimeImages,
  }

  await fs.writeFile(PUBLIC_MANIFEST_PATH, `${JSON.stringify(publicManifest, null, 2)}\n`, "utf8")
  await fs.writeFile(SRC_MANIFEST_PATH, `${JSON.stringify(runtimeManifest, null, 2)}\n`, "utf8")

  comparisonRows.sort((a, b) => b.before - a.before)
  gifOffenders.sort((a, b) => b.bytes - a.bytes)

  const topComparison = comparisonRows.slice(0, 10)

  console.log("\nImage Optimization Summary")
  console.log(`- Source files scanned: ${imageFiles.length}`)
  console.log(`- Manifest: ${toPublicPath(PUBLIC_MANIFEST_PATH)}`)
  console.log(`- Generated variants folder: ${toPublicPath(OUTPUT_DIR)}`)

  console.log("\nTop 10 Largest Source Images (Before/After)")
  for (const row of topComparison) {
    const afterDisplay = row.after == null ? "n/a" : formatBytes(row.after)
    const savings = row.after == null ? "n/a" : `${(((row.before - row.after) / row.before) * 100).toFixed(1)}%`
    console.log(
      `${row.src} | before: ${formatBytes(row.before)} | after(best): ${afterDisplay} | savings: ${savings}`,
    )
  }

  if (gifOffenders.length > 0) {
    console.log("\nLarge GIF Offenders (>2MB) - Suggested future conversion to MP4/WebM")
    for (const offender of gifOffenders.slice(0, 20)) {
      const posterInfo =
        offender.posterBytes && offender.posterSrc
          ? `poster: ${offender.posterSrc} (${formatBytes(offender.posterBytes)})`
          : "poster: n/a"
      console.log(`${offender.src} | gif: ${formatBytes(offender.bytes)} | ${posterInfo}`)
    }
  } else {
    console.log("\nNo large GIF offenders found.")
  }
}

main().catch((error) => {
  console.error("Image optimization failed.")
  console.error(error)
  process.exitCode = 1
})
