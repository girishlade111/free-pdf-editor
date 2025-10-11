"use client"

import dynamic from "next/dynamic"

const PdfEditor = dynamic(() => import("@/components/pdf-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading PDF Editor...</p>
      </div>
    </div>
  ),
})

export default function Page() {
  return (
    <>
      <div className="sr-only">
        <h1>Free PDF Editor - Edit PDF Files Online</h1>
        <p>
          Edit your PDF documents online for free. Our PDF editor allows you to modify text, move images, change fonts,
          adjust colors, and download your edited PDFs instantly. No software installation or registration required.
        </p>
        <h2>Features:</h2>
        <ul>
          <li>Edit PDF text with advanced font controls</li>
          <li>Move and resize images within PDFs</li>
          <li>Upload new images to your documents</li>
          <li>Change text colors and font weights</li>
          <li>Undo and redo functionality</li>
          <li>Download edited PDFs</li>
          <li>Works in any web browser</li>
          <li>Completely free to use</li>
        </ul>
      </div>

      <main className="min-h-screen" role="main" aria-label="PDF Editor Application">
        <PdfEditor />
      </main>
    </>
  )
}
