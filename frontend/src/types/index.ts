// =============================================
// Tipos de dominio del CAD de Seguridad Ciudadana
// =============================================

import { Timestamp } from 'firebase/firestore';

// --- Incidente ---

export type IncidentType =
  | 'Robo en proceso'
  | 'Robo en lugar habitado'
  | 'Violencia intrafamiliar'
  | 'Ruidos molestos'
  | 'Accidente de tránsito'
  | 'Persona sospechosa'
  | 'Vandalismo'
  | 'Emergencia médica'
  | 'Incendio'
  | 'Otro';

export type IncidentPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';

export type IncidentStatus =
  | 'NUEVO'
  | 'DESPACHADO'
  | 'EN_CURSO'
  | 'CERRADO'
  | 'CANCELADO';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  description: string;
  address: string;
  location?: GeoLocation;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // userId del operador
  assignedUnits: string[]; // IDs de unidades
}

// --- Unidad ---

export type UnitType = 'Patrulla' | 'Moto' | 'Camioneta' | 'Dron' | 'Bicicleta';

export type UnitStatus =
  | 'DISPONIBLE'
  | 'OCUPADO'
  | 'FUERA_SERVICIO'
  | 'DESCONECTADO';

export interface Unit {
  id: string;
  type: UnitType;
  status: UnitStatus;
  callsign: string; // Código de radio, ej: "P-21"
  currentLocation?: GeoLocation;
  lastUpdateAt: Timestamp;
}

// --- Usuario ---

export type UserRole = 'OPERADOR' | 'SUPERVISOR' | 'MOVIL' | 'ADMIN';

export interface AppUser {
  id: string;
  displayName: string;
  role: UserRole;
  email: string;
  enabled: boolean;
}

// --- Registro de Eventos (Log de auditoría) ---

export type EventLogType =
  | 'CREADO'
  | 'ESTADO_CAMBIADO'
  | 'UNIDAD_ASIGNADA'
  | 'UNIDAD_DESASIGNADA'
  | 'NOTA_AGREGADA'
  | 'PRIORIDAD_CAMBIADA'
  | 'CERRADO'
  | 'CANCELADO';

export interface EventLog {
  id: string;
  incidentId: string;
  timestamp: Timestamp;
  type: EventLogType;
  description: string;
  actorUserId: string;
}

// --- Constantes para la UI ---

export const INCIDENT_TYPE_OPTIONS: IncidentType[] = [
  'Robo en proceso',
  'Robo en lugar habitado',
  'Violencia intrafamiliar',
  'Ruidos molestos',
  'Accidente de tránsito',
  'Persona sospechosa',
  'Vandalismo',
  'Emergencia médica',
  'Incendio',
  'Otro',
];

export const PRIORITY_OPTIONS: IncidentPriority[] = [
  'Baja',
  'Media',
  'Alta',
  'Crítica',
];

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  NUEVO: 'Nuevo',
  DESPACHADO: 'Despachado',
  EN_CURSO: 'En curso',
  CERRADO: 'Cerrado',
  CANCELADO: 'Cancelado',
};

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  DISPONIBLE: 'Disponible',
  OCUPADO: 'Ocupado',
  FUERA_SERVICIO: 'Fuera de servicio',
  DESCONECTADO: 'Desconectado',
};

export const UNIT_TYPE_OPTIONS: UnitType[] = [
  'Patrulla',
  'Moto',
  'Camioneta',
  'Dron',
  'Bicicleta',
];
