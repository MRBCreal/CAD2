import { useState, useEffect } from 'react';
import { subscribeToIncidents } from '../services/incidents';
import type { Incident, IncidentStatus } from '../types';

export function useIncidents(statusFilter?: IncidentStatus) {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const unsubscribe = subscribeToIncidents(
            (data) => {
                setIncidents(data);
                setLoading(false);
            },
            statusFilter,
            (err) => {
                console.error('[CAD] Error en useIncidents:', err);
                setError('Error al cargar los incidentes. Verifica tu conexión.');
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [statusFilter]);

    return { incidents, loading, error };
}
