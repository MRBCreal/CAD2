import type { IncidentType, IncidentPriority } from '../types';

export interface AIAnalysisResult {
    type: IncidentType | null;
    priority: IncidentPriority | null;
    confidence: number;
    reasoning?: string;
}

/**
 * Analiza la descripción del incidente y sugiere tipo y prioridad.
 * Por ahora usa una heurística simple basada en palabras clave.
 * En el futuro esto se reemplazará por una llamada a Vertex AI / OpenAI.
 */
export async function analyzeIncidentDescription(description: string): Promise<AIAnalysisResult> {
    // Simular delay de red para realismo
    await new Promise(resolve => setTimeout(resolve, 1500));

    const text = description.toLowerCase();
    let type: IncidentType | null = null;
    let priority: IncidentPriority | null = null;
    let reasoning = '';

    // Lógica Heurística Básica

    // 1. Detección de Tipo
    if (text.includes('robo') || text.includes('asalto') || text.includes('ladrón') || text.includes('portonazo')) {
        type = 'Robo en proceso';
    } else if (text.includes('incendio') || text.includes('fuego') || text.includes('humo') || text.includes('llamas')) {
        type = 'Incendio';
    } else if (text.includes('choque') || text.includes('colisión') || text.includes('atropello') || text.includes('volcamiento')) {
        type = 'Accidente de tránsito';
    } else if (text.includes('ruido') || text.includes('fiesta') || text.includes('música') || text.includes('volumen')) {
        type = 'Ruidos molestos';
    } else if (text.includes('sospechoso') || text.includes('merodeando') || text.includes('extraño')) {
        type = 'Persona sospechosa';
    } else if (text.includes('pelea') || text.includes('riña') || text.includes('golpes') || text.includes('violencia')) {
        type = 'Violencia intrafamiliar'; // O podría ser 'Otro' dependiendo del contexto
    } else if (text.includes('medica') || text.includes('infarto') || text.includes('desmayo') || text.includes('herido')) {
        type = 'Emergencia médica';
    } else {
        type = 'Otro';
    }

    // 2. Detección de Prioridad (Refinamiento)
    if (type === 'Incendio' || type === 'Robo en proceso' || text.includes('arma') || text.includes('pistola') || text.includes('muerto') || text.includes('grave')) {
        priority = 'Crítica';
    } else if (type === 'Accidente de tránsito' || type === 'Violencia intrafamiliar' || type === 'Emergencia médica') {
        priority = 'Alta';
    } else if (type === 'Persona sospechosa') {
        priority = 'Media';
    } else {
        priority = 'Baja';
    }

    // Ajuste fino
    if (text.includes('urgente') || text.includes('ahora') || text.includes('ayuda')) {
        // Subir prioridad si es posible
        if (priority === 'Baja') priority = 'Media';
        else if (priority === 'Media') priority = 'Alta';
        else if (priority === 'Alta') priority = 'Crítica';
    }

    reasoning = `Detectado: ${type} con prioridad ${priority} basado en palabras clave.`;

    return {
        type,
        priority,
        confidence: 0.85, // Simulado
        reasoning
    };
}
