"use client"
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
export type CalendarProps = React.ComponentProps<typeof DayPicker>
function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3 sm:p-4", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center mb-2",
                caption_label: "text-sm font-semibold tracking-wide",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100",
                    "transition-all duration-200 hover:bg-primary/10 hover:border-primary/30",
                    "hover:scale-105 active:scale-95"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex gap-1",
                head_cell:
                    "text-muted-foreground rounded-md w-9 font-medium text-[0.8rem] uppercase tracking-wider",
                row: "flex w-full mt-2 gap-1",
                cell: cn(
                    "relative h-9 w-9 text-center text-sm p-0 rounded-md",
                    "focus-within:relative focus-within:z-20 focus-within:ring-2 focus-within:ring-primary/30",
                    "[&:has([aria-selected].day-range-end)]:rounded-r-md",
                    "[&:has([aria-selected].day-outside)]:bg-accent/50",
                    "[&:has([aria-selected])]:bg-accent",
                    "first:[&:has([aria-selected])]:rounded-l-md",
                    "last:[&:has([aria-selected])]:rounded-r-md"
                ),
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    "transition-all duration-200 hover:bg-primary/10",
                    "hover:scale-105 active:scale-95 rounded-md"
                ),
                day_range_end: "day-range-end",
                day_selected: cn(
                    "bg-primary text-primary-foreground font-semibold",
                    "hover:bg-primary hover:text-primary-foreground",
                    "focus:bg-primary focus:text-primary-foreground",
                    "shadow-md shadow-primary/20"
                ),
                day_today: cn(
                    "bg-gradient-to-br from-accent to-accent/50",
                    "text-accent-foreground font-semibold",
                    "ring-2 ring-primary/30 ring-offset-1",
                    "shadow-sm"
                ),
                day_outside: cn(
                    "day-outside text-muted-foreground/40 opacity-40",
                    "aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                    "hover:opacity-60"
                ),
                day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed hover:bg-transparent",
                day_range_middle: cn(
                    "aria-selected:bg-accent aria-selected:text-accent-foreground"
                ),
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                IconLeft: ({ className, ...props }) => (
                    <ChevronLeft className={cn("h-4 w-4 transition-transform group-hover:-translate-x-0.5", className)} {...props} />
                ),
                IconRight: ({ className, ...props }) => (
                    <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-0.5", className)} {...props} />
                ),
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"
export { Calendar }