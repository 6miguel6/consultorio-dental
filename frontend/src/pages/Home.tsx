import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Logo / ícono dental */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl mx-auto flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-primary-700 mb-3">
          Consultorio Dental
        </h1>
        <p className="text-gray-500 mb-10 text-lg">
          Agenda tu cita de forma rápida y sencilla
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/registro"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  )
}
