import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useIncidents } from '../hooks/useIncidents';
import { useUnits } from '../hooks/useUnits';
import { createIncident, assignUnitToIncident, updateIncidentStatus } from '../services/incidents';
import { updateUnitStatus } from '../services/units';
import { analyzeIncidentDescription } from '../services/ai';
import { logEvent } from '../services/eventLogs';
import {
    INCIDENT_TYPE_OPTIONS,
    PRIORITY_OPTIONS,
    INCIDENT_STATUS_LABELS,
    UNIT_STATUS_LABELS,
    type Incident,
    type IncidentType,
    type IncidentPriority,
    type IncidentStatus,
    type UnitStatus,
} from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

// Fix Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const redPinIcon = L.divIcon({
    className: 'incident-pin',
    html: `<div class="pin-pulse"></div><div class="pin-dot"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

const SANTIAGO: [number, number] = [-33.4489, -70.6693];

export default function Dashboard() {
    const { user, profile, logout } = useAuth();
    const { incidents, loading: incLoading, error: incError } = useIncidents();
    const { units } = useUnits();
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    // Form state
    const [formType, setFormType] = useState<IncidentType>('Robo en proceso');
    const [formPriority, setFormPriority] = useState<IncidentPriority>('Media');
    const [formAddress, setFormAddress] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiMsg, setAiMsg] = useState<string | null>(null);

    // Clock
    const [clock, setClock] = useState('');
    useEffect(() => {
        const tick = () => setClock(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // KPIs
    const activeCount = incidents.filter(i => i.status !== 'CERRADO' && i.status !== 'CANCELADO').length;
    const closedToday = incidents.filter(i => {
        if (i.status !== 'CERRADO' || !i.updatedAt?.toDate) return false;
        const d = i.updatedAt.toDate();
        const now = new Date();
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
    }).length;
    const deployedUnits = units.filter(u => u.status === 'OCUPADO').length;
    const availableCount = units.filter(u => u.status === 'DISPONIBLE').length;

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setFormSubmitting(true);
        setFormMsg(null);
        try {
            await createIncident({ type: formType, priority: formPriority, description: formDescription, address: formAddress, createdBy: user.uid });
            setFormMsg({ ok: true, text: 'Incidente registrado.' });
            setFormDescription('');
            setFormAddress('');
        } catch {
            setFormMsg({ ok: false, text: 'Error al registrar.' });
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleAIAnalyze = async () => {
        if (!formDescription.trim()) {
            setAiMsg('Escribe una descripción primero.');
            return;
        }
        setIsAnalyzing(true);
        setAiMsg(null);
        try {
            const result = await analyzeIncidentDescription(formDescription);
            if (result.type) setFormType(result.type);
            if (result.priority) setFormPriority(result.priority);
            setAiMsg(`✨ Sugerencia aplicada: ${result.type} (${result.priority}) — ${Math.round(result.confidence * 100)}% confianza`);
        } catch {
            setAiMsg('Error al analizar.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDispatch = async (unitId: string) => {
        if (!selectedIncident || !user) return;
        try {
            await assignUnitToIncident(selectedIncident.id, unitId, selectedIncident.assignedUnits);
            await updateUnitStatus(unitId, 'OCUPADO');
            await logEvent(selectedIncident.id, 'UNIDAD_ASIGNADA', `Unidad despachada: ${unitId}`, user.uid);
            if (selectedIncident.status === 'NUEVO') {
                await updateIncidentStatus(selectedIncident.id, 'DESPACHADO');
            }
        } catch (err) {
            console.error('Error al despachar:', err);
        }
    };

    const formatTime = (ts: any) => {
        if (!ts?.toDate) return '—';
        return ts.toDate().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    };

    const priorityClass = (p: IncidentPriority) => ({ Baja: 'pri-low', Media: 'pri-med', Alta: 'pri-high', Crítica: 'pri-crit' }[p]);
    const statusClass = (s: IncidentStatus) => ({ NUEVO: 'st-new', DESPACHADO: 'st-disp', EN_CURSO: 'st-active', CERRADO: 'st-closed', CANCELADO: 'st-cancel' }[s]);
    const unitStatusClass = (s: UnitStatus) => ({ DISPONIBLE: 'us-avail', OCUPADO: 'us-busy', FUERA_SERVICIO: 'us-off', DESCONECTADO: 'us-disc' }[s]);

    const mapCenter: [number, number] = selectedIncident?.location
        ? [selectedIncident.location.lat, selectedIncident.location.lng]
        : SANTIAGO;

    return (
        <div className="dash">
            {/* ===== HEADER ===== */}
            <header className="dash-header">
                <div className="header-left">
                    <div className="header-emblem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <div className="header-title-block">
                        <h1>Panel de Operador</h1>
                        <div className="sys-online"><span className="pulse-dot" />SISTEMA ONLINE</div>
                    </div>
                    <div className="header-stats">
                        <span className="h-stat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-stat-icon"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                            Santiago: <strong>{clock}</strong>
                        </span>
                        <span className="h-stat">Unidades: <strong>{availableCount}/{units.length}</strong></span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="header-user-info">
                        <span className="user-name">{profile?.displayName || user?.email}</span>
                        <span className="user-role">Operador</span>
                    </div>
                    <a href="/supervisor" className="btn-nav">Vista Supervisor</a>
                    <button onClick={logout} className="btn-logout" title="Cerrar sesión">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </button>
                </div>
            </header>

            {/* ===== BODY ===== */}
            <div className="dash-body">
                {/* LEFT COLUMN */}
                <div className="dash-left">
                    {/* KPIs */}
                    <div className="kpi-row">
                        <div className="kpi-card kpi-red"><div className="kpi-top"><span className="kpi-label">Activos</span></div><span className="kpi-value">{activeCount}</span><div className="kpi-bar kpi-bar-red" /></div>
                        <div className="kpi-card kpi-blue"><div className="kpi-top"><span className="kpi-label">Unidades</span></div><span className="kpi-value">{units.length}</span><div className="kpi-bar kpi-bar-blue" /></div>
                        <div className="kpi-card kpi-amber"><div className="kpi-top"><span className="kpi-label">Desplegadas</span></div><span className="kpi-value">{deployedUnits}</span><div className="kpi-bar kpi-bar-amber" /></div>
                        <div className="kpi-card kpi-green"><div className="kpi-top"><span className="kpi-label">Cerrados hoy</span></div><span className="kpi-value">{closedToday}</span><div className="kpi-bar kpi-bar-green" /></div>
                    </div>

                    {/* New Incident */}
                    <div className="glass-section compact-form-section">
                        <div className="section-bar">
                            <h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sec-icon"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>Nuevo Incidente</h2>
                            <span className="tag-pill">Registro Rápido</span>
                        </div>
                        <div className="ai-desc-row">
                            <textarea
                                className="ai-desc-input"
                                placeholder="Describe el incidente para analizar con IA… Ej: Robo con arma de fuego en almacén"
                                value={formDescription}
                                onChange={e => setFormDescription(e.target.value)}
                                rows={2}
                            />
                            <button type="button" className={`btn-ai ${isAnalyzing ? 'btn-ai-loading' : ''}`} onClick={handleAIAnalyze} disabled={isAnalyzing}>
                                {isAnalyzing ? <><span className="spinner" /> Analizando…</> : '✨ Analizar con IA'}
                            </button>
                        </div>
                        {aiMsg && <div className="ai-msg">{aiMsg}</div>}
                        <form onSubmit={handleCreate} className="compact-form">
                            <div className="cf-field cf-type">
                                <label>Tipo</label>
                                <select value={formType} onChange={e => setFormType(e.target.value as IncidentType)}>
                                    {INCIDENT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="cf-field cf-pri">
                                <label>Prioridad</label>
                                <div className="priority-toggle">
                                    {PRIORITY_OPTIONS.map(p => (
                                        <label key={p} className={`pt-opt ${formPriority === p ? `pt-active pt-${p.toLowerCase().replace('í', 'i')}` : ''}`}>
                                            <input type="radio" name="pri" value={p} checked={formPriority === p} onChange={() => setFormPriority(p)} />
                                            {p}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="cf-field cf-addr">
                                <label>Dirección</label>
                                <input type="text" placeholder="Ej: Av. Providencia 1234" value={formAddress} onChange={e => setFormAddress(e.target.value)} required />
                            </div>
                            <div className="cf-field cf-btn">
                                <button type="submit" disabled={formSubmitting} className="btn-create">
                                    {formSubmitting ? 'Creando…' : 'Crear'}
                                </button>
                            </div>
                        </form>
                        {formMsg && <div className={`cf-msg ${formMsg.ok ? 'cf-ok' : 'cf-err'}`}>{formMsg.text}</div>}
                    </div>

                    {/* Incidents Table */}
                    <div className="glass-section incidents-section">
                        <div className="section-bar">
                            <h2>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sec-icon"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                Incidentes Recientes
                            </h2>
                        </div>
                        <div className="table-wrap">
                            {incLoading && <div className="tbl-loading"><span className="spinner spinner-lg" />Cargando…</div>}
                            {incError && <div className="cf-msg cf-err">{incError}</div>}
                            {!incLoading && !incError && (
                                <table className="inc-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Hora</th><th>Dirección</th><th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {incidents.length === 0 && (
                                            <tr><td colSpan={7} className="empty-row">Sin incidentes registrados</td></tr>
                                        )}
                                        {incidents.map(inc => (
                                            <tr
                                                key={inc.id}
                                                className={`inc-row ${selectedIncident?.id === inc.id ? 'row-selected' : ''}`}
                                                onClick={() => setSelectedIncident(selectedIncident?.id === inc.id ? null : inc)}
                                            >
                                                <td className="cell-id">{inc.id.substring(0, 5).toUpperCase()}</td>
                                                <td className="cell-type">{inc.type}</td>
                                                <td><span className={`badge ${priorityClass(inc.priority)}`}>{inc.priority}</span></td>
                                                <td><span className={`badge ${statusClass(inc.status)}`}>{INCIDENT_STATUS_LABELS[inc.status]}</span></td>
                                                <td className="cell-time">{formatTime(inc.createdAt)}</td>
                                                <td className="cell-addr">{inc.address}</td>
                                                <td className="cell-arrow">›</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="dash-right">
                    {/* Map */}
                    <section className="map-section glass-section">
                        <div className="map-overlay-top">
                            <div className="map-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pin-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                <div>
                                    <h3>Ubicación del Incidente</h3>
                                    <p className="map-sub">Vista en tiempo real</p>
                                </div>
                            </div>
                        </div>
                        <MapContainer center={mapCenter} zoom={14} key={mapCenter.join(',')} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                            {selectedIncident?.location && (
                                <Marker position={[selectedIncident.location.lat, selectedIncident.location.lng]} icon={redPinIcon}>
                                    <Popup><strong>{selectedIncident.type}</strong><br />{selectedIncident.address}</Popup>
                                </Marker>
                            )}
                        </MapContainer>
                        <div className="map-addr-bar">
                            <div>
                                <span className="addr-label">Dirección del Suceso</span>
                                <span className="addr-value">{selectedIncident?.address || 'Seleccione un incidente de la tabla'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Resources */}
                    <section className="resources-section glass-section">
                        <div className="section-bar">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sec-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                Recursos en Terreno
                            </h3>
                            <span className="tag-pill">ONLINE: {units.length}</span>
                        </div>
                        <div className="res-list">
                            {units.length === 0 && <p className="empty-text">No hay unidades registradas</p>}
                            {units.map(unit => (
                                <div key={unit.id} className={`res-card ${unit.status === 'FUERA_SERVICIO' || unit.status === 'DESCONECTADO' ? 'res-dim' : ''}`}>
                                    <div className="res-left">
                                        <div className="res-callsign">{unit.callsign}</div>
                                        <div className="res-info">
                                            <span className="res-name">{unit.type}</span>
                                        </div>
                                    </div>
                                    <div className="res-right">
                                        <span className={`badge ${unitStatusClass(unit.status)}`}>
                                            <span className={`dot ${unit.status === 'DISPONIBLE' ? 'dot-pulse' : ''}`} />
                                            {UNIT_STATUS_LABELS[unit.status]}
                                        </span>
                                        <button
                                            className={`btn-dispatch ${unit.status !== 'DISPONIBLE' ? 'btn-dispatch-disabled' : ''}`}
                                            disabled={unit.status !== 'DISPONIBLE' || !selectedIncident}
                                            onClick={() => handleDispatch(unit.id)}
                                        >
                                            Despachar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
