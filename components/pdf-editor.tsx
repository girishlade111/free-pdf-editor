"use client"
import { Button } from "@/components/ui/button"
import type React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  MousePointer,
  Type,
  Undo2,
  Redo2,
  Download,
  Sun,
  Moon,
  Monitor,
  Move,
  Copy,
  X,
  FileText,
  Heart,
  Code,
  Globe,
} from "lucide-react"

import { createPortal } from "react-dom"
import { useState, useRef, useEffect } from "react"
import { useTheme } from "./theme-provider"
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib"

import * as pdfjsLib from "pdfjs-dist/build/pdf"
import { rgb as pdfRgb } from "pdf-lib"

import { Card, CardContent } from "@/components/ui/card"

type Language = "en" | "es"

const translations = {
  en: {
    title: "free PDF Editor v1",
    uploadPdf: "Upload PDF",
    select: "Select",
    text: "Text",
    undo: "Undo",
    redo: "Redo",
    font: "Font",
    weight: "Weight",
    size: "Size",
    color: "Color",
    zoom: "Zoom",
    downloadPdf: "Download PDF",
    shortcuts:
      "Shortcuts: Ctrl/Cmd+Z to undo, Shift+Ctrl/Cmd+Z or Ctrl+Y to redo. Includes movements, deletion, creation, styles and text.",
    uploadMessage: "Upload a PDF, add/edit texts and download",
    uploadSubMessage: "Click 'Text' to create new boxes or select existing text to modify it.",
    selected: "Selected:",
    empty: "(empty)",
    delete: "Delete",
    moveBox: "Move box",
    duplicateBox: "Duplicate box",
    deleteBox: "Delete box",
    black: "Black",
    white: "White",
    documentColor: "Document color",
    customColor: "Custom color",
    weights: {
      "100": "100 - Thin",
      "200": "200 - Extra Light",
      "300": "300 - Light",
      "400": "400 - Regular",
      "500": "500 - Medium",
      "600": "600 - Semi Bold",
      "700": "700 - Bold",
      "800": "800 - Extra Bold",
      "900": "900 - Black",
    },
    supportBanner: {
      title: "Support This Tool",
      message: "Help keep this free tool running",
      button: "Donate via PayPal",
    },
    adBanner: {
      title: "WordPress Development",
      message: "Professional WordPress development & maintenance services",
      button: "Learn More",
    },
    privacyNotice: {
      message:
        "This website does not store any data, documents, cookies, or personal information. All processing is done locally in your browser.",
      close: "Close",
    },
  },
  es: {
    title: "Editor PDF Gratuito",
    uploadPdf: "Subir PDF",
    select: "Seleccionar",
    text: "Texto",
    undo: "Deshacer",
    redo: "Rehacer",
    font: "Fuente",
    weight: "Peso",
    size: "Tamaño",
    color: "Color",
    zoom: "Zoom",
    downloadPdf: "Descargar PDF",
    shortcuts:
      "Atajos: Ctrl/Cmd+Z para deshacer, Shift+Ctrl/Cmd+Z o Ctrl+Y para rehacer. Se incluyen movimientos, borrado, creación, estilos y texto.",
    uploadMessage: "Sube un PDF, añade/edita textos y descarga",
    uploadSubMessage: "Haz clic en 'Texto' para crear nuevas cajas o selecciona texto existente para modificarlo.",
    selected: "Seleccionado:",
    empty: "(vacío)",
    delete: "Eliminar",
    moveBox: "Mover caja",
    duplicateBox: "Duplicar caja",
    deleteBox: "Eliminar caja",
    black: "Negro",
    white: "Blanco",
    documentColor: "Color del documento",
    customColor: "Color personalizado",
    weights: {
      "100": "100 - Fino",
      "200": "200 - Extra Ligero",
      "300": "300 - Ligero",
      "400": "400 - Regular",
      "500": "500 - Medio",
      "600": "600 - Semi Negrita",
      "700": "700 - Negrita",
      "800": "800 - Extra Negrita",
      "900": "900 - Negro",
    },
    supportBanner: {
      title: "Apoya Esta Herramienta",
      message: "Ayuda a mantener esta herramienta gratuita",
      button: "Donar vía PayPal",
    },
    adBanner: {
      title: "Desarrollo WordPress",
      message: "Servicios profesionales de desarrollo y mantenimiento WordPress",
      button: "Saber Más",
    },
    privacyNotice: {
      message:
        "Esta web no guarda ningún dato, documento, cookie o información personal. Todo el procesamiento se realiza localmente en tu navegador.",
      close: "Cerrar",
    },
  },
}

// Worker de PDF.js
const pdfjsVersion: string = (pdfjsLib as any).version || "5"
;(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`

type Tool = "select" | "text"
type FontWeight = "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"
type EditMode = "new" | "replace"
type FontCategory = "sans" | "serif" | "mono"

type TextBox = {
  id: string
  pageIndex: number
  x: number
  y: number
  text: string
  fontFamily: string
  category: FontCategory
  weight: FontWeight
  fontSize: number
  color: string
  mode: EditMode
  originalRect?: { widthPx: number; heightPx: number }
  origX?: number
  origY?: number
  bgColorHex?: string
}

type ReplaceMask = {
  id: string
  pageIndex: number
  x: number
  y: number
  widthPx: number
  heightPx: number
  colorHex: string
}

type PageCanvasInfo = {
  widthPx: number
  heightPx: number
  pdfWidthPt: number
  pdfHeightPt: number
}

type Snapshot = {
  boxes: TextBox[]
  masks: ReplaceMask[]
  activeId: string | null
}

// Fuentes de sistema y categorías
const SYSTEM_FONTS: { id: string; label: string; family: string; category: FontCategory }[] = [
  {
    id: "system-helvetica",
    label: "Helvetica (sistema)",
    family: 'Helvetica, Arial, "Nimbus Sans", sans-serif',
    category: "sans",
  },
  {
    id: "system-times",
    label: "Times (sistema)",
    family: '"Times New Roman", Times, "Nimbus Roman", serif',
    category: "serif",
  },
  {
    id: "system-courier",
    label: "Courier (sistema)",
    family: '"Courier New", Courier, "Nimbus Mono", monospace',
    category: "mono",
  },
]

const GOOGLE_FONTS: { id: string; label: string; family: string; category: FontCategory }[] = [
  {
    id: "google-open-sans",
    label: "Open Sans (Google)",
    family: '"Open Sans", sans-serif',
    category: "sans",
  },
  {
    id: "google-roboto",
    label: "Roboto (Google)",
    family: "Roboto, sans-serif",
    category: "sans",
  },
  {
    id: "google-montserrat",
    label: "Montserrat (Google)",
    family: "Montserrat, sans-serif",
    category: "sans",
  },
  {
    id: "google-lato",
    label: "Lato (Google)",
    family: "Lato, sans-serif",
    category: "sans",
  },
  {
    id: "google-oswald",
    label: "Oswald (Google)",
    family: "Oswald, sans-serif",
    category: "sans",
  },
  {
    id: "google-merriweather",
    label: "Merriweather (Google)",
    family: "Merriweather, serif",
    category: "serif",
  },
  {
    id: "google-lora",
    label: "Lora (Google)",
    family: "Lora, serif",
    category: "serif",
  },
  {
    id: "google-slabo",
    label: "Slabo 27px (Google)",
    family: "'Slabo 27px', serif",
    category: "serif",
  },
  {
    id: "google-inconsolata",
    label: "Inconsolata (Google)",
    family: "Inconsolata, monospace",
    category: "mono",
  },
  {
    id: "google-source-code-pro",
    label: "Source Code Pro (Google)",
    family: "'Source Code Pro', monospace",
    category: "mono",
  },
]

function guessCategoryFromPdfStyle(fontFamily: string | undefined): FontCategory {
  const f = (fontFamily || "").toLowerCase()

  if (f.includes("mono") || f.includes("courier")) return "mono"
  if (f.includes("serif") && !f.includes("sans")) return "serif"
  if (f.includes("times") || f.includes("georgia") || f.includes("garamond")) return "serif"

  return "sans"
}

function guessWeightFromFontName(fontName: string | undefined, style: any = {}): FontWeight {
  const n = (fontName || "").toLowerCase()

  if (style) {
    if (style.fontWeight && typeof style.fontWeight === "number") {
      const weight = Math.round(style.fontWeight / 100) * 100
      if (weight >= 100 && weight <= 900) {
        return weight.toString() as FontWeight
      }
    }

    if (style.bold === true || style.isBold === true) {
      return "700"
    }

    if (style.fontFamily) {
      const familyName = style.fontFamily.toLowerCase()
      if (familyName.includes("bold")) return "700"
      if (familyName.includes("black") || familyName.includes("heavy")) return "900"
      if (familyName.includes("light")) return "300"
      if (familyName.includes("medium")) return "500"
    }
  }

  const numericMatch = n.match(/(\d{3})/)
  if (numericMatch) {
    const weight = Number.parseInt(numericMatch[1])
    if (weight >= 100 && weight <= 900 && weight % 100 === 0) {
      return weight.toString() as FontWeight
    }
  }

  if (n.includes("thin") || n.includes("ultralight") || n.includes("ultra-light")) return "100"
  if (n.includes("extralight") || n.includes("extra-light") || n.includes("ultralight")) return "200"
  if (n.includes("light") && !n.includes("ultralight") && !n.includes("extralight")) return "300"
  if (n.includes("medium")) return "500"
  if (n.includes("semibold") || n.includes("semi-bold") || n.includes("demibold") || n.includes("demi-bold"))
    return "600"
  if (n.includes("extrabold") || n.includes("extra-bold") || n.includes("ultrabold") || n.includes("ultra-bold"))
    return "800"
  if (n.includes("black") || n.includes("heavy") || n.includes("ultra")) return "900"
  if (n.includes("bold")) return "700"

  return "400"
}

const extractDocumentColors = (canvas: HTMLCanvasElement): string[] => {
  const ctx = canvas.getContext("2d")
  if (!ctx) return []

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const colorCounts: { [key: string]: number } = {}

  for (let i = 0; i < data.length; i += 40) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (a < 128) continue
    const brightness = (r + g + b) / 3
    if (brightness > 240 || brightness < 15) continue

    const color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
    colorCounts[color] = (colorCounts[color] || 0) + 1
  }

  return Object.entries(colorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([color]) => color)
}

function analyzeVisualWeight(
  canvas: HTMLCanvasElement,
  rect: { x: number; y: number; w: number; h: number },
): FontWeight {
  const ctx = canvas.getContext("2d")
  if (!ctx) return "400"

  try {
    const imageData = ctx.getImageData(rect.x, rect.y, rect.w, rect.h)
    const data = imageData.data

    const brightnessValues: number[] = []
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      if (a >= 128) {
        const brightness = (r + g + b) / 3
        brightnessValues.push(brightness)
      }
    }

    if (brightnessValues.length === 0) return "400"

    brightnessValues.sort((a, b) => a - b)
    const medianBrightness = brightnessValues[Math.floor(brightnessValues.length / 2)]

    let darknessThreshold: number
    let useAdaptiveThreshold = false

    if (medianBrightness > 200) {
      darknessThreshold = 180
    } else {
      darknessThreshold = Math.max(medianBrightness - 40, 50)
      useAdaptiveThreshold = true
    }

    let totalPixels = 0
    let darkPixels = 0
    let totalDarkness = 0

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      if (a < 128) continue

      totalPixels++
      const brightness = (r + g + b) / 3

      if (brightness < darknessThreshold) {
        darkPixels++
        totalDarkness += darknessThreshold - brightness
      }
    }

    if (totalPixels === 0 || darkPixels === 0) return "400"

    const darkRatio = darkPixels / totalPixels
    const avgDarkness = totalDarkness / darkPixels

    let weightScore: number

    if (useAdaptiveThreshold) {
      const maxPossibleDarkness = darknessThreshold - 50
      weightScore = darkRatio * 0.7 + (avgDarkness / Math.max(maxPossibleDarkness, 1)) * 0.3
    } else {
      weightScore = darkRatio * 0.8 + (avgDarkness / 180) * 0.2
    }

    if (weightScore > 0.6) return "900"
    if (weightScore > 0.5) return "800"
    if (weightScore > 0.4) return "700"
    if (weightScore > 0.3) return "600"
    if (weightScore > 0.25) return "500"
    if (weightScore > 0.15) return "400"
    if (weightScore > 0.1) return "300"
    return "200"
  } catch (error) {
    return "400"
  }
}

function cloneBoxes(src: TextBox[]): TextBox[] {
  return src.map((b) => ({
    ...b,
    originalRect: b.originalRect ? { ...b.originalRect } : undefined,
  }))
}
function cloneMasks(src: ReplaceMask[]): ReplaceMask[] {
  return src.map((m) => ({ ...m }))
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function toHex(n: number) {
  return n.toString(16).padStart(2, "0")
}
function rgbToHex(r: number, g: number, b: number) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
function hexToRgbOriginal(hex: string) {
  const h = hex.replace("#", "")
  const bigint = Number.parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  )
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}
type RGB = { r: number; g: number; b: number }
function isNearWhite({ r, g, b }: RGB) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const mean = (r + g + b) / 3
  return mean > 245 && max - min < 8
}

function sampleBackgroundOutside(
  canvas: HTMLCanvasElement,
  rect: { x: number; y: number; w: number; h: number },
): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true } as any)
  if (!ctx) return "#ffffff"

  const t = clamp(Math.round(Math.min(rect.w, rect.h) * 0.06), 2, 6)
  const stepX = Math.max(1, Math.round(rect.w / 64))
  const stepY = Math.max(1, Math.round(rect.h / 32))

  const stripes = [
    { x: rect.x, y: rect.y - t, w: rect.w, h: t },
    { x: rect.x, y: rect.y + rect.h, w: rect.w, h: t },
    { x: rect.x - t, y: rect.y, w: t, h: rect.h },
    { x: rect.x + rect.w, y: rect.y, w: t, h: rect.h },
  ]

  const counts = new Map<string, { r: number; g: number; b: number; n: number }>()
  for (const s of stripes) {
    const sx = clamp(Math.floor(s.x), 0, canvas.width - 1)
    const sy = clamp(Math.floor(s.y), 0, canvas.height - 1)
    const sw = clamp(Math.floor(s.w), 1, canvas.width - sx)
    const sh = clamp(Math.floor(s.h), 1, canvas.height - sy)
    const data = ctx.getImageData(sx, sy, sw, sh).data

    for (let y = 0; y < sh; y += stepY) {
      for (let x = 0; x < sw; x += stepX) {
        const idx = (y * sw + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const qR = (r >> 4) << 4
        const qG = (g >> 4) << 4
        const qB = (b >> 4) << 4
        const key = `${qR},${qG},${qB}`
        const entry = counts.get(key) || { r: 0, g: 0, b: 0, n: 0 }
        entry.r += r
        entry.g += g
        entry.b += b
        entry.n += 1
        counts.set(key, entry)
      }
    }
  }

  if (!counts.size) return "#ffffff"
  let bestKey: string | null = null
  let bestN = -1
  counts.forEach((v, k) => {
    if (v.n > bestN) {
      bestN = v.n
      bestKey = k
    }
  })
  const best = counts.get(bestKey!)!
  const avg: RGB = { r: Math.round(best.r / best.n), g: Math.round(best.g / best.n), b: Math.round(best.b / best.n) }
  if (isNearWhite(avg)) return "#ffffff"
  return rgbToHex(avg.r, avg.g, avg.b)
}

function sampleTextColor(canvas: HTMLCanvasElement, rect: { x: number; y: number; w: number; h: number }): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true } as any)
  if (!ctx) return "#000000"

  const backgroundColor = sampleBackgroundOutside(canvas, rect)
  const bgRgb = hexToRgbOriginal(backgroundColor)
  const bgBrightness = (bgRgb.r + bgRgb.g + bgRgb.b) / 3
  const isLightBackground = bgBrightness > 128

  const stepX = Math.max(1, Math.round(rect.w / 32))
  const stepY = Math.max(1, Math.round(rect.h / 16))

  const margin = Math.min(rect.w * 0.1, rect.h * 0.1, 2)
  const sampleRect = {
    x: rect.x + margin,
    y: rect.y + margin,
    w: Math.max(1, rect.w - margin * 2),
    h: Math.max(1, rect.h - margin * 2),
  }

  const sx = clamp(Math.floor(sampleRect.x), 0, canvas.width - 1)
  const sy = clamp(Math.floor(sampleRect.y), 0, canvas.height - 1)
  const sw = clamp(Math.floor(sampleRect.w), 1, canvas.width - sx)
  const sh = clamp(Math.floor(sampleRect.h), 1, canvas.height - sy)

  const data = ctx.getImageData(sx, sy, sw, sh).data
  const textPixels: { r: number; g: number; b: number; brightness: number }[] = []

  for (let y = 0; y < sh; y += stepY) {
    for (let x = 0; x < sw; x += stepX) {
      const idx = (y * sw + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const alpha = data[idx + 3]

      if (alpha < 128) continue

      const brightness = (r + g + b) / 3
      textPixels.push({ r, g, b, brightness })
    }
  }

  if (!textPixels.length) return isLightBackground ? "#000000" : "#ffffff"

  if (isLightBackground) {
    textPixels.sort((a, b) => a.brightness - b.brightness)
  } else {
    textPixels.sort((a, b) => b.brightness - a.brightness)
  }

  const targetCount = Math.max(1, Math.floor(textPixels.length * 0.25))
  const selectedPixels = textPixels.slice(0, targetCount)

  const counts = new Map<string, { r: number; g: number; b: number; n: number }>()

  selectedPixels.forEach((pixel) => {
    const qR = (pixel.r >> 4) << 4
    const qG = (pixel.g >> 4) << 4
    const qB = (pixel.b >> 4) << 4
    const key = `${qR},${qG},${qB}`
    const entry = counts.get(key) || { r: 0, g: 0, b: 0, n: 0 }
    entry.r += pixel.r
    entry.g += pixel.g
    entry.b += pixel.b
    entry.n += 1
    counts.set(key, entry)
  })

  let bestKey: string | null = null
  let bestN = -1
  counts.forEach((v, k) => {
    if (v.n > bestN) {
      bestN = v.n
      bestKey = k
    }
  })

  const best = counts.get(bestKey!)!
  const avg: RGB = {
    r: Math.round(best.r / best.n),
    g: Math.round(best.g / best.n),
    b: Math.round(best.b / best.n),
  }

  return rgbToHex(avg.r, avg.g, avg.b)
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

interface UploadedImage {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
  page: number
}

export default function PdfEditor() {
  const { theme, setTheme } = useTheme()

  const [language, setLanguage] = useState<Language>("en")
  const t = translations[language]

  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true)
  const [showChangelog, setShowChangelog] = useState(false)

  const [originalFileData, setOriginalFileData] = useState<Uint8Array | null>(null)
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null)
  const [pdf, setPdf] = useState<any>(null)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const prevScaleRef = useRef(scale)

  const toolRef = useRef<Tool>("select")
  const fontSelRef = useRef<{ family: string; category: FontCategory }>({
    family: SYSTEM_FONTS[0].family,
    category: SYSTEM_FONTS[0].category,
  })
  const weightRef = useRef<FontWeight>("400")
  const fontSizeRef = useRef<number>(16)
  const colorRef = useRef<string>("#111111")

  const [tool, setTool] = useState<Tool>("select")
  useEffect(() => {
    toolRef.current = tool
  }, [tool])

  const [fontSel, setFontSel] = useState<{ family: string; category: FontCategory }>({
    family: SYSTEM_FONTS[0].family,
    category: SYSTEM_FONTS[0].category,
  })
  useEffect(() => {
    fontSelRef.current = fontSel
  }, [fontSel])

  const [weight, setWeight] = useState<FontWeight>("400")
  useEffect(() => {
    weightRef.current = weight
  }, [weight])

  const [fontSize, setFontSize] = useState(16)
  useEffect(() => {
    fontSizeRef.current = fontSize
  }, [fontSize])

  const [color, setColor] = useState("#111111")
  useEffect(() => {
    colorRef.current = color
  }, [color])

  const historyRef = useRef<{ past: Snapshot[]; future: Snapshot[] }>({ past: [], future: [] })
  const [histTick, setHistTick] = useState(0)
  const canUndo = historyRef.current.past.length > 0
  const canRedo = historyRef.current.future.length > 0

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [boxes, setBoxes] = useState<TextBox[]>([])
  const [masks, setMasks] = useState<ReplaceMask[]>([])

  const typingSessionRef = useRef(false)
  const typingTimerRef = useRef<number | null>(null)

  const pageInfos = useRef<Map<number, PageCanvasInfo>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [refocusKey, setRefocusKey] = useState(0)

  const [documentColors, setDocumentColors] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<{ [id: string]: UploadedImage }>({})
  const [activeImageId, setActiveImageId] = useState<string | null>(null)

  const [pdfLoaded, setPdfLoaded] = useState(false)

  const [originalFileName, setOriginalFileName] = useState<string>("")
  const [exportVersion, setExportVersion] = useState<number>(1)

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = file.name.replace(/\.pdf$/i, "")
    setOriginalFileName(fileName)
    setExportVersion(1)

    const buf = await file.arrayBuffer()

    const originalData = new Uint8Array(buf)
    const exportCopy = new Uint8Array(originalData.length)
    exportCopy.set(originalData)
    setOriginalFileData(exportCopy)

    const pdfJsCopy = new ArrayBuffer(buf.byteLength)
    new Uint8Array(pdfJsCopy).set(new Uint8Array(buf))
    setArrayBuffer(pdfJsCopy)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileName = file.name.replace(/\.pdf$/i, "")
    setOriginalFileName(fileName)
    setExportVersion(1)

    const maxSize = 50 * 1024 * 1024
    const allowedTypes = ["application/pdf"]

    if (!allowedTypes.includes(file.type)) {
      alert(language === "en" ? "Please select a valid PDF file." : "Por favor selecciona un archivo PDF válido.")
      return
    }

    if (file.size > maxSize) {
      alert(language === "en" ? "File size must be less than 50MB." : "El archivo debe ser menor a 50MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer
      if (buffer) {
        setBoxes([])
        setMasks([])
        setActiveId(null)

        const originalData = new Uint8Array(buffer)
        const exportCopy = new Uint8Array(originalData.length)
        exportCopy.set(originalData)
        setOriginalFileData(exportCopy)

        const pdfJsCopy = new ArrayBuffer(buffer.byteLength)
        new Uint8Array(pdfJsCopy).set(new Uint8Array(buffer))
        setArrayBuffer(pdfJsCopy)

        setPdfLoaded(true)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const restartTool = () => {
    window.location.reload()
  }

  function resetHistory() {
    historyRef.current.past = []
    historyRef.current.future = []
    setHistTick((t) => t + 1)
  }

  function commitSnapshot(prevBoxes?: TextBox[], prevActive?: string | null, prevMasks?: ReplaceMask[]) {
    const snap: Snapshot = {
      boxes: cloneBoxes(prevBoxes ?? boxes),
      masks: cloneMasks(prevMasks ?? masks),
      activeId: prevActive ?? activeId,
    }
    historyRef.current.past.push(snap)
    historyRef.current.future = []
    setHistTick((t) => t + 1)
  }

  function undo() {
    const { past, future } = historyRef.current
    if (!past.length) return

    const current: Snapshot = { boxes: cloneBoxes(boxes), masks: cloneMasks(masks), activeId }
    const snap = past.pop()!
    future.push(current)

    const currentBoxIds = new Set(boxes.map((b) => b.id))
    const snapBoxIds = new Set(snap.boxes.map((b) => b.id))
    const removedBoxes = boxes.filter((b) => !snapBoxIds.has(b.id))

    removedBoxes.forEach((box) => {
      if (box.mode === "replace" && box.origX !== undefined && box.origY !== undefined) {
        const pageContainer = containerRef.current?.querySelector(`[data-page="${box.pageIndex}"]`)
        if (pageContainer) {
          const hitTargets = pageContainer.querySelectorAll(".hit-target")
          hitTargets.forEach((hit) => {
            const hitElement = hit as HTMLElement
            const hitRect = hitElement.getBoundingClientRect()
            const containerRect = pageContainer.getBoundingClientRect()
            const hitX = hitRect.left - containerRect.left
            const hitY = hitRect.top - containerRect.top

            if (Math.abs(hitX - box.origX!) < 5 && Math.abs(hitY - box.origY!) < 5) {
              hitElement.style.pointerEvents = "auto"
              hitElement.style.opacity = "1"
            }
          })
        }
      }
    })

    setBoxes(cloneBoxes(snap.boxes))
    setMasks(cloneMasks(snap.masks))
    setActiveId(snap.activeId)
    setFocusId(snap.activeId)
    setHistTick((t) => t + 1)
  }

  function redo() {
    const { past, future } = historyRef.current
    if (!future.length) return
    const current: Snapshot = { boxes: cloneBoxes(boxes), masks: cloneMasks(masks), activeId }
    const snap = future.pop()!
    past.push(current)
    setBoxes(cloneBoxes(snap.boxes))
    setMasks(cloneMasks(snap.masks))
    setActiveId(snap.activeId)
    setFocusId(snap.activeId)
    setHistTick((t) => t + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
      const ctrl = isMac ? e.metaKey : e.ctrlKey
      if (!ctrl) return
      const k = e.key.toLowerCase()
      if (k === "z") {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (k === "y") {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [boxes, masks, activeId])

  useEffect(() => {
    if (!arrayBuffer) {
      setPdf(null)
      setNumPages(0)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer })
        const _pdf = await loadingTask.promise
        if (cancelled) return
        setPdf(_pdf)
        setNumPages(_pdf.numPages)
        pageInfos.current.clear()
        setBoxes([])
        setMasks([])
        setActiveId(null)
        setFocusId(null)
        resetHistory()

        const page = await _pdf.getPage(1)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")!

        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise

        if (!cancelled) {
          const colors = extractDocumentColors(canvas)
          setDocumentColors(colors)
        }
      } catch (error) {
        console.error("Error loading PDF:", error)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [arrayBuffer])

  const autoFitDone = useRef<string | null>(null)
  useEffect(() => {
    if (!pdf) return
    ;(async () => {
      try {
        const docKey = `${pdf?.fingerprint || "doc"}:${numPages}`
        if (autoFitDone.current === docKey) return

        const page = await pdf.getPage(1)
        const viewport1 = page.getViewport({ scale: 1 })
        const availableW = scrollRef.current?.clientWidth || containerRef.current?.clientWidth || window.innerWidth
        const s = availableW / viewport1.width
        const clamped = Math.min(2.2, Math.max(0.6, s))
        prevScaleRef.current = clamped
        setScale(clamped)
        autoFitDone.current = docKey
      } catch {
        // noop
      }
    })()
  }, [pdf, numPages])

  useEffect(() => {
    if (!pdf) return
    const prev = prevScaleRef.current
    if (scale === prev) return
    const factor = scale / prev
    setBoxes((prevBoxes) =>
      prevBoxes.map((b) => ({
        ...b,
        x: b.x * factor,
        y: b.y * factor,
        fontSize: Math.max(6, Math.round(b.fontSize * factor)),
        originalRect: b.originalRect
          ? { widthPx: b.originalRect.widthPx * factor, heightPx: b.originalRect.heightPx * factor }
          : undefined,
        origX: typeof b.origX === "number" ? b.origX * factor : b.origX,
        origY: typeof b.origY === "number" ? b.origY * factor : b.origY,
      })),
    )
    setMasks((prevMasks) =>
      prevMasks.map((m) => ({
        ...m,
        x: m.x * factor,
        y: m.y * factor,
        widthPx: m.widthPx * factor,
        heightPx: m.heightPx * factor,
      })),
    )
    prevScaleRef.current = scale
    setRefocusKey((k) => k + 1)
  }, [scale, pdf])

  useEffect(() => {
    if (!pdf || !containerRef.current) return

    const root = containerRef.current
    root.textContent = ""
    let cancelled = false
    ;(async () => {
      for (let i = 1; i <= numPages; i++) {
        if (cancelled) return
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement("canvas")
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext("2d")!
        await page.render({ canvasContext: ctx, viewport }).promise
        if (cancelled) return

        const wrapper = document.createElement("div")
        wrapper.setAttribute("data-page", String(i - 1))
        Object.assign(wrapper.style, {
          position: "relative",
          width: `${canvas.width}px`,
          height: `${canvas.height}px`,
        })
        wrapper.className = "mx-auto mb-6 shadow-sm"
        wrapper.appendChild(canvas)

        const overlay = document.createElement("div")
        Object.assign(overlay.style, {
          position: "absolute",
          inset: "0",
          cursor: toolRef.current === "text" ? "text" : "default",
          zIndex: "1",
        })
        overlay.className = "overlay"
        wrapper.appendChild(overlay)

        const hits = document.createElement("div")
        Object.assign(hits.style, { position: "absolute", inset: "0", zIndex: "2" })
        hits.addEventListener(
          "pointerdown",
          (ev) => {
            if (toolRef.current !== "text") return
            ev.stopPropagation()
            ev.preventDefault()
            const rect = (hits as HTMLDivElement).getBoundingClientRect()
            const x = ev.clientX - rect.left
            const y = ev.clientY - rect.top
            const id = crypto.randomUUID()
            commitSnapshot()
            const newBox: TextBox = {
              id,
              pageIndex: i - 1,
              x,
              y: y + 1,
              text: "",
              fontFamily: fontSelRef.current.family,
              category: fontSelRef.current.category,
              weight: weightRef.current,
              fontSize: fontSizeRef.current,
              color: colorRef.current,
              mode: "new",
            }
            setBoxes((prev) => [...prev, newBox])
            setActiveId(id)
            setFocusId(id)
          },
          true,
        )
        wrapper.appendChild(hits)

        const boxesLayer = document.createElement("div")
        boxesLayer.className = "react-overlay"
        Object.assign(boxesLayer.style, { position: "absolute", inset: "0", zIndex: "3", pointerEvents: "none" })
        wrapper.appendChild(boxesLayer)

        root.appendChild(wrapper)

        const baseViewport = page.getViewport({ scale: 1 })
        pageInfos.current.set(i - 1, {
          widthPx: canvas.width,
          heightPx: canvas.height,
          pdfWidthPt: baseViewport.width,
          pdfHeightPt: baseViewport.height,
        })

        try {
          const textContent = await page.getTextContent()
          const viewportForHits = page.getViewport({ scale })
          const Util = (pdfjsLib as any).Util
          const styles: Record<string, any> = textContent.styles || {}
          ;(textContent.items as any[]).forEach((item: any) => {
            if (!item?.str?.trim()) return
            const t = Util.transform(viewportForHits.transform, item.transform)
            const fontHeight = Math.hypot(t[2], t[3])

            const leftPx = t[4]
            const topPx = t[5] - fontHeight
            const widthPx =
              (item.width ? item.width * viewportForHits.scale : 0) || Math.max(8, item.str.length * (fontHeight * 0.5))
            const heightPx = item.height ? item.height * viewportForHits.scale : fontHeight

            const leftR = Math.round(leftPx)
            const topR = Math.round(topPx)
            const widthR = Math.round(widthPx)
            const heightR = Math.round(heightPx)

            const r = document.createElement("div")
            r.setAttribute("data-hit", "1")
            r.setAttribute("title", item.str)
            r.className = "hit-target"
            Object.assign(r.style, {
              position: "absolute",
              left: `${leftR}px`,
              top: `${topR}px`,
              width: `${widthR}px`,
              height: `${heightR}px`,
              background: "transparent",
              cursor: "text",
            })

            let cooling = false
            r.addEventListener(
              "pointerdown",
              (ev) => {
                ev.stopPropagation()
                ev.preventDefault()
                if (toolRef.current !== "select") return
                if (cooling) return
                cooling = true
                setTimeout(() => (cooling = false), 200)

                const style = styles[item.fontName] || {}
                const fontName = item.fontName || ""

                const detectedCategory = guessCategoryFromPdfStyle(fontName)
                const detectedWeight = guessWeightFromFontName(fontName, style)
                const visualWeight = analyzeVisualWeight(canvas, {
                  x: leftR,
                  y: topR,
                  w: widthR,
                  h: heightR,
                })

                const finalWeight = detectedWeight === "400" ? visualWeight : detectedWeight
                const similarFamily = SYSTEM_FONTS.find((f) => f.category === detectedCategory)?.family || "Arial"

                const sampled = sampleBackgroundOutside(canvas, {
                  x: leftR,
                  y: topR + 2,
                  w: widthR,
                  h: heightR,
                })

                const sampledTextColor = sampleTextColor(canvas, {
                  x: leftR,
                  y: topR + 2,
                  w: widthR,
                  h: heightR,
                })

                const id = crypto.randomUUID()
                commitSnapshot()

                const mask: ReplaceMask = {
                  id: `mask-${id}`,
                  pageIndex: i - 1,
                  x: leftR - 3,
                  y: topR - 1,
                  widthPx: widthR + 6,
                  heightPx: heightR + 6,
                  colorHex: sampled || "#ffffff",
                }
                setMasks((prev) => [...prev, mask])

                const newBox: TextBox = {
                  id,
                  pageIndex: i - 1,
                  x: leftR,
                  y: topR + 1,
                  text: item.str,
                  fontSize: Math.round(fontHeight),
                  fontFamily: similarFamily,
                  weight: finalWeight,
                  color: sampledTextColor,
                  mode: "replace",
                }
                setBoxes((prev) => [...prev, newBox])
                setActiveId(id)
                setFocusId(id)

                const tgt = ev.currentTarget as HTMLElement
                if (tgt) tgt.remove()
              },
              { passive: false },
            )

            r.addEventListener("mouseenter", () => (r.style.outline = "1px dashed rgba(34,197,94,0.7)"))
            r.addEventListener("mouseleave", () => (r.style.outline = "none"))
            hits.appendChild(r)
          })
        } catch (error) {
          // PDFs sin texto extraíble
        }
      }
    })()

    return () => {
      cancelled = true
      if (containerRef.current === root) {
        root.textContent = ""
      }
    }
  }, [pdf, numPages, scale])

  useEffect(() => {
    containerRef.current?.querySelectorAll(".overlay").forEach((ov) => {
      ;(ov as HTMLElement).style.cursor = tool === "text" ? "text" : "default"
    })
  }, [tool])

  useEffect(() => {
    console.log("DEBUG: Setting up click listener")
    const root = document.getElementById("pdf-editor-root")
    if (!root) {
      console.log("DEBUG: pdf-editor-root not found")
      return
    }
    console.log("DEBUG: pdf-editor-root found, adding listener")
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      console.log("DEBUG: Click detected on:", target.tagName, target.className)

      const isStyleControl =
        target.closest("input") ||
        target.closest("button") ||
        target.closest("select") ||
        target.closest(".select-trigger") ||
        target.closest(".select-content") ||
        target.closest(".select-item") ||
        target.closest("[role='combobox']") ||
        target.closest("[role='option']") ||
        target.closest("[data-radix-collection-item]")

      if (isStyleControl) {
        console.log("DEBUG: Clicked on style control, not deselecting")
        return
      }

      const textBox = target.closest(".v0-text-box")
      console.log("DEBUG: Found text box:", textBox ? "YES" : "NO")
      if (!textBox) {
        console.log("DEBUG: Deselecting all boxes, current selectedIds:", selectedIds)
        setSelectedIds([])
      }
    }
    root.addEventListener("pointerdown", handlePointerDown)
    return () => root.removeEventListener("pointerdown", handlePointerDown)
  }, [selectedIds])

  function deleteBoxInner(id: string) {
    commitSnapshot()
    setBoxes((prev) => prev.filter((b) => b.id !== id))
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
  }

  function deleteBox(id: string) {
    if (selectedIds.includes(id) && selectedIds.length > 1) {
      selectedIds.forEach((boxId) => {
        deleteBoxInner(boxId)
      })
      setSelectedIds([])
    } else {
      deleteBoxInner(id)
    }
  }

  function duplicateBox(id: string) {
    if (selectedIds.includes(id) && selectedIds.length > 1) {
      const selectedBoxes = boxes.filter((b) => selectedIds.includes(b.id))
      const newBoxes: TextBox[] = []

      selectedBoxes.forEach((originalBox) => {
        const newBox: TextBox = {
          ...originalBox,
          id: crypto.randomUUID(),
          y: originalBox.y + originalBox.fontSize + 10,
        }
        newBoxes.push(newBox)
      })

      commitSnapshot()
      setBoxes((prev) => [...prev, ...newBoxes])
      setSelectedIds(newBoxes.map((b) => b.id))
    } else {
      const originalBox = boxes.find((b) => b.id === id)
      if (!originalBox) return

      const newBox: TextBox = {
        ...originalBox,
        id: crypto.randomUUID(),
        y: originalBox.y + originalBox.fontSize + 10,
      }

      addBox(newBox)
    }
  }

  useEffect(() => {
    if (selectedIds.length === 0) return

    const selectedBoxes = boxes.filter((b) => selectedIds.includes(b.id))
    if (selectedBoxes.length === 0) return

    const firstBox = selectedBoxes[0]
    const allSameFont = selectedBoxes.every((b) => b.fontFamily === firstBox.fontFamily)
    const allSameWeight = selectedBoxes.every((b) => b.weight === firstBox.weight)
    const allSameFontSize = selectedBoxes.every((b) => b.fontSize === firstBox.fontSize)
    const allSameColor = selectedBoxes.every((b) => b.color === firstBox.color)

    if (allSameFont) {
      const matchingFont = [...SYSTEM_FONTS, ...GOOGLE_FONTS].find((f) => f.family === firstBox.fontFamily)
      if (matchingFont) {
        setFontSel({ family: matchingFont.family, category: matchingFont.category })
      }
    }

    if (allSameWeight) {
      setWeight(firstBox.weight)
    }

    if (allSameFontSize) {
      setFontSize(firstBox.fontSize)
    }

    if (allSameColor) {
      setColor(firstBox.color)
    }
  }, [selectedIds, boxes])

  useEffect(() => {
    if (selectedIds.length === 0) return
    changeFontFamily(fontSel.family)
  }, [fontSel.family])

  useEffect(() => {
    if (selectedIds.length === 0) return
    changeWeight(weight)
  }, [weight])

  useEffect(() => {
    if (selectedIds.length === 0) return
    changeFontSize(fontSize)
  }, [fontSize])

  useEffect(() => {
    if (selectedIds.length === 0) return
    changeColor(color)
  }, [color])

  async function exportPdf() {
    if (!originalFileData) {
      alert(language === "en" ? "No PDF file loaded" : "No hay archivo PDF cargado")
      return
    }

    try {
      const safeData = new Uint8Array(originalFileData.length)
      for (let i = 0; i < originalFileData.length; i++) {
        safeData[i] = originalFileData[i]
      }

      const headerBytes = safeData.slice(0, 5)
      const headerString = String.fromCharCode(...headerBytes)
      if (!headerString.startsWith("%PDF")) {
        console.error("Invalid PDF header:", headerString)
        alert(language === "en" ? "Invalid PDF file data" : "Datos de archivo PDF inválidos")
        return
      }

      const pdfDoc = await PDFDocument.load(safeData)

      const helvReg = await pdfDoc.embedStandardFont(StandardFonts.Helvetica)
      const helvBold = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold)
      const timesReg = await pdfDoc.embedStandardFont(StandardFonts.TimesRoman)
      const timesBold = await pdfDoc.embedStandardFont(StandardFonts.TimesRomanBold)
      const courReg = await pdfDoc.embedStandardFont(StandardFonts.Courier)
      const courBold = await pdfDoc.embedStandardFont(StandardFonts.CourierBold)

      const fontFor = (cat: FontCategory, wt: FontWeight): PDFFont => {
        if (cat === "serif") return wt === "700" ? timesBold : timesReg
        if (cat === "mono") return wt === "700" ? courBold : courReg
        return wt === "700" ? helvBold : helvReg
      }

      for (let p = 0; p < pdfDoc.getPageCount(); p++) {
        const page = pdfDoc.getPage(p)
        const info = pageInfos.current.get(p)
        if (!info) continue
        const { widthPx, heightPx, pdfWidthPt, pdfHeightPt } = info

        const pageMasks = masks.filter((m) => m.pageIndex === p)
        for (const m of pageMasks) {
          const col = hexToRgbOriginal(m.colorHex || "#ffffff")
          const fill = isNearWhite(col) ? { r: 255, g: 255, b: 255 } : col
          page.drawRectangle({
            x: (m.x / widthPx) * pdfWidthPt,
            y: pdfHeightPt - ((m.y + m.heightPx) / heightPx) * pdfHeightPt,
            width: (m.widthPx / widthPx) * pdfWidthPt,
            height: (m.heightPx / heightPx) * pdfHeightPt,
            color: pdfRgb(fill.r / 255, fill.g / 255, fill.b / 255),
          })
        }

        const pageBoxes = boxes.filter((b) => b.pageIndex === p)
        for (const b of pageBoxes) {
          const font = fontFor(b.category, b.weight)
          const colorRgb = hexToRgbOriginal(b.color)

          const xPt = (b.x / widthPx) * pdfWidthPt
          const yTopPt = (b.y / heightPx) * pdfHeightPt
          const fontSizePt = (b.fontSize / heightPx) * pdfHeightPt
          const yBaselinePt = pdfHeightPt - yTopPt - fontSizePt

          const lines = b.text.replace(/\r/g, "").split("\n")
          const leading = b.mode === "replace" ? Math.round(fontSizePt * 1.0) : Math.round(fontSizePt * 1.25)
          lines.forEach((ln, idx) => {
            page.drawText(ln, {
              x: xPt,
              y: yBaselinePt + (lines.length - 1 - idx) * leading,
              size: fontSizePt,
              font,
              color: pdfRgb(colorRgb.r / 255, colorRgb.g / 255, colorRgb.b / 255),
            })
          })
        }
      }

      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      const baseFileName = originalFileName || "documento"
      const fileName = `${baseFileName}_edit_v${exportVersion}.pdf`
      a.download = fileName

      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      setExportVersion((prev) => prev + 1)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert(
        language === "en"
          ? "Error exporting PDF. Please try uploading the file again."
          : "Error al exportar PDF. Por favor intenta subir el archivo de nuevo.",
      )
    }
  }

  const active = boxes.find((b) => b.id === activeId) || null

  const fontOptions = [
    ...SYSTEM_FONTS.map((f) => ({ value: `sys:${f.id}`, label: f.label, family: f.family, category: f.category })),
    ...GOOGLE_FONTS.map((g) => ({
      value: `gg:${g.id}`,
      label: g.label + " (Google)",
      family: g.family,
      category: g.category,
    })),
  ]

  function addBox(newBox: TextBox) {
    commitSnapshot()
    setBoxes((prev) => [...prev, newBox])
    setSelectedIds([newBox.id])
    setFocusId(newBox.id)
  }

  function beginDrag() {
    commitSnapshot()
  }

  function changeText(id: string, newText: string) {
    if (!typingSessionRef.current) {
      commitSnapshot()
      typingSessionRef.current = true
    }
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current)
    }
    typingTimerRef.current = window.setTimeout(() => {
      typingSessionRef.current = false
      typingTimerRef.current = null
    }, 700) as unknown as number

    setBoxes((prev) => prev.map((x) => (x.id === id ? { ...x, text: newText } : x)))
  }

  function changeWeight(newWeight: FontWeight) {
    if (selectedIds.length === 0) return
    commitSnapshot()
    setBoxes((prev) => prev.map((b) => (selectedIds.includes(b.id) ? { ...b, weight: newWeight } : b)))
  }

  function changeFontSize(newSize: number) {
    if (selectedIds.length === 0) return
    commitSnapshot()
    setBoxes((prev) => prev.map((b) => (selectedIds.includes(b.id) ? { ...b, fontSize: newSize } : b)))
  }

  function changeColor(newColor: string) {
    if (selectedIds.length === 0) return
    commitSnapshot()
    setBoxes((prev) => prev.map((b) => (selectedIds.includes(b.id) ? { ...b, color: newColor } : b)))
  }

  function changeFontFamily(family: string) {
    if (selectedIds.length === 0) return
    commitSnapshot()
    setBoxes((prev) => prev.map((b) => (selectedIds.includes(b.id) ? { ...b, fontFamily: family } : b)))
  }

  function handleBoxSelect(id: string, ctrlKey: boolean) {
    if (ctrlKey) {
      if (selectedIds.includes(id)) {
        setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
      } else {
        setSelectedIds((prev) => [...prev, id])
      }
    } else {
      setSelectedIds([id])
    }
    setActiveId(id)
    setFocusId(id)
  }

  return (
    <div className="flex min-h-screen" id="pdf-editor-root">
      {/* Support banner */}
      <div className="fixed left-0 top-0 h-full w-16 bg-black dark:bg-gray-900 text-white z-50 flex flex-col items-center justify-center p-2">
        <div className="transform -rotate-90 whitespace-nowrap text-center">
          <div className="mb-2">
            <Heart className="h-4 w-4 mx-auto mb-1" />
            <div className="text-xs font-semibold">{t.supportBanner.title}</div>
          </div>
          <div className="text-xs mb-2">{t.supportBanner.message}</div>
          <a
            href="https://paypal.me/dmeijide"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-block bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
          >
            {t.supportBanner.button}
          </a>
        </div>
      </div>

      {/* Ad banner */}
      <div className="fixed right-0 top-0 h-full w-16 bg-black dark:bg-gray-900 text-white z-50 flex flex-col items-center justify-center p-2">
        <div className="transform rotate-90 whitespace-nowrap text-center">
          <div className="mb-2">
            <Code className="h-4 w-4 mx-auto mb-1" />
            <div className="text-xs font-semibold">{t.adBanner.title}</div>
          </div>
          <div className="text-xs mb-2">{t.adBanner.message}</div>
          <a
            href="https://agenciarse.com/en/shop/"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-block bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs transition-colors"
          >
            {t.adBanner.button}
          </a>
        </div>
      </div>

      <div className="flex-1 ml-16 mr-16">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center flex-shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-white dark:fill-black"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangelog(true)}
                className="gap-2 text-xs"
                title="View changelog"
              >
                <FileText className="h-3 w-3" />
                Changelog
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (theme === "light") setTheme("dark")
                  else if (theme === "dark") setTheme("system")
                  else setTheme("light")
                }}
                className="h-8 w-8"
                title={
                  theme === "light"
                    ? "Switch to dark mode"
                    : theme === "dark"
                      ? "Switch to system mode"
                      : "Switch to light mode"
                }
              >
                {theme === "light" && <Sun className="h-4 w-4" />}
                {theme === "dark" && <Moon className="h-4 w-4" />}
                {theme === "system" && <Monitor className="h-4 w-4" />}
              </Button>
              <Globe className="h-4 w-4" />
              <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="es">ES</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="mb-4 bg-card border-border">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-3">
                {!pdfLoaded ? (
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file"
                    />
                    <Button asChild variant="secondary" className="gap-2">
                      <label htmlFor="file" className="cursor-pointer">
                        <Upload className="h-4 w-4" />
                        {t.uploadPdf}
                      </label>
                    </Button>
                  </label>
                ) : (
                  <Button variant="secondary" onClick={restartTool} className="gap-2">
                    <Upload className="h-4 w-4" />
                    {language === "en" ? "Upload Another Document" : "Subir Otro Documento"}
                  </Button>
                )}

                <Button
                  variant={tool === "select" ? "default" : "outline"}
                  onClick={() => setTool("select")}
                  className="gap-2"
                >
                  <MousePointer className="h-4 w-4" />
                  {t.select}
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                <Button
                  variant={tool === "text" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setTool("text")}
                >
                  <Type className="h-4 w-4" />
                  {t.text}
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                <Button variant="outline" className="gap-2 bg-transparent" onClick={undo} disabled={!canUndo}>
                  <Undo2 className="h-4 w-4" />
                  {t.undo}
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent" onClick={redo} disabled={!canRedo}>
                  <Redo2 className="h-4 w-4" />
                  {t.redo}
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                <Select
                  value={fontOptions.find((o) => o.family === fontSel.family)?.value}
                  onValueChange={(val) => {
                    const opt = fontOptions.find((o) => o.value === val)
                    if (opt) setFontSel({ family: opt.family, category: opt.category })
                  }}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder={t.font} />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {fontOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} style={{ fontFamily: opt.family }}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={weight} onValueChange={(v) => setWeight(v as FontWeight)}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder={t.weight} />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="100">{t.weights["100"]}</SelectItem>
                    <SelectItem value="200">{t.weights["200"]}</SelectItem>
                    <SelectItem value="300">{t.weights["300"]}</SelectItem>
                    <SelectItem value="400">{t.weights["400"]}</SelectItem>
                    <SelectItem value="500">{t.weights["500"]}</SelectItem>
                    <SelectItem value="600">{t.weights["600"]}</SelectItem>
                    <SelectItem value="700">{t.weights["700"]}</SelectItem>
                    <SelectItem value="800">{t.weights["800"]}</SelectItem>
                    <SelectItem value="900">{t.weights["900"]}</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t.size}</span>
                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Math.max(6, Number(e.target.value || 12)))}
                    className="w-20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">{t.color}</span>
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setColor("#000000")}
                        className={`w-6 h-6 rounded border-2 ${color === "#000000" ? "border-blue-500" : "border-gray-300"}`}
                        style={{ backgroundColor: "#000000" }}
                        title={t.black}
                      />
                      <button
                        onClick={() => setColor("#ffffff")}
                        className={`w-6 h-6 rounded border-2 ${color === "#ffffff" ? "border-blue-500" : "border-gray-300"}`}
                        style={{ backgroundColor: "#ffffff" }}
                        title={t.white}
                      />
                      {documentColors.map((docColor, index) => (
                        <button
                          key={index}
                          onClick={() => setColor(docColor)}
                          className={`w-6 h-6 rounded border-2 ${color === docColor ? "border-blue-500" : "border-gray-300"}`}
                          style={{ backgroundColor: docColor }}
                          title={`${t.documentColor} ${index + 1}`}
                        />
                      ))}
                    </div>
                    <input
                      aria-label={t.customColor}
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-6 w-6 rounded border"
                      title={t.customColor}
                    />
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{t.zoom}</span>
                    <div className="w-40">
                      <input
                        type="range"
                        min={0.6}
                        max={2.2}
                        step={0.1}
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <Button onClick={exportPdf} className="gap-2">
                    <Download className="h-4 w-4" />
                    {t.downloadPdf}
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{t.shortcuts}</div>
            </CardContent>
          </Card>

          <div
            ref={scrollRef}
            className="rounded-md bg-neutral-100 dark:bg-neutral-800 p-4 overflow-auto"
            style={{ height: "calc(100vh - 240px)" }}
          >
            <div ref={containerRef} className="mx-auto">
              {numPages === 0 && (
                <div className="text-center text-muted-foreground py-24">
                  <p className="text-xl font-medium">{t.uploadMessage}</p>
                  <p className="mt-2">{t.uploadSubMessage}</p>
                </div>
              )}
              {Array.from({ length: numPages }).map((_, pageIdx) => {
                const host =
                  (containerRef.current?.querySelector(`[data-page="${pageIdx}"] .react-overlay`) as HTMLDivElement) ||
                  null
                if (!host) return null

                const pageBoxes = boxes.filter((b) => b.pageIndex === pageIdx)
                const pageMasks = masks.filter((m) => m.pageIndex === pageIdx)

                return (
                  <div key={pageIdx}>
                    {pageMasks.map((m) =>
                      createPortal(
                        <div
                          key={`mask-${m.id}`}
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            left: Math.round(m.x),
                            top: Math.round(m.y),
                            width: Math.round(m.widthPx),
                            height: Math.round(m.heightPx),
                            background: m.colorHex || "#fff",
                            borderRadius: 0,
                            pointerEvents: "none",
                            zIndex: 0,
                          }}
                        />,
                        host,
                      ),
                    )}

                    <PageBoxes
                      host={host}
                      pageIndex={pageIdx}
                      boxes={pageBoxes}
                      activeId={activeId}
                      setActiveId={setActiveId}
                      addBox={addBox}
                      deleteBox={deleteBox}
                      duplicateBox={duplicateBox}
                      changeText={changeText}
                      beginDrag={beginDrag}
                      setBoxes={setBoxes}
                      focusId={focusId}
                      refocusKey={refocusKey}
                      t={t}
                      selectedIds={selectedIds}
                      handleBoxSelect={handleBoxSelect}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {showChangelog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-background border border-border rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Changelog - free PDF Editor v1</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowChangelog(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">v1.2.0 - Latest</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Multi-selection of text boxes with CTRL+click</li>
                    <li>• Group operations: move, duplicate, and delete multiple boxes</li>
                    <li>• Apply style changes to multiple selected boxes simultaneously</li>
                    <li>• Click outside to deselect all boxes</li>
                    <li>• Improved drag and drop for multiple selections</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">v1.1.0</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Dark mode support with system detection</li>
                    <li>• Theme toggle (light/dark/system)</li>
                    <li>• Improved favicon and branding</li>
                    <li>• Enhanced UI contrast and accessibility</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">v1.0.0</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Versioned file naming system (_edit_v1, _edit_v2, etc.)</li>
                    <li>• Fixed font size scaling in PDF export</li>
                    <li>• Improved PDF export reliability</li>
                    <li>• Better error handling and user feedback</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">v0.9.0</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Text editing with font customization</li>
                    <li>• Color picker for text styling</li>
                    <li>• Font size and weight controls</li>
                    <li>• Drag and drop text positioning</li>
                    <li>• PDF export functionality</li>
                    <li>• Multi-language support (EN/ES)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPrivacyNotice && (
        <div className="fixed bottom-0 left-0 right-0 bg-black dark:bg-gray-900 text-white p-4 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <p className="text-sm">
              {language === "en"
                ? "This website does not store any data, documents, cookies, or personal information. All processing is done locally in your browser."
                : "Este sitio web no almacena datos, documentos, cookies o información personal. Todo el procesamiento se realiza localmente en tu navegador."}
            </p>
            <button
              onClick={() => setShowPrivacyNotice(false)}
              className="text-white hover:bg-white hover:text-black dark:hover:bg-gray-700 dark:hover:text-white flex-shrink-0 px-3 py-1 rounded transition-colors"
            >
              {language === "en" ? "Accept" : "Aceptar"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PageBoxes({
  host,
  pageIndex,
  boxes,
  activeId,
  setActiveId,
  addBox,
  deleteBox,
  duplicateBox,
  changeText,
  beginDrag,
  setBoxes,
  focusId,
  refocusKey,
  t,
  selectedIds,
  handleBoxSelect,
}: {
  host: HTMLDivElement
  pageIndex: number
  boxes: TextBox[]
  activeId: string | null
  setActiveId: (id: string | null) => void
  addBox: (b: TextBox) => void
  deleteBox: (id: string) => void
  duplicateBox: (id: string) => void
  changeText: (id: string, text: string) => void
  beginDrag: () => void
  setBoxes: React.Dispatch<React.SetStateAction<TextBox[]>>
  focusId: string | null
  refocusKey: number
  t: typeof translations.en
  selectedIds: string[]
  handleBoxSelect: (id: string, ctrlKey: boolean) => void
}) {
  return (
    <>
      {boxes.map((b) => (
        <FloatingBox
          key={b.id}
          host={host}
          box={b}
          selected={selectedIds.includes(b.id)}
          onSelect={(ctrlKey) => handleBoxSelect(b.id, ctrlKey)}
          onChangeText={(newText) => changeText(b.id, newText)}
          onDragStart={() => {
            if (selectedIds.includes(b.id) && selectedIds.length > 1) {
              beginDrag()
            } else {
              beginDrag()
            }
          }}
          onDragTo={(absX, absY) => {
            if (selectedIds.includes(b.id) && selectedIds.length > 1) {
              const deltaX = absX - b.x
              const deltaY = absY - b.y
              setBoxes((prev) =>
                prev.map((box) => {
                  if (selectedIds.includes(box.id)) {
                    return {
                      ...box,
                      x: Math.max(0, box.x + deltaX),
                      y: Math.max(0, box.y + deltaY),
                    }
                  }
                  return box
                }),
              )
            } else {
              setBoxes((prev) => prev.map((x) => (x.id === b.id ? { ...x, x: absX, y: absY } : x)))
            }
          }}
          shouldAutoFocus={focusId === b.id}
          onDelete={() => deleteBox(b.id)}
          onDuplicate={() => duplicateBox(b.id)}
          refocusKey={refocusKey}
          t={t}
        />
      ))}
    </>
  )
}

function FloatingBox({
  host,
  box,
  selected,
  onSelect,
  onChangeText,
  onDragStart,
  onDragTo,
  shouldAutoFocus,
  onDelete,
  onDuplicate,
  refocusKey,
  t,
}: {
  host: HTMLDivElement
  box: TextBox
  selected: boolean
  onSelect: (ctrlKey: boolean) => void
  onChangeText: (v: string) => void
  onDragStart: () => void
  onDragTo: (absX: number, absY: number) => void
  shouldAutoFocus?: boolean
  onDelete: () => void
  onDuplicate: () => void
  refocusKey: number
  t: typeof translations.en
}) {
  const editRef = useRef<HTMLDivElement | null>(null)
  const typingRef = useRef(false)

  useEffect(() => {
    const el = editRef.current
    if (!el) return
    if (typingRef.current) return
    if (el.innerText !== (box.text ?? "")) el.innerText = box.text ?? ""
  }, [box.text, box.id])

  useEffect(() => {
    const el = editRef.current
    if (!el) return
    if (!selected && !shouldAutoFocus) return
    requestAnimationFrame(() => placeCaretAtEnd(el))
  }, [shouldAutoFocus, selected, refocusKey])

  function startDrag(e: React.PointerEvent) {
    e.stopPropagation()
    e.preventDefault()
    onDragStart()

    const startX = e.clientX
    const startY = e.clientY
    const initX = box.x
    const initY = box.y
    let rafId = 0
    let pending = false
    let nextX = initX
    let nextY = initY

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return
      nextX = initX + dx
      nextY = initY + dy
      if (!pending) {
        pending = true
        rafId = window.requestAnimationFrame(() => {
          onDragTo(nextX, nextY)
          pending = false
        })
      }
    }
    const onUp = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      if (rafId) cancelAnimationFrame(rafId)
      document.body.style.cursor = ""
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp, { once: true })
    document.body.style.cursor = "grabbing"
  }

  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: `${box.x}px`,
    top: `${box.y}px`,
    pointerEvents: "auto",
    userSelect: "text",
  }

  const editorStyle: React.CSSProperties = {
    fontFamily: box.fontFamily,
    fontWeight: box.weight,
    fontSize: box.fontSize,
    color: box.color,
    backgroundColor: box.mode === "replace" ? "transparent" : "transparent",
    padding: 0,
    outline: selected ? "2px solid #22c55e" : "1px dashed rgba(0,0,0,0.25)",
    borderRadius: 4,
    whiteSpace: "pre-wrap",
    minWidth: 8,
    cursor: "text",
    direction: "ltr",
    unicodeBidi: "plaintext" as React.CSSProperties["unicodeBidi"],
    textAlign: "left",
    lineHeight: box.mode === "replace" ? "normal" : 1.25,
    transform: box.mode === "replace" ? "translateY(0)" : "none",
  }

  return createPortal(
    <div
      className="v0-text-box"
      style={wrapperStyle}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(e.ctrlKey || e.metaKey)
      }}
    >
      {selected && (
        <button
          type="button"
          aria-label={t.moveBox}
          onPointerDown={startDrag}
          style={{
            position: "absolute",
            left: -10,
            top: -10,
            width: 16,
            height: 16,
            borderRadius: 8,
            background: "#22c55e",
            color: "white",
            border: "1px solid white",
            display: "grid",
            placeItems: "center",
            cursor: "grab",
            zIndex: 2,
          }}
        >
          <Move size={10} />
        </button>
      )}

      {selected && (
        <button
          type="button"
          aria-label={t.duplicateBox}
          onPointerDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onDuplicate()
          }}
          style={{
            position: "absolute",
            left: "50%",
            top: -10,
            transform: "translateX(-50%)",
            width: 16,
            height: 16,
            borderRadius: 8,
            background: "#3b82f6",
            color: "white",
            border: "1px solid white",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <Copy size={10} />
        </button>
      )}

      {selected && (
        <button
          type="button"
          aria-label={t.deleteBox}
          onPointerDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onDelete()
          }}
          style={{
            position: "absolute",
            right: -10,
            top: -10,
            width: 16,
            height: 16,
            borderRadius: 8,
            background: "#ef4444",
            color: "white",
            border: "1px solid white",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <X size={10} />
        </button>
      )}

      <div
        ref={editRef}
        dir="ltr"
        tabIndex={0}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onPointerDown={(e) => e.stopPropagation()}
        onInput={(e) => {
          typingRef.current = true
          onChangeText((e.target as HTMLDivElement).innerText)
          requestAnimationFrame(() => {
            typingRef.current = false
          })
        }}
        onFocus={(e) => {
          placeCaretAtEnd(e.currentTarget)
        }}
        style={{ ...editorStyle, position: "relative", zIndex: 1 }}
      />
    </div>,
    host,
  )
}

function placeCaretAtEnd(el: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}
