import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useIncidents } from '../hooks/useIncidents';
import { useUnits } from '../hooks/useUnits';
import { updateIncidentStatus, assignUnitToIncident, removeUnitFromIncident } from '../services/incidents';
import { updateUnitStatus } from '../services/units';
import type { Incident, IncidentStatus, UnitStatus } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import './Admin.css';

// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const SANTIAGO: [number, number] = [-33.4489, -70.6693];

function incidentIcon(priority: string) {
    const color = priority === 'Crítica' ? '#ef4444' : priority === 'Alta' ? '#f97316' : priority === 'Media' ? '#eab308' : '#22c55e';
    return L.divIcon({
        className: 'admin-marker',
        html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px ${color}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

function unitMarker(status: UnitStatus) {
    const color = status === 'DISPONIBLE' ? '#22d3ee' : status === 'OCUPADO' ? '#f97316' : '#6b7280';
    return L.divIcon({
        className: 'admin-marker',
        html: `<div style="background:${color};width:10px;height:10px;border-radius:3px;border:2px solid #fff;box-shadow:0 0 4px ${color}"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
    });
}

export default function Admin() {
    const { profile, logout } = useAuth();
    const { incidents } = useIncidents();
    const { units } = useUnits();
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [tab, setTab] = useState<'incidents' | 'units'>('incidents');

    const activos = incidents.filter(i => i.status !== 'CERRADO' && i.status !== 'CANCELADO');
    const criticos = incidents.filter(i => i.priority === 'Crítica' && i.status !== 'CERRADO');
    const disponibles = units.filter(u => u.status === 'DISPONIBLE');
    const ocupados = units.filter(u => u.status === 'OCUPADO');

    const handleStatusChange = async (incident: Incident, newStatus: IncidentStatus) => {
        await updateIncidentStatus(incident.id, newStatus);
    };

    const handleAssignUnit = async (incident: Incident, unitId: string) => {
        await assignUnitToIncident(incident.id, unitId, incident.assignedUnits);
        await updateUnitStatus(unitId, 'OCUPADO');
    };

    const handleRemoveUnit = async (incident: Incident, unitId: string) => {
        await removeUnitFromIncident(incident.id, unitId, incident.assignedUnits);
        await updateUnitStatus(unitId, 'DISPONIBLE');
    };

    const handleUnitStatusChange = async (unitId: string, newStatus: UnitStatus) => {
        await updateUnitStatus(unitId, newStatus);
    };

    const priorityClass = (p: string) =>
        p === 'Crítica' ? 'badge-critical' : p === 'Alta' ? 'badge-high' : p === 'Media' ? 'badge-medium' : 'badge-low';

    const statusClass = (s: IncidentStatus) =>
        s === 'NUEVO' ? 'st-new' : s === 'DESPACHADO' ? 'st-dispatched' : s === 'EN_CURSO' ? 'st-active' : 'st-closed';

    return (
        <div className="admin-layout">
            {/* HEADER */}
            <header className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-shield">🛡️</div>
                    <div>
                        <h1>Panel de Administración</h1>
                        <span className="admin-subtitle">CAD Seguridad Ciudadana</span>
                    </div>
                </div>
                <div className="admin-header-right">
                    <span className="admin-user">{profile?.displayName}</span>
                    <span className="admin-role-badge">ADMIN</span>
                    <button className="btn-logout" onClick={logout}>Cerrar sesión</button>
                </div>
            </header>

            {/* KPIs */}
            <section className="admin-kpis">
                <div className="kpi-card kpi-total">
                    <span className="kpi-number">{incidents.length}</span>
                    <span className="kpi-label">Total Incidentes</span>
                </div>
                <div className="kpi-card kpi-active">
                    <span className="kpi-number">{activos.length}</span>
                    <span className="kpi-label">Activos</span>
                </div>
                <div className="kpi-card kpi-critical">
                    <span className="kpi-number">{criticos.length}</span>
                    <span className="kpi-label">Críticos</span>
                </div>
                <div className="kpi-card kpi-units">
                    <span className="kpi-number">{disponibles.length}/{units.length}</span>
                    <span className="kpi-label">Unidades Disponibles</span>
                </div>
                <div className="kpi-card kpi-deployed">
                    <span className="kpi-number">{ocupados.length}</span>
                    <span className="kpi-label">Desplegadas</span>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <div className="admin-main">
                {/* LEFT: TABLE */}
                <section className="admin-table-section">
                    <div className="admin-tabs">
                        <button className={`admin-tab ${tab === 'incidents' ? 'active' : ''}`} onClick={() => setTab('incidents')}>
                            📋 Incidentes ({incidents.length})
                        </button>
                        <button className={`admin-tab ${tab === 'units' ? 'active' : ''}`} onClick={() => setTab('units')}>
                            🚓 Unidades ({units.length})
                        </button>
                    </div>

                    {tab === 'incidents' ? (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Tipo</th>
                                        <th>Prioridad</th>
                                        <th>Estado</th>
                                        <th>Dirección</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidents.map(inc => (
                                        <tr
                                            key={inc.id}
                                            className={selectedIncident?.id === inc.id ? 'row-selected' : ''}
                                            onClick={() => setSelectedIncident(inc)}
                                        >
                                            <td>{inc.type}</td>
                                            <td><span className={`badge ${priorityClass(inc.priority)}`}>{inc.priority}</span></td>
                                            <td><span className={`badge ${statusClass(inc.status)}`}>{inc.status.replace('_', ' ')}</span></td>
                                            <td>{inc.address}</td>
                                            <td className="actions-cell">
                                                {inc.status === 'NUEVO' && (
                                                    <button className="btn-sm btn-dispatch" onClick={(e) => { e.stopPropagation(); handleStatusChange(inc, 'DESPACHADO'); }}>Despachar</button>
                                                )}
                                                {inc.status === 'EN_CURSO' && (
                                                    <button className="btn-sm btn-close" onClick={(e) => { e.stopPropagation(); handleStatusChange(inc, 'CERRADO'); }}>Cerrar</button>
                                                )}
                                                {inc.status !== 'CERRADO' && inc.status !== 'CANCELADO' && (
                                                    <button className="btn-sm btn-cancel" onClick={(e) => { e.stopPropagation(); handleStatusChange(inc, 'CANCELADO'); }}>Cancelar</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Tipo</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {units.map(u => (
                                        <tr key={u.id}>
                                            <td className="callsign">{u.callsign}</td>
                                            <td>{u.type}</td>
                                            <td>
                                                <span className={`badge ${u.status === 'DISPONIBLE' ? 'st-available' : u.status === 'OCUPADO' ? 'st-busy' : 'st-off'}`}>
                                                    {u.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                {u.status !== 'DISPONIBLE' && (
                                                    <button className="btn-sm btn-free" onClick={() => handleUnitStatusChange(u.id, 'DISPONIBLE')}>Liberar</button>
                                                )}
                                                {u.status === 'DISPONIBLE' && (
                                                    <button className="btn-sm btn-off" onClick={() => handleUnitStatusChange(u.id, 'FUERA_SERVICIO')}>Fuera Serv.</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Assignment panel */}
                    {selectedIncident && tab === 'incidents' && (
                        <div className="admin-assign-panel">
                            <h3>Asignar unidad a: {selectedIncident.type}</h3>
                            <div className="assign-units">
                                {selectedIncident.assignedUnits.length > 0 && (
                                    <div className="assigned-list">
                                        <span className="assign-label">Asignadas:</span>
                                        {selectedIncident.assignedUnits.map(uid => {
                                            const u = units.find(x => x.id === uid);
                                            return (
                                                <span key={uid} className="assigned-chip">
                                                    {u?.callsign || uid}
                                                    <button onClick={() => handleRemoveUnit(selectedIncident, uid)}>✕</button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                                <div className="available-units">
                                    {disponibles
                                        .filter(u => !selectedIncident.assignedUnits.includes(u.id))
                                        .map(u => (
                                            <button
                                                key={u.id}
                                                className="btn-sm btn-assign"
                                                onClick={() => handleAssignUnit(selectedIncident, u.id)}
                                            >
                                                + {u.callsign}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* RIGHT: MAP */}
                <section className="admin-map-section">
                    <MapContainer center={SANTIAGO} zoom={13} className="admin-map">
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {incidents.filter(i => i.location).map(inc => (
                            <Marker
                                key={inc.id}
                                position={[inc.location!.lat, inc.location!.lng]}
                                icon={incidentIcon(inc.priority)}
                            >
                                <Popup>
                                    <strong>{inc.type}</strong><br />
                                    {inc.priority} — {inc.status}<br />
                                    {inc.address}
                                </Popup>
                            </Marker>
                        ))}
                        {units.filter(u => u.currentLocation).map(u => (
                            <Marker
                                key={u.id}
                                position={[u.currentLocation!.lat, u.currentLocation!.lng]}
                                icon={unitMarker(u.status)}
                            >
                                <Popup>
                                    <strong>{u.callsign}</strong> ({u.type})<br />
                                    {u.status}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </section>
            </div>
        </div>
    );
}
