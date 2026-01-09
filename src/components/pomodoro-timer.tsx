'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PomodoroMode = 'work' | 'break';

const WORK_TIME = 9 * 60 * 60; // 9 hours in seconds
const BREAK_TIME = 15 * 60; // 15 minutes in seconds

interface PomodoroState {
    mode: PomodoroMode;
    endTime: number | null; // Timestamp when timer should finish
    sessions: number;
    isRunning: boolean;
}

export function PomodoroTimer() {
    const [mode, setMode] = useState<PomodoroMode>('work');
    const [endTime, setEndTime] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const notificationShownRef = useRef(false);

    // Load state from localStorage and check if timer completed while away
    useEffect(() => {
        const saved = localStorage.getItem('pomodoro-state');
        if (saved) {
            try {
                const state: PomodoroState = JSON.parse(saved);
                setMode(state.mode || 'work');
                setSessions(state.sessions || 0);

                // Check if timer was running and calculate time left
                if (state.isRunning && state.endTime) {
                    const now = Date.now();
                    const remaining = Math.max(0, Math.floor((state.endTime - now) / 1000));

                    if (remaining > 0) {
                        // Timer still running
                        setEndTime(state.endTime);
                        setTimeLeft(remaining);
                        setIsRunning(true);
                    } else {
                        // Timer finished while app was closed!
                        handleTimerComplete(state.mode);
                        setTimeLeft(state.mode === 'work' ? BREAK_TIME : WORK_TIME);
                    }
                } else {
                    // Timer was paused
                    setTimeLeft(state.mode === 'work' ? WORK_TIME : BREAK_TIME);
                }
            } catch (e) {
                console.error('Error loading pomodoro state:', e);
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        const state: PomodoroState = {
            mode,
            endTime,
            sessions,
            isRunning,
        };
        localStorage.setItem('pomodoro-state', JSON.stringify(state));
    }, [mode, endTime, sessions, isRunning]);

    // Timer logic - check every second
    useEffect(() => {
        if (isRunning && endTime) {
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

                setTimeLeft(remaining);

                if (remaining === 0 && !notificationShownRef.current) {
                    notificationShownRef.current = true;
                    handleTimerComplete(mode);
                }
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, endTime, mode]);

    const handleTimerComplete = (completedMode: PomodoroMode) => {
        setIsRunning(false);
        setEndTime(null);

        // Send browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(
                completedMode === 'work' ? '¡Tiempo de descanso! 🎉' : '¡A trabajar! 💪',
                {
                    body: completedMode === 'work'
                        ? 'Has completado 9 horas de trabajo. Toma un descanso de 15 minutos.'
                        : 'Descanso terminado. Es hora de volver al trabajo.',
                    icon: '/icon-192x192.png',
                    requireInteraction: true, // Notification stays until user interacts
                    tag: 'pomodoro-timer', // Replace previous notifications
                }
            );
        }

        // Switch mode
        if (completedMode === 'work') {
            setSessions((prev) => prev + 1);
            setMode('break');
            setTimeLeft(BREAK_TIME);
        } else {
            setMode('work');
            setTimeLeft(WORK_TIME);
        }

        // Reset notification flag after a delay
        setTimeout(() => {
            notificationShownRef.current = false;
        }, 2000);
    };

    const toggleTimer = () => {
        // Request notification permission on first interaction
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    new Notification('¡Notificaciones activadas! 🔔', {
                        body: 'Te avisaremos cuando termine el temporizador, incluso si cierras la app.',
                        icon: '/icon-192x192.png',
                    });
                }
            });
        }

        if (!isRunning) {
            // Start timer - calculate end time
            const duration = mode === 'work' ? WORK_TIME : BREAK_TIME;
            const newEndTime = Date.now() + (duration * 1000);
            setEndTime(newEndTime);
            setIsRunning(true);
            notificationShownRef.current = false;
        } else {
            // Pause timer
            setIsRunning(false);
            setEndTime(null);
        }
    };

    const resetTimer = () => {
        setIsRunning(false);
        setEndTime(null);
        setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
        notificationShownRef.current = false;
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalTime = mode === 'work' ? WORK_TIME : BREAK_TIME;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
        <div className={cn(
            'glass-card rounded-xl p-4 max-w-xs',
            mode === 'work' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'
        )}>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-sm">
                        {mode === 'work' ? '💼 Jornada Laboral' : '☕ Descanso'}
                    </h3>
                    <p className="text-xs text-muted-foreground">{sessions} jornadas completadas</p>
                </div>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTimer}
                        className="h-8 w-8"
                        title={isRunning ? 'Pausar' : 'Iniciar'}
                    >
                        {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetTimer}
                        className="h-8 w-8"
                        title="Reiniciar"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="relative">
                <div className="text-3xl font-bold text-center mb-2 tabular-nums">
                    {formatTime(timeLeft)}
                </div>

                <p className="text-xs text-center text-muted-foreground mb-2">
                    {mode === 'work' ? '9 horas de trabajo' : '15 min de descanso'}
                </p>

                {/* Progress bar */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full transition-all duration-1000 ease-linear',
                            mode === 'work' ? 'bg-blue-500' : 'bg-green-500'
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {isRunning && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                        🔔 Funciona en segundo plano
                    </p>
                )}
            </div>
        </div>
    );
}
