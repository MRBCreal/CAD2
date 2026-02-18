import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useIncidents } from '../hooks/useIncidents';
import { useUnits } from '../hooks/useUnits';
import { updateIncidentStatus } from '../services/incidents';
import { updateUnitStatus } from '../services/units';
import type { Incident, UnitStatus } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Patrullero.css';


const incidentPin = (priority: string) => {
    const color = priority === 'Crítica' ? '#ef4444' : priority === 'Alta' ? '#f97316' : priority === 'Media' ? '#eab308' : '#22c55e';
    return L.divIcon({
        className: '',
        html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 12px ${color}"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
};

export default function Patrullero() {
    const { profile, logout } = useAuth();
    const { incidents } = useIncidents();
    const { units } = useUnits();
    const [myStatus, setMyStatus] = useState<UnitStatus>('DISPONIBLE');

    // Encontrar la unidad del patrullero (simulado: primera unidad disponible u ocupada)
    const myUnit = units.find(u => u.callsign === 'P-21') || units[0];

    // Incidentes asignados a esta unidad
    const myIncidents = myUnit
        ? incidents.filter(i => i.assignedUnits.includes(myUnit.id) && i.status !== 'CERRADO' && i.status !== 'CANCELADO')
        : [];

    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const current = selectedIncident || myIncidents[0] || null;

    const handleChangeMyStatus = async (newStatus: UnitStatus) => {
        setMyStatus(newStatus);
        if (myUnit) {
            await updateUnitStatus(myUnit.id, newStatus);
        }
    };

    const handleArrived = async () => {
        if (current) {
            await updateIncidentStatus(current.id, 'EN_CURSO');
        }
    };

    const handleFinish = async () => {
        if (current) {
            await updateIncidentStatus(current.id, 'CERRADO');
            setSelectedIncident(null);
        }
        if (myUnit) {
            await updateUnitStatus(myUnit.id, 'DISPONIBLE');
            setMyStatus('DISPONIBLE');
        }
    };

    const statusColor = myStatus === 'DISPONIBLE' ? '#22c55e' : myStatus === 'OCUPADO' ? '#f97316' : '#6b7280';

    return (
        <div className="patrol-layout">
            {/* HEADER */}
            <header className="patrol-header">
                <div className="patrol-header-top">
                    <div className="patrol-id">
                        <span className="patrol-icon">🚔</span>
                        <div>
                            <h1>{myUnit?.callsign || 'Sin Unidad'}</h1>
                            <span className="patrol-name">{profile?.displayName}</span>
                        </div>
                    </div>
                    <div className="patrol-header-actions">
                        <span className="my-status-dot" style={{ background: statusColor }}></span>
                        <select
                            className="status-select"
                            value={myStatus}
                            onChange={e => handleChangeMyStatus(e.target.value as UnitStatus)}
                        >
                            <option value="DISPONIBLE">Disponible</option>
                            <option value="OCUPADO">Ocupado</option>
                            <option value="FUERA_SERVICIO">Fuera de Servicio</option>
                        </select>
                        <button className="btn-logout-sm" onClick={logout}>Salir</button>
                    </div>
                </div>
            </header>

            {/* INCIDENTE ACTUAL */}
            {current ? (
                <section className="patrol-incident">
                    <div className="incident-header-bar">
                        <span className={`incident-priority priority-${current.priority.toLowerCase()}`}>
                            {current.priority}
                        </span>
                        <span className="incident-type-label">{current.type}</span>
                        <span className={`incident-status status-${current.status.toLowerCase()}`}>
                            {current.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="incident-details">
                        <div className="detail-row">
                            <span className="detail-icon">📍</span>
                            <span>{current.address}</span>
                        </div>
                        {current.description && (
                            <div className="detail-row">
                                <span className="detail-icon">📝</span>
                                <span>{current.description}</span>
                            </div>
                        )}
                    </div>

                    {/* MAP */}
                    {current.location && (
                        <div className="patrol-map-wrap">
                            <MapContainer
                                center={[current.location.lat, current.location.lng]}
                                zoom={15}
                                className="patrol-map"
                                key={current.id}
                            >
                                <TileLayer
                                    attribution='&copy; CARTO'
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                />
                                <Marker
                                    position={[current.location.lat, current.location.lng]}
                                    icon={incidentPin(current.priority)}
                                >
                                    <Popup>{current.type} — {current.address}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="patrol-actions">
                        {current.status === 'DESPACHADO' && (
                            <button className="btn-patrol btn-arrived" onClick={handleArrived}>
                                📍 En el Lugar
                            </button>
                        )}
                        {(current.status === 'EN_CURSO' || current.status === 'DESPACHADO') && (
                            <button className="btn-patrol btn-finish" onClick={handleFinish}>
                                ✅ Finalizar
                            </button>
                        )}
                    </div>
                </section>
            ) : (
                <section className="patrol-empty">
                    <div className="empty-icon">📡</div>
                    <h2>Sin incidentes asignados</h2>
                    <p>Esperando despacho desde central…</p>
                    <div className="pulse-ring"></div>
                </section>
            )}

            {/* LISTA DE INCIDENTES */}
            {myIncidents.length > 1 && (
                <section className="patrol-list">
                    <h3>Incidentes Asignados ({myIncidents.length})</h3>
                    {myIncidents.map(inc => (
                        <div
                            key={inc.id}
                            className={`patrol-list-item ${current?.id === inc.id ? 'active' : ''}`}
                            onClick={() => setSelectedIncident(inc)}
                        >
                            <span className={`list-priority priority-${inc.priority.toLowerCase()}`}></span>
                            <div>
                                <strong>{inc.type}</strong>
                                <span className="list-address">{inc.address}</span>
                            </div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}
