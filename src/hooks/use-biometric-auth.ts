'use client';

import { useState, useEffect } from 'react';
import { BiometricService } from '@/lib/biometric-service';

export function useBiometricAuth() {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [biometricName, setBiometricName] = useState('Biométrico');

    useEffect(() => {
        checkAvailability();
    }, []);

    const checkAvailability = async () => {
        const available = await BiometricService.isAvailable();
        setIsAvailable(available);
        setIsRegistered(BiometricService.isRegistered());
        setBiometricName(BiometricService.getBiometricName());
    };

    const register = async (): Promise<boolean> => {
        const success = await BiometricService.register();
        if (success) {
            setIsRegistered(true);
        }
        return success;
    };

    const authenticate = async (): Promise<boolean> => {
        return await BiometricService.authenticate();
    };

    const unregister = () => {
        BiometricService.unregister();
        setIsRegistered(false);
    };

    return {
        isAvailable,
        isRegistered,
        biometricName,
        register,
        authenticate,
        unregister,
    };
}
