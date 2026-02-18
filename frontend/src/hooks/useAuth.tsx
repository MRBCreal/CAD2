import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from 'firebase/auth';
import { onAuthChange, getUserProfile, signIn, signOut } from '../services/auth';
import type { AppUser } from '../types';

interface AuthContextType {
    user: User | null;
    profile: AppUser | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const p = await getUserProfile(firebaseUser.uid);
                    setProfile(p);
                } catch {
                    setProfile(null);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            await signIn(email, password);
        } catch (err: any) {
            let message = 'Error al iniciar sesión. Inténtalo nuevamente.';
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                message = 'Credenciales inválidas. Inténtalo nuevamente.';
            } else if (err.code === 'auth/user-not-found') {
                message = 'No se encontró un usuario con ese correo electrónico.';
            } else if (err.code === 'auth/too-many-requests') {
                message = 'Demasiados intentos fallidos. Espera un momento antes de intentar nuevamente.';
            }
            setError(message);
            setLoading(false);
        }
    };

    const logout = async () => {
        await signOut();
    };

    return (
        <AuthContext.Provider value= {{ user, profile, loading, error, login, logout }
}>
    { children }
    </AuthContext.Provider>
  );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return ctx;
}
