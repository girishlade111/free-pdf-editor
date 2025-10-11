"use client"

import Link from "next/link"
import { FileX, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo and Icon */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <FileX className="w-8 h-8 text-white dark:text-black" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
              <div className="w-3 h-4 bg-white dark:bg-black rounded-sm"></div>
            </div>
            <h1 className="text-xl font-semibold text-black dark:text-white">free PDF Editor v1</h1>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-6xl font-bold text-black dark:text-white">404</h2>
          <h3 className="text-2xl font-semibold text-black dark:text-white">Página no encontrada</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Lo sentimos, la página que buscas no existe o ha sido movida. Verifica la URL o regresa al editor de PDF.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Ir al Editor
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </button>
        </div>

        {/* Additional Help */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            ¿Necesitas ayuda? Visita nuestro{" "}
            <Link href="/" className="text-black dark:text-white hover:underline font-medium">
              editor de PDF gratuito
            </Link>{" "}
            para editar tus documentos online.
          </p>
        </div>
      </div>
    </div>
  )
}
