import { useState, useEffect } from 'react';
type ToastVariant = 'default' | 'destructive';
interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
}
const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_VALUE;
    return count.toString();
}
type ToasterToast = Toast & {
    id: string;
    open: boolean;
};
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const listeners: Array<(state: ToasterToast[]) => void> = [];
let memoryState: ToasterToast[] = [];
function dispatch(toast: Partial<ToasterToast>) {
    memoryState = [{ ...toast, id: genId(), open: true } as ToasterToast, ...memoryState].slice(
        0,
        TOAST_LIMIT
    );
    listeners.forEach((listener) => {
        listener(memoryState);
    });
}
function dismiss(toastId?: string) {
    if (toastId) {
        toastTimeouts.delete(toastId);
    }
    memoryState = memoryState.map((t) =>
        t.id === toastId || toastId === undefined ? { ...t, open: false } : t
    );
    listeners.forEach((listener) => {
        listener(memoryState);
    });
}
function remove(toastId?: string) {
    memoryState = memoryState.filter((t) => t.id !== toastId);
    listeners.forEach((listener) => {
        listener(memoryState);
    });
}
export function useToast() {
    const [state, setState] = useState<ToasterToast[]>(memoryState);
    useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, []);
    return {
        toast: (props: Omit<ToasterToast, 'id' | 'open'>) => {
            const id = genId();
            const update = (props: ToasterToast) => {
                memoryState = memoryState.map((t) => (t.id === props.id ? { ...t, ...props } : t));
                listeners.forEach((listener) => {
                    listener(memoryState);
                });
            };
            const dismiss = () => dismissToast(id);
            dispatch({ ...props, id, open: true });
            const duration = props.duration ?? TOAST_REMOVE_DELAY;
            const timeout = setTimeout(() => {
                dismissToast(id);
            }, duration);
            toastTimeouts.set(id, timeout);
            return {
                id,
                dismiss,
                update,
            };
        },
        dismiss: (toastId?: string) => dismiss(toastId),
        toasts: state,
    };
}
function dismissToast(toastId: string) {
    dismiss(toastId);
    setTimeout(() => {
        remove(toastId);
    }, 200);
}