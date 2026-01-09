'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console in development
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-destructive/5 p-4">
            <div className="glass-card rounded-[28px] shadow-2xl p-8 sm:p-10 max-w-md w-full text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
                    <svg
                        className="w-10 h-10 text-destructive"
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

                <h2 className="text-2xl font-bold mb-3">Algo salió mal</h2>

                <p className="text-muted-foreground mb-6">
                    Lo sentimos, ocurrió un error inesperado. Puedes intentar recargar la página.
                </p>

                {process.env.NODE_ENV === 'development' && error.message && (
                    <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-left">
                        <p className="text-xs font-mono text-destructive break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => reset()}
                        className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
                    >
                        Intentar de nuevo
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="flex-1 h-12 rounded-xl border-2 border-border font-semibold hover:bg-muted/50 transition-colors"
                    >
                        Ir al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
