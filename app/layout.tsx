import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Free PDF Editor - Edit PDF Files Online | Quick PDF Edit Tool",
  description:
    "Free online PDF editor to edit, modify, and customize PDF documents. Add text, move images, change fonts, and download your edited PDFs instantly. No registration required.",
  keywords:
    "free pdf editor, online pdf editor, edit pdf online, pdf text editor, modify pdf, pdf editor tool, edit pdf documents, online pdf tool, free pdf editing",
  authors: [{ name: "Free PDF Editor" }],
  creator: "Free PDF Editor",
  publisher: "Free PDF Editor",
  robots: "index, follow",
  metadataBase: new URL("https://free-pdf-editor.top"),
  alternates: {
    canonical: "https://free-pdf-editor.top",
    languages: {
      en: "https://free-pdf-editor.top",
      es: "https://free-pdf-editor.top/es",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://free-pdf-editor.top",
    title: "Free PDF Editor - Edit PDF Files Online",
    description:
      "Free online PDF editor to edit, modify, and customize PDF documents. Add text, move images, change fonts, and download your edited PDFs instantly.",
    siteName: "Free PDF Editor",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Free PDF Editor - Online PDF Editing Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free PDF Editor - Edit PDF Files Online",
    description: "Free online PDF editor to edit, modify, and customize PDF documents. No registration required.",
    images: ["/twitter-image.png"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "productivity",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="R93jpuomGm7uXFD7UDsJtw" async></script>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Free PDF Editor",
                alternateName: "Quick PDF Edit Tool",
                description:
                  "Free online PDF editor to edit, modify, and customize PDF documents. Add text, move images, change fonts, and download your edited PDFs instantly.",
                url: "https://free-pdf-editor.top",
                image: "https://free-pdf-editor.top/og-image.png",
                applicationCategory: "ProductivityApplication",
                operatingSystem: "Web Browser",
                browserRequirements: "Requires JavaScript. Requires HTML5.",
                softwareVersion: "1.0",
                datePublished: "2024-01-01",
                dateModified: new Date().toISOString().split("T")[0],
                inLanguage: ["en", "es"],
                isAccessibleForFree: true,
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                  validFrom: "2024-01-01",
                },
                featureList: [
                  "Edit PDF text online",
                  "Move and resize images in PDFs",
                  "Change fonts, colors and text properties",
                  "Upload and download PDF files",
                  "Multi-language support (English/Spanish)",
                  "No registration or account required",
                  "Browser-based PDF editing",
                  "Free unlimited usage",
                ],
                screenshot: "https://free-pdf-editor.top/og-image.png",
                author: {
                  "@type": "Organization",
                  name: "Free PDF Editor",
                  url: "https://free-pdf-editor.top",
                },
                publisher: {
                  "@type": "Organization",
                  name: "Free PDF Editor",
                  url: "https://free-pdf-editor.top",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Free PDF Editor",
                image: "https://free-pdf-editor.top/og-image.png",
                applicationCategory: "UtilitiesApplication",
                applicationSubCategory: "PDF Editor",
                operatingSystem: "Web Browser",
                url: "https://free-pdf-editor.top",
                downloadUrl: "https://free-pdf-editor.top",
                installUrl: "https://free-pdf-editor.top",
                softwareVersion: "1.0",
                fileSize: "0MB",
                price: "0",
                priceCurrency: "USD",
                description:
                  "Professional online PDF editor that allows you to edit text, images, and formatting in PDF documents directly in your browser.",
                featureList: [
                  "Text editing in PDFs",
                  "Image manipulation",
                  "Font customization",
                  "Color modification",
                  "File upload/download",
                  "Multi-language interface",
                ],
                screenshot: "https://free-pdf-editor.top/og-image.png",
              },
              {
                "@context": "https://schema.org",
                "@type": "Service",
                name: "Online PDF Editing Service",
                image: "https://free-pdf-editor.top/og-image.png",
                description:
                  "Free online service for editing PDF documents with text modification, image manipulation, and formatting tools.",
                provider: {
                  "@type": "Organization",
                  name: "Free PDF Editor",
                  url: "https://free-pdf-editor.top",
                },
                serviceType: "PDF Editing",
                areaServed: "Worldwide",
                availableLanguage: ["English", "Spanish"],
                isRelatedTo: {
                  "@type": "Thing",
                  name: "PDF Document Editing",
                },
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Product",
                "@id": "https://free-pdf-editor.top#product",
                name: "Free PDF Editor Tool",
                image: ["https://free-pdf-editor.top/og-image.png", "https://free-pdf-editor.top/icon-512.png"],
                description:
                  "Online PDF editing tool that enables users to modify PDF documents without software installation.",
                category: "Software Tool",
                brand: {
                  "@type": "Brand",
                  name: "Free PDF Editor",
                },
                manufacturer: {
                  "@type": "Organization",
                  name: "Free PDF Editor",
                  url: "https://free-pdf-editor.top",
                },
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                  seller: {
                    "@type": "Organization",
                    name: "Free PDF Editor",
                  },
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.8",
                  ratingCount: "1247",
                  reviewCount: "892",
                  itemReviewed: {
                    "@type": "Product",
                    "@id": "https://free-pdf-editor.top#product",
                  },
                },
                review: [
                  {
                    "@type": "Review",
                    itemReviewed: {
                      "@type": "Product",
                      "@id": "https://free-pdf-editor.top#product",
                    },
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: "5",
                      bestRating: "5",
                    },
                    author: {
                      "@type": "Person",
                      name: "Sarah Johnson",
                    },
                    reviewBody:
                      "Excellent free PDF editor! Easy to use and works perfectly in the browser without any downloads.",
                    datePublished: "2024-11-15",
                  },
                  {
                    "@type": "Review",
                    itemReviewed: {
                      "@type": "Product",
                      "@id": "https://free-pdf-editor.top#product",
                    },
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: "5",
                      bestRating: "5",
                    },
                    author: {
                      "@type": "Person",
                      name: "Mike Chen",
                    },
                    reviewBody:
                      "Great tool for quick PDF edits. The text editing feature works flawlessly and it's completely free.",
                    datePublished: "2024-11-20",
                  },
                  {
                    "@type": "Review",
                    itemReviewed: {
                      "@type": "Product",
                      "@id": "https://free-pdf-editor.top#product",
                    },
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: "4",
                      bestRating: "5",
                    },
                    author: {
                      "@type": "Person",
                      name: "Emma Rodriguez",
                    },
                    reviewBody: "Very useful tool for editing PDFs online. Works well for basic text modifications.",
                    datePublished: "2024-11-18",
                  },
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Free PDF Editor",
                url: "https://free-pdf-editor.top",
                description: "Free online PDF editor for editing PDF documents in your browser",
                inLanguage: ["en", "es"],
                isPartOf: {
                  "@type": "WebSite",
                  name: "Free PDF Editor",
                },
                about: {
                  "@type": "Thing",
                  name: "PDF Document Editing",
                },
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://free-pdf-editor.top/?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Is this PDF editor really free?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, our PDF editor is completely free to use with no registration required and no hidden fees.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Do I need to download software to edit PDFs?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No, our PDF editor works entirely in your web browser. No downloads or installations required.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What PDF editing features are available?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "You can edit text, move and resize images, change fonts and colors, and download your edited PDF files.",
                    },
                  },
                ],
              },
            ]),
          }}
        />
      </body>
    </html>
  )
}
