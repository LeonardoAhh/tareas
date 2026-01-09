'use client';

/**
 * Biometric Authentication Service
 * Uses Web Authentication API (WebAuthn) for Face ID, Touch ID, Fingerprint
 */

export interface BiometricCredential {
    id: string;
    rawId: ArrayBuffer;
}

export class BiometricService {
    private static readonly STORAGE_KEY = 'biometric-credential';
    private static readonly RP_NAME = 'Tareas';

    /**
     * Check if biometric authentication is available on this device
     */
    static async isAvailable(): Promise<boolean> {
        try {
            // Check if WebAuthn is supported
            if (!window.PublicKeyCredential) {
                return false;
            }

            // Check if platform authenticator is available
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            return available;
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            return false;
        }
    }

    /**
     * Get platform-specific biometric name
     */
    static getBiometricName(): string {
        const userAgent = navigator.userAgent.toLowerCase();

        if (/iphone|ipad|ipod/.test(userAgent)) {
            // iOS: could be Face ID or Touch ID
            return 'Face ID / Touch ID';
        } else if (/android/.test(userAgent)) {
            return 'Huella Digital';
        } else if (/macintosh/.test(userAgent)) {
            return 'Touch ID';
        } else if (/windows/.test(userAgent)) {
            return 'Windows Hello';
        }

        return 'Biométrico';
    }

    /**
     * Register a new biometric credential
     */
    static async register(): Promise<boolean> {
        try {
            // Generate random challenge
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);

            // Generate random user ID
            const userId = new Uint8Array(16);
            crypto.getRandomValues(userId);

            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: this.RP_NAME },
                    user: {
                        id: userId,
                        name: 'user',
                        displayName: 'Usuario',
                    },
                    pubKeyCredParams: [
                        { type: 'public-key', alg: -7 }, // ES256
                        { type: 'public-key', alg: -257 }, // RS256
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                    },
                    timeout: 60000,
                },
            }) as PublicKeyCredential;

            if (!credential) {
                return false;
            }

            // Save credential ID to localStorage
            const credentialData = {
                id: credential.id,
                rawId: Array.from(new Uint8Array(credential.rawId)),
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentialData));

            return true;
        } catch (error) {
            console.error('Error registering biometric:', error);
            return false;
        }
    }

    /**
     * Authenticate using biometrics
     */
    static async authenticate(): Promise<boolean> {
        try {
            // Get saved credential
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (!savedData) {
                return false;
            }

            const credentialData = JSON.parse(savedData);
            const credentialId = new Uint8Array(credentialData.rawId);

            // Generate random challenge
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);

            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge,
                    allowCredentials: [
                        {
                            id: credentialId,
                            type: 'public-key',
                            transports: ['internal'],
                        },
                    ],
                    userVerification: 'required',
                    timeout: 60000,
                },
            });

            return assertion !== null;
        } catch (error) {
            console.error('Error authenticating with biometric:', error);
            return false;
        }
    }

    /**
     * Remove registered biometric credential
     */
    static unregister(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Check if biometric is registered
     */
    static isRegistered(): boolean {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }
}
