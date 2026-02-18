import { useState, useEffect } from 'react';
import { subscribeToUnits } from '../services/units';
import type { Unit } from '../types';

export function useUnits() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        try {
            const unsubscribe = subscribeToUnits((data) => {
                setUnits(data);
                setLoading(false);
            });

            return unsubscribe;
        } catch {
            setError('Error al cargar las unidades. Verifica tu conexión.');
            setLoading(false);
        }
    }, []);

    return { units, loading, error };
}
