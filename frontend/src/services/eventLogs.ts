import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { EventLog, EventLogType } from '../types';

const COLLECTION = 'eventLogs';

/**
 * Registra un evento en el log de auditoría.
 * Los eventos son inmutables – solo se crean, nunca se editan ni borran.
 */
export async function logEvent(
    incidentId: string,
    type: EventLogType,
    description: string,
    actorUserId: string
): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
        incidentId,
        type,
        description,
        actorUserId,
        timestamp: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Suscripción en tiempo real al log de eventos de un incidente específico.
 */
export function subscribeToEventLogs(
    incidentId: string,
    callback: (logs: EventLog[]) => void
): () => void {
    const q = query(
        collection(db, COLLECTION),
        where('incidentId', '==', incidentId),
        orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs: EventLog[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as EventLog[];
        callback(logs);
    });

    return unsubscribe;
}
