'use client';

import { useState } from 'react';
import { Fingerprint, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBiometricAuth } from '@/hooks/use-biometric-auth';
import { usePinLock } from '@/hooks/use-pin-lock';

interface PinLockScreenProps {
    onUnlock: () => void;
}

export function PinLockScreen({ onUnlock }: PinLockScreenProps) {
    const { isAvailable, authenticate, biometricName } = useBiometricAuth();
    const { config, verifyPin, unlock } = usePinLock();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [showPinPad, setShowPinPad] = useState(!config.useBiometric);

    const handleBiometric = async () => {
        try {
            const success = await authenticate();
            if (success) {
                unlock();
                onUnlock();
            } else {
                setError('Autenticación fallida');
                setShowPinPad(true);
            }
        } catch (e) {
            setError('Error con biométrico. Usa PIN.');
            setShowPinPad(true);
        }
    };

    const handlePinInput = (digit: string) => {
        if (pin.length < 4) {
            const newPin = pin + digit;
            setPin(newPin);

            if (newPin.length === 4) {
                setTimeout(() => {
                    if (verifyPin(newPin)) {
                        unlock();
                        onUnlock();
                    } else {
                        setError('PIN incorrecto');
                        setPin('');
                    }
                }, 100);
            }
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
        setError('');
    };

    return (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
            <div className="glass-card rounded-[32px] shadow-2xl p-10 max-w-md w-full text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                    <Lock className="w-10 h-10 text-primary" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold mb-2">Bloqueado</h2>
                <p className="text-muted-foreground mb-8">
                    Desbloquea para continuar
                </p>

                {/* Biometric Button */}
                {config.useBiometric && isAvailable && !showPinPad && (
                    <div className="space-y-4 mb-6">
                        <Button
                            onClick={handleBiometric}
                            className="w-full h-14 rounded-xl text-lg font-semibold"
                            size="lg"
                        >
                            <Fingerprint className="w-6 h-6 mr-2" />
                            Usar {biometricName}
                        </Button>

                        <button
                            onClick={() => setShowPinPad(true)}
                            className="text-sm text-muted-foreground hover:text-foreground underline"
                        >
                            Usar PIN en su lugar
                        </button>
                    </div>
                )}

                {/* PIN Input */}
                {showPinPad && (
                    <>
                        {/* PIN Display */}
                        <div className="flex justify-center gap-3 mb-6">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center ${pin.length > i
                                            ? 'bg-primary border-primary'
                                            : 'border-muted bg-muted/30'
                                        }`}
                                >
                                    {pin.length > i && (
                                        <div className="w-3 h-3 rounded-full bg-primary-foreground" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <p className="text-sm text-destructive mb-4">{error}</p>
                        )}

                        {/* Number Pad */}
                        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <Button
                                    key={num}
                                    variant="outline"
                                    onClick={() => handlePinInput(num.toString())}
                                    className="h-14 rounded-xl text-xl font-semibold"
                                >
                                    {num}
                                </Button>
                            ))}
                            <div /> {/* Empty space */}
                            <Button
                                variant="outline"
                                onClick={() => handlePinInput('0')}
                                className="h-14 rounded-xl text-xl font-semibold"
                            >
                                0
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleBackspace}
                                className="h-14 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
