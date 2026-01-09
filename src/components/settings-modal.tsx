'use client';

import { useState } from 'react';
import { Settings, Lock, Fingerprint, Clock, Shield, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useBiometricAuth } from '@/hooks/use-biometric-auth';
import { usePinLock } from '@/hooks/use-pin-lock';
import { useToast } from '@/hooks/use-toast';

export function SettingsModal() {
    const [open, setOpen] = useState(false);
    const [setupStep, setSetupStep] = useState<'choose' | 'pin' | 'confirm'>('choose');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [useBiometric, setUseBiometric] = useState(false);

    const { isAvailable, isRegistered, biometricName, register, unregister } = useBiometricAuth();
    const { config, setPinAndEnable, disable, setAutoLockMinutes } = usePinLock();
    const { toast } = useToast();

    const handleEnableSecurity = async () => {
        if (useBiometric && isAvailable) {
            // Try to register biometric
            const success = await register();
            if (!success) {
                toast({
                    title: 'Error',
                    description: 'No se pudo configurar ' + biometricName,
                    variant: 'destructive',
                });
                return;
            }
        }

        if (setupStep === 'choose') {
            setSetupStep('pin');
        } else if (setupStep === 'pin') {
            if (pin.length !== 4) {
                toast({
                    title: 'Error',
                    description: 'El PIN debe tener 4 dígitos',
                    variant: 'destructive',
                });
                return;
            }
            setSetupStep('confirm');
        } else if (setupStep === 'confirm') {
            if (pin !== confirmPin) {
                toast({
                    title: 'Error',
                    description: 'Los PINs no coinciden',
                    variant: 'destructive',
                });
                return;
            }

            setPinAndEnable(pin, useBiometric);
            toast({
                title: '✓ Seguridad activada',
                description: useBiometric ? `${biometricName} y PIN configurados` : 'PIN configurado',
            });

            // Reset
            setSetupStep('choose');
            setPin('');
            setConfirmPin('');
            setUseBiometric(false);
            setOpen(false);
        }
    };

    const handleDisable = () => {
        disable();
        if (isRegistered) {
            unregister();
        }
        toast({
            title: '✓ Seguridad desactivada',
            description: 'El bloqueo ha sido removido',
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Configuración">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Configuración</DialogTitle>
                    <DialogDescription>
                        Administra la seguridad y privacidad de tu cuenta
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Security Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Shield className="h-5 w-5" />
                            Seguridad
                        </div>

                        {!config.enabled ? (
                            // Setup Flow
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Protege tu información con PIN o autenticación biométrica
                                </p>

                                {setupStep === 'choose' && (
                                    <>
                                        {isAvailable && (
                                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                                <div className="flex items-center gap-3">
                                                    <Fingerprint className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="font-medium">{biometricName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Desbloqueo rápido y seguro
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={useBiometric}
                                                    onCheckedChange={setUseBiometric}
                                                />
                                            </div>
                                        )}

                                        <Button onClick={handleEnableSecurity} className="w-full">
                                            <Lock className="h-4 w-4 mr-2" />
                                            Configurar Seguridad
                                        </Button>
                                    </>
                                )}

                                {setupStep === 'pin' && (
                                    <div className="space-y-4">
                                        <Label htmlFor="pin">Crear PIN (4 dígitos)</Label>
                                        <Input
                                            id="pin"
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                            placeholder="••••"
                                            className="text-center text-2xl tracking-widest"
                                        />
                                        <Button onClick={handleEnableSecurity} className="w-full" disabled={pin.length !== 4}>
                                            Continuar
                                        </Button>
                                    </div>
                                )}

                                {setupStep === 'confirm' && (
                                    <div className="space-y-4">
                                        <Label htmlFor="confirm">Confirmar PIN</Label>
                                        <Input
                                            id="confirm"
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={confirmPin}
                                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                            placeholder="••••"
                                            className="text-center text-2xl tracking-widest"
                                        />
                                        <Button onClick={handleEnableSecurity} className="w-full" disabled={confirmPin.length !== 4}>
                                            Activar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Config enabled - show options
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-medium">Seguridad Activa</p>
                                            <p className="text-xs text-muted-foreground">
                                                {config.useBiometric ? biometricName + ' + PIN' : 'PIN'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Auto-lock time */}
                                <div className="space-y-2">
                                    <Label htmlFor="autolock" className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Bloqueo Automático
                                    </Label>
                                    <select
                                        id="autolock"
                                        value={config.autoLockMinutes}
                                        onChange={(e) => setAutoLockMinutes(parseInt(e.target.value))}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3"
                                    >
                                        <option value="0">Nunca</option>
                                        <option value="1">1 minuto</option>
                                        <option value="5">5 minutos</option>
                                        <option value="15">15 minutos</option>
                                    </select>
                                </div>

                                <Button onClick={handleDisable} variant="destructive" className="w-full">
                                    Desactivar Seguridad
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
