'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-red-950 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                            <svg
                                className="w-10 h-10 text-red-600 dark:text-red-400"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                            Error Global
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Ocurrió un error crítico en la aplicación. Por favor, recarga la página.
                        </p>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full h-12 rounded-xl bg-red-600 text-white font-semibold shadow-lg hover:bg-red-700 transition-colors"
                        >
                            Recargar aplicación
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
