import {
  Inter,
  Roboto,
  Open_Sans,
  Lato,
  Poppins,
  Merriweather,
  Source_Serif_4,
  Inconsolata,
  JetBrains_Mono,
  Noto_Sans,
  Noto_Serif,
} from "next/font/google"

const inter = Inter({ subsets: ["latin"], weight: ["400", "700"], display: "optional" })
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"], display: "optional" })
const openSans = Open_Sans({ subsets: ["latin"], weight: ["400", "700"], display: "optional" })
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], display: "optional" })
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"], display: "optional" })
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"], display: "optional" })
const sourceSerif = Source_Serif_4({ subsets: ["latin"], weight: ["400", "700"], display: "optional" })
const inconsolata = Inconsolata({ subsets: ["latin"], weight: ["400", "700"], display: "optional" })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "optional" })
const notoSans = Noto_Sans({ subsets: ["latin"], weight: ["400", "700"], display: "optional" })
const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"], display: "optional" })

export type GoogleFontInfo = {
  id: string
  label: string
  family: string // CSS font-family string
  category: "sans" | "serif" | "mono"
  className: string
}

export const GOOGLE_FONTS: GoogleFontInfo[] = [
  { id: "inter", label: "Inter", family: inter.style.fontFamily, category: "sans", className: inter.className },
  { id: "roboto", label: "Roboto", family: roboto.style.fontFamily, category: "sans", className: roboto.className },
  {
    id: "open-sans",
    label: "Open Sans",
    family: openSans.style.fontFamily,
    category: "sans",
    className: openSans.className,
  },
  { id: "lato", label: "Lato", family: lato.style.fontFamily, category: "sans", className: lato.className },
  { id: "poppins", label: "Poppins", family: poppins.style.fontFamily, category: "sans", className: poppins.className },
  {
    id: "noto-sans",
    label: "Noto Sans",
    family: notoSans.style.fontFamily,
    category: "sans",
    className: notoSans.className,
  },

  {
    id: "merriweather",
    label: "Merriweather",
    family: merriweather.style.fontFamily,
    category: "serif",
    className: merriweather.className,
  },
  {
    id: "source-serif",
    label: "Source Serif 4",
    family: sourceSerif.style.fontFamily,
    category: "serif",
    className: sourceSerif.className,
  },
  {
    id: "noto-serif",
    label: "Noto Serif",
    family: notoSerif.style.fontFamily,
    category: "serif",
    className: notoSerif.className,
  },

  {
    id: "inconsolata",
    label: "Inconsolata",
    family: inconsolata.style.fontFamily,
    category: "mono",
    className: inconsolata.className,
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    family: jetbrains.style.fontFamily,
    category: "mono",
    className: jetbrains.className,
  },
]
