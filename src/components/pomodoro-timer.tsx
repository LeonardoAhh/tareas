'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PomodoroMode = 'work' | 'break';

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

export function PomodoroTimer() {
    const [mode, setMode] = useState<PomodoroMode>('work');
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('pomodoro-state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                setMode(state.mode || 'work');
                setTimeLeft(state.timeLeft || WORK_TIME);
                setSessions(state.sessions || 0);
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    // Save state to localStorage
    useEffect(() => {
        const state = { mode, timeLeft, sessions, isRunning: false };
        localStorage.setItem('pomodoro-state', JSON.stringify(state));
    }, [mode, timeLeft, sessions]);

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
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
    }, [isRunning, timeLeft]);

    const handleTimerComplete = () => {
        setIsRunning(false);

        // Send browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(mode === 'work' ? '¡Descanso! 🎉' : '¡A trabajar! 💪', {
                body: mode === 'work'
                    ? 'Toma un descanso de 5 minutos'
                    : 'Es hora de volver al trabajo',
                icon: '/icon-192x192.png',
            });
        }

        // Switch mode
        if (mode === 'work') {
            setSessions((prev) => prev + 1);
            setMode('break');
            setTimeLeft(BREAK_TIME);
        } else {
            setMode('work');
            setTimeLeft(WORK_TIME);
        }
    };

    const toggleTimer = () => {
        // Request notification permission on first interaction
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((mode === 'work' ? WORK_TIME : BREAK_TIME) - timeLeft) /
        (mode === 'work' ? WORK_TIME : BREAK_TIME) * 100;

    return (
        <div className={cn(
            'glass-card rounded-xl p-4 max-w-xs',
            mode === 'work' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'
        )}>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-sm">
                        {mode === 'work' ? '💼 Trabajo' : '☕ Descanso'}
                    </h3>
                    <p className="text-xs text-muted-foreground">{sessions} sesiones</p>
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
                <div className="text-4xl font-bold text-center mb-2 tabular-nums">
                    {formatTime(timeLeft)}
                </div>

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
            </div>
        </div>
    );
}
