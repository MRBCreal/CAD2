import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useIncidents } from '../hooks/useIncidents';
import { useUnits } from '../hooks/useUnits';
import { updateIncidentStatus, assignUnitToIncident, removeUnitFromIncident } from '../services/incidents';
import { updateUnitStatus } from '../services/units';
import { logEvent } from '../services/eventLogs';
import {
    INCIDENT_STATUS_LABELS,
    UNIT_STATUS_LABELS,
    type Incident,
    type IncidentStatus,
    type UnitStatus,
} from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Supervisor.css';

// Fix Leaflet marker icons for bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Iconos personalizados
const incidentIcon = (priority: string) => {
    const colors: Record<string, string> = {
        'Baja': '#3b82f6',
        'Media': '#f59e0b',
        'Alta': '#f97316',
        'Crítica': '#ef4444',
    };
    const color = colors[priority] || '#6b7280';
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
};

const unitIcon = (status: UnitStatus) => {
    const colors: Record<UnitStatus, string> = {
        'DISPONIBLE': '#22c55e',
        'OCUPADO': '#f59e0b',
        'FUERA_SERVICIO': '#6b7280',
        'DESCONECTADO': '#374151',
    };
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:${colors[status]};width:12px;height:12px;border-radius:3px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);transform:rotate(45deg);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });
};

// Santiago de Chile center
const SANTIAGO_CENTER: [number, number] = [-33.4489, -70.6693];

export default function Supervisor() {
    const { user, profile, logout } = useAuth();
    const { incidents } = useIncidents();
    const { units } = useUnits();
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [assigningUnit, setAssigningUnit] = useState(false);

    const handleStatusChange = async (incident: Incident, newStatus: IncidentStatus) => {
        try {
            await updateIncidentStatus(incident.id, newStatus);
            if (user) {
                await logEvent(incident.id, 'ESTADO_CAMBIADO', `Estado cambiado a ${INCIDENT_STATUS_LABELS[newStatus]}`, user.uid);
            }
        } catch (err) {
            console.error('Error al cambiar estado:', err);
        }
    };

    const handleAssignUnit = async (incident: Incident, unitId: string) => {
        try {
            await assignUnitToIncident(incident.id, unitId, incident.assignedUnits);
            await updateUnitStatus(unitId, 'OCUPADO');
            if (user) {
                await logEvent(incident.id, 'UNIDAD_ASIGNADA', `Unidad asignada: ${unitId}`, user.uid);
            }
            if (incident.status === 'NUEVO') {
                await updateIncidentStatus(incident.id, 'DESPACHADO');
            }
        } catch (err) {
            console.error('Error al asignar unidad:', err);
        }
    };

    const handleRemoveUnit = async (incident: Incident, unitId: string) => {
        try {
            await removeUnitFromIncident(incident.id, unitId, incident.assignedUnits);
            await updateUnitStatus(unitId, 'DISPONIBLE');
            if (user) {
                await logEvent(incident.id, 'UNIDAD_DESASIGNADA', `Unidad desasignada: ${unitId}`, user.uid);
            }
        } catch (err) {
            console.error('Error al desasignar unidad:', err);
        }
    };

    const handleUnitStatusChange = async (unitId: string, newStatus: UnitStatus) => {
        try {
            await updateUnitStatus(unitId, newStatus);
        } catch (err) {
            console.error('Error al cambiar estado de unidad:', err);
        }
    };

    const activeIncidents = incidents.filter((i) => i.status !== 'CERRADO' && i.status !== 'CANCELADO');
    const availableUnits = units.filter((u) => u.status === 'DISPONIBLE');

    return (
        <div className="supervisor">
            <header className="dashboard-header">
                <div className="header-brand">
                    <div className="header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div>
                        <h1>Vista de Supervisor</h1>
                        <span className="header-user">{profile?.displayName || user?.email}</span>
                    </div>
                </div>
                <nav className="header-nav">
                    <a href="/" className="nav-link">Panel Operador</a>
                    <button onClick={logout} className="btn-secondary btn-sm">Cerrar sesión</button>
                </nav>
            </header>

            <div className="supervisor-layout">
                {/* Map */}
                <div className="map-container">
                    <MapContainer
                        center={SANTIAGO_CENTER}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Marcadores de incidentes */}
                        {activeIncidents
                            .filter((inc) => inc.location)
                            .map((inc) => (
                                <Marker
                                    key={`inc-${inc.id}`}
                                    position={[inc.location!.lat, inc.location!.lng]}
                                    icon={incidentIcon(inc.priority)}
                                >
                                    <Popup>
                                        <div className="map-popup">
                                            <strong>Incidente: {inc.type}</strong>
                                            <span>Prioridad: {inc.priority}</span>
                                            <span>Estado: {INCIDENT_STATUS_LABELS[inc.status]}</span>
                                            <span>{inc.address}</span>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                        {/* Marcadores de unidades */}
                        {units
                            .filter((u) => u.currentLocation)
                            .map((u) => (
                                <Marker
                                    key={`unit-${u.id}`}
                                    position={[u.currentLocation!.lat, u.currentLocation!.lng]}
                                    icon={unitIcon(u.status)}
                                >
                                    <Popup>
                                        <div className="map-popup">
                                            <strong>{u.callsign} – {u.type}</strong>
                                            <span>Estado: {UNIT_STATUS_LABELS[u.status]}</span>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                    </MapContainer>
                </div>

                {/* Sidebar */}
                <aside className="supervisor-sidebar">
                    {/* Unidades en terreno */}
                    <section className="sidebar-section">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="section-icon">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                            Unidades en terreno
                            <span className="count-badge">{units.length}</span>
                        </h3>
                        <div className="unit-list">
                            {units.length === 0 && (
                                <p className="empty-text">No hay unidades registradas</p>
                            )}
                            {units.map((unit) => (
                                <div key={unit.id} className={`unit-card unit-${unit.status.toLowerCase()}`}>
                                    <div className="unit-card-header">
                                        <strong>{unit.callsign}</strong>
                                        <span className={`badge ${getUnitStatusClass(unit.status)}`}>
                                            {UNIT_STATUS_LABELS[unit.status]}
                                        </span>
                                    </div>
                                    <div className="unit-card-body">
                                        <span className="unit-type">{unit.type}</span>
                                        <div className="unit-actions">
                                            {unit.status !== 'DISPONIBLE' && (
                                                <button
                                                    className="btn-action btn-success"
                                                    onClick={() => handleUnitStatusChange(unit.id, 'DISPONIBLE')}
                                                    title="Marcar como disponible"
                                                >
                                                    Disponible
                                                </button>
                                            )}
                                            {unit.status !== 'FUERA_SERVICIO' && (
                                                <button
                                                    className="btn-action btn-muted"
                                                    onClick={() => handleUnitStatusChange(unit.id, 'FUERA_SERVICIO')}
                                                    title="Marcar como fuera de servicio"
                                                >
                                                    Fuera de servicio
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Incidentes activos */}
                    <section className="sidebar-section">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="section-icon">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            Incidentes activos
                            <span className="count-badge">{activeIncidents.length}</span>
                        </h3>
                        <div className="incident-list">
                            {activeIncidents.length === 0 && (
                                <p className="empty-text">No hay incidentes activos</p>
                            )}
                            {activeIncidents.map((inc) => (
                                <div
                                    key={inc.id}
                                    className={`incident-card ${selectedIncident?.id === inc.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedIncident(selectedIncident?.id === inc.id ? null : inc)}
                                >
                                    <div className="incident-card-header">
                                        <span className={`badge priority-${inc.priority.toLowerCase().replace('í', 'i')}`}>
                                            {inc.priority}
                                        </span>
                                        <span className={`badge ${getIncStatusClass(inc.status)}`}>
                                            {INCIDENT_STATUS_LABELS[inc.status]}
                                        </span>
                                    </div>
                                    <div className="incident-card-body">
                                        <strong>{inc.type}</strong>
                                        <span className="incident-address">{inc.address}</span>
                                    </div>

                                    {/* Panel expandido con acciones */}
                                    {selectedIncident?.id === inc.id && (
                                        <div className="incident-actions">
                                            <div className="action-group">
                                                <span className="action-label">Cambiar estado:</span>
                                                <div className="action-buttons">
                                                    {inc.status !== 'EN_CURSO' && (
                                                        <button className="btn-action btn-info" onClick={(e) => { e.stopPropagation(); handleStatusChange(inc, 'EN_CURSO'); }}>
                                                            Marcar en curso
                                                        </button>
                                                    )}
                                                    {inc.status !== 'CERRADO' && (
                                                        <button className="btn-action btn-muted" onClick={(e) => { e.stopPropagation(); handleStatusChange(inc, 'CERRADO'); }}>
                                                            Cerrar incidente
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="action-group">
                                                <span className="action-label">
                                                    Unidades asignadas ({inc.assignedUnits.length}):
                                                </span>
                                                {inc.assignedUnits.length > 0 && (
                                                    <div className="assigned-units">
                                                        {inc.assignedUnits.map((uid) => {
                                                            const unit = units.find((u) => u.id === uid);
                                                            return (
                                                                <div key={uid} className="assigned-unit-chip">
                                                                    <span>{unit?.callsign || uid.substring(0, 6)}</span>
                                                                    <button
                                                                        className="chip-remove"
                                                                        onClick={(e) => { e.stopPropagation(); handleRemoveUnit(inc, uid); }}
                                                                        title="Desasignar unidad"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {availableUnits.length > 0 && (
                                                    <div className="assign-section">
                                                        <button
                                                            className="btn-action btn-primary-sm"
                                                            onClick={(e) => { e.stopPropagation(); setAssigningUnit(!assigningUnit); }}
                                                        >
                                                            {assigningUnit ? 'Cancelar' : 'Asignar unidad'}
                                                        </button>
                                                        {assigningUnit && (
                                                            <div className="assign-dropdown">
                                                                {availableUnits.map((u) => (
                                                                    <button
                                                                        key={u.id}
                                                                        className="assign-option"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAssignUnit(inc, u.id);
                                                                            setAssigningUnit(false);
                                                                        }}
                                                                    >
                                                                        {u.callsign} – {u.type}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

function getUnitStatusClass(status: UnitStatus): string {
    const map: Record<UnitStatus, string> = {
        DISPONIBLE: 'status-active',
        OCUPADO: 'status-dispatched',
        FUERA_SERVICIO: 'status-closed',
        DESCONECTADO: 'status-cancelled',
    };
    return map[status];
}

function getIncStatusClass(status: IncidentStatus): string {
    const map: Record<IncidentStatus, string> = {
        NUEVO: 'status-new',
        DESPACHADO: 'status-dispatched',
        EN_CURSO: 'status-active',
        CERRADO: 'status-closed',
        CANCELADO: 'status-cancelled',
    };
    return map[status];
}
