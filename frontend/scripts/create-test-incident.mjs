// Script para crear incidentes de prueba asignados a P-21
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA7i7jCWiq4ID8yjrovZPxMgCeTCsCvj8I",
    authDomain: "cad-seguridad-municipal.firebaseapp.com",
    projectId: "cad-seguridad-municipal",
    storageBucket: "cad-seguridad-municipal.firebasestorage.app",
    messagingSenderId: "715449470887",
    appId: "1:715449470887:web:d16f199f05266f75607082",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function loginAdmin() {
    console.log('Iniciando sesión como admin...');
    await signInWithEmailAndPassword(auth, 'admin@cad.cl', 'Cad2025!');
    console.log('✅ Admin logueado');
}

// 1. Asegurar que existe la unidad P-21
async function ensureUnitP21() {

    console.log('Verificando unidad P-21...');
    const q = query(collection(db, 'units'), where('callsign', '==', 'P-21'));
    const snapshot = await getDocs(q);

    let unitId;
    if (snapshot.empty) {
        console.log('  ⚠️ Unidad P-21 no existe. Creándola...');
        const docRef = await addDoc(collection(db, 'units'), {
            callsign: 'P-21',
            type: 'Patrulla',
            status: 'DISPONIBLE',
            currentLocation: { lat: -33.4372, lng: -70.6506 }, // Plaza de Armas
            updatedAt: serverTimestamp()
        });
        unitId = docRef.id;
        console.log(`  ✅ Unidad P-21 creada (ID: ${unitId})`);
    } else {
        unitId = snapshot.docs[0].id;
        console.log(`  ✅ Unidad P-21 encontrada (ID: ${unitId})`);
    }
    return unitId;
}

// 2. Crear incidente
async function createIncident(unitId) {
    console.log('Creando incidente de prueba...');
    const incidentData = {
        type: 'Robo en lugar habitado',
        priority: 'Alta',
        status: 'DESPACHADO', // Para que el patrullero lo vea y pueda aceptar
        address: 'Av. Providencia 1234',
        description: 'Sujetos ingresando a domicilio. Vecinos reportan ruidos.',
        location: { lat: -33.4262, lng: -70.6094 }, // Providencia
        callerName: 'Vecino Anónimo',
        callerPhone: '+56912345678',
        assignedUnits: [unitId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'incidents'), incidentData);
    console.log(`  ✅ Incidente creado y asignado a P-21 (ID: ${docRef.id})`);
}

async function main() {
    try {
        await loginAdmin();
        const unitId = await ensureUnitP21();
        await createIncident(unitId);
        console.log('\n¡Listo! Ahora inicia sesión como patrullero@cad.cl para ver el incidente.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

main();
