'use client';

import { useUser } from '@/firebase/provider';
import { useEffect, useState } from 'react';

const MOTIVATIONAL_MESSAGES = [
    "¡Hoy es un gran día para ser productivo!",
    "Enfócate en lo importante",
    "Un paso a la vez, llegarás lejos",
    "Tu esfuerzo de hoy es tu éxito de mañana",
    "¡Vamos a lograr grandes cosas!",
    "Hazlo con pasión o no lo hagas",
    "El progreso, no la perfección",
    "Tu único límite eres tú mismo",
    "Haz que hoy cuente",
    "¡Estás haciendo un gran trabajo!",
    "Mantén el momentum",
    "Cada tarea completada es una victoria",
];

const GREETINGS = {
    morning: "Buenos días",
    afternoon: "Buenas tardes",
    evening: "Buenas noches",
};

function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return GREETINGS.morning;
    if (hour >= 12 && hour < 19) return GREETINGS.afternoon;
    return GREETINGS.evening;
}

function getRandomMessage(): string {
    return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}

export function WelcomeMessage() {
    const { user } = useUser();
    const [message, setMessage] = useState('');
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        setGreeting(getGreeting());
        setMessage(getRandomMessage());

        // Change message every 30 seconds for variety
        const interval = setInterval(() => {
            setMessage(getRandomMessage());
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    if (!user) return null;

    // Get first name from email or displayName
    const getUserName = () => {
        if (user.displayName) {
            return user.displayName.split(' ')[0];
        }
        if (user.email) {
            return user.email.split('@')[0];
        }
        return 'Usuario';
    };

    const firstName = getUserName();

    return (
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {greeting}, <span className="text-primary">{firstName}</span> 👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground italic">
                {message}
            </p>
        </div>
    );
}
