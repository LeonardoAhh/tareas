'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PinLockConfig {
    enabled: boolean;
    pin: string | null;
    useBiometric: boolean;
    autoLockMinutes: number; // 0 = never, 1, 5, 15
}

const DEFAULT_CONFIG: PinLockConfig = {
    enabled: false,
    pin: null,
    useBiometric: false,
    autoLockMinutes: 5,
};

export function usePinLock() {
    const [config, setConfig] = useState<PinLockConfig>(DEFAULT_CONFIG);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = () => {
        const saved = localStorage.getItem('pin-lock-config');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConfig(parsed);

                // If enabled, check if should be locked
                if (parsed.enabled) {
                    const lastUnlock = localStorage.getItem('last-unlock-time');
                    if (lastUnlock) {
                        const elapsed = Date.now() - parseInt(lastUnlock);
                        const threshold = parsed.autoLockMinutes * 60 * 1000;

                        if (parsed.autoLockMinutes > 0 && elapsed > threshold) {
                            setIsLocked(true);
                        }
                    } else {
                        setIsLocked(true);
                    }
                }
            } catch (e) {
                console.error('Error loading pin config:', e);
            }
        }
    };

    const saveConfig = useCallback((newConfig: PinLockConfig) => {
        setConfig(newConfig);
        localStorage.setItem('pin-lock-config', JSON.stringify(newConfig));
    }, []);

    const setPinAndEnable = (pin: string, useBiometric: boolean) => {
        const newConfig: PinLockConfig = {
            ...config,
            enabled: true,
            pin,
            useBiometric,
        };
        saveConfig(newConfig);
        setIsLocked(false);
        updateLastUnlock();
    };

    const disable = () => {
        const newConfig: PinLockConfig = {
            ...DEFAULT_CONFIG,
        };
        saveConfig(newConfig);
        setIsLocked(false);
    };

    const setAutoLockMinutes = (minutes: number) => {
        const newConfig = { ...config, autoLockMinutes: minutes };
        saveConfig(newConfig);
    };

    const verifyPin = (pin: string): boolean => {
        return config.pin === pin;
    };

    const unlock = () => {
        setIsLocked(false);
        updateLastUnlock();
    };

    const lock = () => {
        if (config.enabled) {
            setIsLocked(true);
        }
    };

    const updateLastUnlock = () => {
        localStorage.setItem('last-unlock-time', Date.now().toString());
    };

    return {
        config,
        isLocked,
        setPinAndEnable,
        disable,
        setAutoLockMinutes,
        verifyPin,
        unlock,
        lock,
    };
}
