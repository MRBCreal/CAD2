import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Unit, UnitStatus } from '../types';

const COLLECTION = 'units';

/**
 * Crea una nueva unidad en Firestore.
 */
export async function createUnit(
    data: Omit<Unit, 'id' | 'lastUpdateAt'>
): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
        ...data,
        lastUpdateAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Actualiza el estado de una unidad.
 */
export async function updateUnitStatus(
    unitId: string,
    status: UnitStatus
): Promise<void> {
    const ref = doc(db, COLLECTION, unitId);
    await updateDoc(ref, {
        status,
        lastUpdateAt: serverTimestamp(),
    });
}

/**
 * Actualiza la ubicación de una unidad.
 */
export async function updateUnitLocation(
    unitId: string,
    lat: number,
    lng: number
): Promise<void> {
    const ref = doc(db, COLLECTION, unitId);
    await updateDoc(ref, {
        currentLocation: { lat, lng },
        lastUpdateAt: serverTimestamp(),
    });
}

/**
 * Suscripción en tiempo real a todas las unidades.
 */
export function subscribeToUnits(
    callback: (units: Unit[]) => void
): () => void {
    const q = query(
        collection(db, COLLECTION),
        orderBy('lastUpdateAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const units: Unit[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Unit[];
        callback(units);
    });

    return unsubscribe;
}
