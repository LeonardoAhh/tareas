'use client';

import { useEffect, useRef } from 'react';
import { useFirebase } from '@/firebase/client-provider';
import { useUser } from '@/firebase/provider';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export function useReminders() {
    const { firestore } = useFirebase();
    const { user } = useUser();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const notificationShownRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!firestore || !user) return;

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Check reminders every minute
        const checkReminders = async () => {
            if (!firestore || !user) return;

            try {
                const tasksRef = collection(firestore, 'users', user.uid, 'tasks');
                const now = new Date();

                // Query tasks with reminders that haven't been sent
                const q = query(tasksRef);
                const snapshot = await getDocs(q);

                snapshot.forEach(async (taskDoc) => {
                    const task = taskDoc.data();

                    // Check if task has reminder
                    if (!task.recordatorio || task.recordatorio.enviado) return;

                    // Convert Firestore timestamp to Date
                    const reminderDate = task.recordatorio.fecha.toDate ?
                        task.recordatorio.fecha.toDate() :
                        new Date(task.recordatorio.fecha);

                    // Check if reminder time has passed and hasn't been shown yet
                    if (reminderDate <= now && !notificationShownRef.current.has(taskDoc.id)) {
                        // Send notification
                        if ('Notification' in window && Notification.permission === 'granted') {
                            const notification = new Notification('📋 Recordatorio de Tarea', {
                                body: task.tarea,
                                icon: '/icon-192x192.png',
                                tag: `reminder-${taskDoc.id}`,
                                requireInteraction: true,
                                data: { taskId: taskDoc.id },
                            });

                            // Open app when clicking notification
                            notification.onclick = () => {
                                window.focus();
                                notification.close();
                            };
                        }

                        // Mark as sent in Firestore
                        const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskDoc.id);
                        await updateDoc(taskRef, {
                            'recordatorio.enviado': true,
                        });

                        // Mark as shown in memory
                        notificationShownRef.current.add(taskDoc.id);
                    }
                });
            } catch (error) {
                console.error('Error checking reminders:', error);
            }
        };

        // Check immediately
        checkReminders();

        // Then check every minute
        intervalRef.current = setInterval(checkReminders, 60000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [firestore, user]);
}
