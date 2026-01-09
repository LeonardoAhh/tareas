'use client';

import { motion } from 'framer-motion';

interface TaskIconProps {
    className?: string;
    size?: number;
}

export function TaskIcon({ className = '', size = 24 }: TaskIconProps) {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            {/* Background circle - Retro gradient */}
            <motion.circle
                cx="12"
                cy="12"
                r="11"
                fill="url(#retroGradient)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: 'backOut' }}
            />

            {/* Checkmark lines with stagger animation */}
            <motion.path
                d="M7 12L10.5 15.5L17 9"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeInOut' }}
            />

            {/* Sparkle effect */}
            <motion.circle
                cx="18"
                cy="6"
                r="1.5"
                fill="white"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut'
                }}
            />

            {/* Second sparkle */}
            <motion.circle
                cx="6"
                cy="18"
                r="1"
                fill="white"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                }}
                transition={{
                    duration: 1.5,
                    delay: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut'
                }}
            />

            {/* Gradient definition */}
            <defs>
                <linearGradient id="retroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
            </defs>
        </motion.svg>
    );
}
