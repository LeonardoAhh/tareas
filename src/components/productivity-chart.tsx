'use client';

import { useMemo } from 'react';
import { Tarea } from '@/lib/schemas';
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductivityChartProps {
    tareas: Tarea[];
    days?: number;
}

export function ProductivityChart({ tareas, days = 7 }: ProductivityChartProps) {
    const chartData = useMemo(() => {
        const today = startOfDay(new Date());
        const data = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(today, i);
            const nextDate = subDays(today, i - 1);

            const completed = tareas.filter(tarea => {
                if (tarea.status !== 'completada') return false;
                const taskDate = startOfDay(tarea.fechaTermino);
                return isWithinInterval(taskDate, { start: date, end: nextDate });
            }).length;

            data.push({
                date,
                label: format(date, 'EEE', { locale: es }),
                completed,
            });
        }

        return data;
    }, [tareas, days]);

    const maxCompleted = Math.max(...chartData.map(d => d.completed), 1);
    const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0);
    const avgPerDay = (totalCompleted / days).toFixed(1);

    return (
        <div className="glass-card rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Productividad
                    </h3>
                    <p className="text-xs text-muted-foreground">Últimos {days} días</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{totalCompleted}</div>
                    <div className="text-xs text-muted-foreground">{avgPerDay}/día</div>
                </div>
            </div>

            {/* Chart */}
            <div className="flex items-end justify-between gap-2 h-32 sm:h-40">
                {chartData.map((day, index) => {
                    const heightPercent = (day.completed / maxCompleted) * 100;

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex items-end justify-center h-full">
                                <div
                                    className={cn(
                                        "w-full rounded-t-md transition-all duration-300 hover:opacity-80 relative group",
                                        day.completed > 0
                                            ? "bg-gradient-to-t from-primary to-primary/60"
                                            : "bg-muted/50"
                                    )}
                                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                                >
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                            {day.completed} {day.completed === 1 ? 'tarea' : 'tareas'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Day label */}
                            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium capitalize">
                                {day.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gradient-to-t from-primary to-primary/60" />
                    <span className="text-muted-foreground">Completadas</span>
                </div>
            </div>
        </div>
    );
}
