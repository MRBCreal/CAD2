import {
    signInWithEmailAndPassword,
    signOut as fbSignOut,
    onAuthStateChanged,
    type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { AppUser } from '../types';

/**
 * Inicia sesión con correo y contraseña.
 */
export async function signIn(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function signOut(): Promise<void> {
    await fbSignOut(auth);
}

/**
 * Obtiene el perfil del usuario desde la colección users en Firestore.
 */
export async function getUserProfile(uid: string): Promise<AppUser | null> {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as AppUser;
}

/**
 * Suscribe a cambios de autenticación.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}
