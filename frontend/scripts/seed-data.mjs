// Script para poblar Firestore con datos demo (incidentes + unidades)
// Uso: node scripts/seed-data.mjs

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA7i7jCWiq4ID8yjrovZPxMgCeTCsCvj8I",
    authDomain: "cad-seguridad-municipal.firebaseapp.com",
    projectId: "cad-seguridad-municipal",
    storageBucket: "cad-seguridad-municipal.firebasestorage.app",
    messagingSenderId: "715449470887",
    appId: "1:715449470887:web:d16f199f05266f75607082",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =============================================
// DATOS DE INCIDENTES DE EJEMPLO
// =============================================
const sampleIncidents = [
    {
        type: 'Robo en proceso',
        priority: 'Crítica',
        status: 'DESPACHADO',
        description: 'Robo en domicilio con moradores presentes. Vecinos reportan ruidos de forcejeo.',
        address: 'Av. Apoquindo 4500, Las Condes',
        location: { lat: -33.4178, lng: -70.5983 },
        assignedUnits: [],
        createdBy: 'seed-script',
        createdAt: Timestamp.fromDate(new Date(Date.now() - 30 * 60000)),
        updatedAt: Timestamp.fromDate(new Date(Date.now() - 25 * 60000)),
    },
    {
        type: 'Ruidos molestos',
        priority: 'Baja',
        status: 'NUEVO',
        description: 'Fiesta con música a alto volumen en departamento piso 8.',
        address: 'Calle Los Leones 230, Providencia',
        location: { lat: -33.4250, lng: -70.6100 },
        assignedUnits: [],
        createdBy: 'seed-script',
        createdAt: Timestamp.fromDate(new Date(Date.now() - 45 * 60000)),
        updatedAt: Timestamp.fromDate(new Date(Date.now() - 45 * 60000)),
    },
    {
        type: 'Vehículo sospechoso',
        priority: 'Media',
        status: 'EN_CURSO',
        description: 'Vehículo sin patente estacionado frente a colegio hace 3 horas.',
        address: 'Santa Isabel 890, Santiago Centro',
        location: { lat: -33.4520, lng: -70.6440 },
        assignedUnits: [],
        createdBy: 'seed-script',
        createdAt: Timestamp.fromDate(new Date(Date.now() - 90 * 60000)),
        updatedAt: Timestamp.fromDate(new Date(Date.now() - 60 * 60000)),
    },
    {
        type: 'Riña / Pelea callejera',
        priority: 'Alta',
        status: 'CERRADO',
        description: 'Riña entre 4 personas en la vía pública. Patrulla intervino exitosamente.',
        address: 'Bellavista 050, Recoleta',
        location: { lat: -33.4310, lng: -70.6370 },
        assignedUnits: [],
        createdBy: 'seed-script',
        createdAt: Timestamp.fromDate(new Date(Date.now() - 120 * 60000)),
        updatedAt: Timestamp.fromDate(new Date(Date.now() - 100 * 60000)),
    },
    {
        type: 'Robo en proceso',
        priority: 'Crítica',
        status: 'CERRADO',
        description: 'Portonazo frustrado. Sujetos huyeron en vehículo blanco.',
        address: 'Av. Vitacura 5600, Vitacura',
        location: { lat: -33.3980, lng: -70.5870 },
        assignedUnits: [],
        createdBy: 'seed-script',
        createdAt: Timestamp.fromDate(new Date(Date.now() - 180 * 60000)),
        updatedAt: Timestamp.fromDate(new Date(Date.now() - 150 * 60000)),
    },
    {
        type: 'Comercio ambulante',
        priority: 'Baja',
        status: 'NUEVO',
        description: 'Venta ambulante irregular bloqueando acceso peatonal.',
        address: 'Paseo Ahumada 400, Santiago Centro',
        location: { lat: -33.4406, lng: -70.6536 },
        assignedUnits: [],
        createdBy: 'seed-script',
        createdAt: Timestamp.fromDate(new Date(Date.now() - 15 * 60000)),
        updatedAt: Timestamp.fromDate(new Date(Date.now() - 15 * 60000)),
    },
    {
        type: 'Accidente de tránsito',
        priority: 'Alta',
        status: 'DESPACHADO',
        description: 'Colisión múltiple en intersección. Al menos 2 vehículos involucrados.',
        address: 'Av. Providencia con Lyon, Providencia',
        location: { lat: -33.4275, lng: -70.6150 },
        assignedUnits: [],
        createdBy: 'seed-script',
        createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 60000)),
        updatedAt: Timestamp.fromDate(new Date(Date.now() - 8 * 60000)),
    },
];

// =============================================
// DATOS DE UNIDADES DE EJEMPLO
// =============================================
const sampleUnits = [
    {
        callsign: 'P-21',
        type: 'Patrulla',
        status: 'DISPONIBLE',
        location: { lat: -33.4370, lng: -70.6340 },
        assignedIncident: null,
        lastUpdateAt: Timestamp.now(),
    },
    {
        callsign: 'M-05',
        type: 'Moto',
        status: 'OCUPADO',
        location: { lat: -33.4200, lng: -70.6050 },
        assignedIncident: null,
        lastUpdateAt: Timestamp.now(),
    },
    {
        callsign: 'P-14',
        type: 'Patrulla',
        status: 'DISPONIBLE',
        location: { lat: -33.4550, lng: -70.6500 },
        assignedIncident: null,
        lastUpdateAt: Timestamp.now(),
    },
    {
        callsign: 'C-02',
        type: 'Camioneta',
        status: 'FUERA_SERVICIO',
        location: { lat: -33.4480, lng: -70.6600 },
        assignedIncident: null,
        lastUpdateAt: Timestamp.now(),
    },
    {
        callsign: 'P-33',
        type: 'Patrulla',
        status: 'DISPONIBLE',
        location: { lat: -33.4100, lng: -70.5900 },
        assignedIncident: null,
        lastUpdateAt: Timestamp.now(),
    },
    {
        callsign: 'M-12',
        type: 'Moto',
        status: 'OCUPADO',
        location: { lat: -33.4300, lng: -70.6250 },
        assignedIncident: null,
        lastUpdateAt: Timestamp.now(),
    },
];

// =============================================
// EJECUTAR SEED
// =============================================
async function seed() {
    console.log('🌱 Iniciando seed de datos demo...\n');

    // Autenticar primero (reglas Firestore requieren auth)
    console.log('🔐 Autenticando...');
    await signInWithEmailAndPassword(auth, 'operador@cad.cl', 'Cad2026!');
    console.log('  ✅ Autenticación exitosa\n');

    // Crear incidentes
    console.log('📋 Creando incidentes...');
    for (const inc of sampleIncidents) {
        const ref = await addDoc(collection(db, 'incidents'), inc);
        console.log(`  ✅ ${inc.type} (${inc.priority}) → ${ref.id}`);
    }

    // Crear unidades
    console.log('\n🚔 Creando unidades...');
    for (const unit of sampleUnits) {
        const ref = await addDoc(collection(db, 'units'), unit);
        console.log(`  ✅ ${unit.callsign} (${unit.type}, ${unit.status}) → ${ref.id}`);
    }

    console.log(`\n✨ Seed completado: ${sampleIncidents.length} incidentes, ${sampleUnits.length} unidades`);
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
