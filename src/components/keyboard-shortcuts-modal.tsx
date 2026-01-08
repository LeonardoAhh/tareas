'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface KeyboardShortcutsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const shortcuts = [
    { key: 'N', description: 'Abrir formulario de nueva tarea' },
    { key: '/', description: 'Enfocar barra de búsqueda' },
    { key: '?', description: 'Mostrar/ocultar esta ayuda' },
    { key: 'Escape', description: 'Cerrar modales y formularios' },
];

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Atajos de Teclado ⌨️</DialogTitle>
                    <DialogDescription>
                        Usa estos atajos para navegar más rápido
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {shortcuts.map((shortcut) => (
                        <div
                            key={shortcut.key}
                            className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50"
                        >
                            <span className="text-sm text-muted-foreground">
                                {shortcut.description}
                            </span>
                            <kbd className="pointer-events-none inline-flex h-7 select-none items-center gap-1 rounded border bg-background px-2 font-mono text-[11px] font-medium text-foreground shadow-sm">
                                {shortcut.key}
                            </kbd>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Presiona <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">?</kbd> en cualquier momento para ver esta ayuda
                </p>
            </DialogContent>
        </Dialog>
    );
}
