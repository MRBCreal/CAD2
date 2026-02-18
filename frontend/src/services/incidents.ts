import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    orderBy,
    where,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Incident, IncidentStatus } from '../types';

const COLLECTION = 'incidents';

/**
 * Crea un nuevo incidente en Firestore.
 * Retorna el ID del documento creado.
 */
export async function createIncident(
    data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'assignedUnits'>
): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
        ...data,
        status: 'NUEVO' as IncidentStatus,
        assignedUnits: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Actualiza el estado de un incidente.
 */
export async function updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus
): Promise<void> {
    const ref = doc(db, COLLECTION, incidentId);
    await updateDoc(ref, {
        status,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Asigna una unidad a un incidente.
 */
export async function assignUnitToIncident(
    incidentId: string,
    unitId: string,
    currentUnits: string[]
): Promise<void> {
    if (currentUnits.includes(unitId)) return;
    const ref = doc(db, COLLECTION, incidentId);
    await updateDoc(ref, {
        assignedUnits: [...currentUnits, unitId],
        updatedAt: serverTimestamp(),
    });
}

/**
 * Desasigna una unidad de un incidente.
 */
export async function removeUnitFromIncident(
    incidentId: string,
    unitId: string,
    currentUnits: string[]
): Promise<void> {
    const ref = doc(db, COLLECTION, incidentId);
    await updateDoc(ref, {
        assignedUnits: currentUnits.filter((id) => id !== unitId),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Suscripción en tiempo real a incidentes, ordenados por fecha de creación.
 * Opcionalmente filtra por estado.
 */
export function subscribeToIncidents(
    callback: (incidents: Incident[]) => void,
    statusFilter?: IncidentStatus,
    onError?: (error: Error) => void
): () => void {
    let q = query(
        collection(db, COLLECTION),
        orderBy('createdAt', 'desc')
    );

    if (statusFilter) {
        q = query(
            collection(db, COLLECTION),
            where('status', '==', statusFilter),
            orderBy('createdAt', 'desc')
        );
    }

    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const incidents: Incident[] = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as Incident[];
            callback(incidents);
        },
        (error) => {
            console.error('[CAD] Error en suscripción de incidentes:', error);
            if (onError) onError(error);
        }
    );

    return unsubscribe;
}
