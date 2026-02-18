// Script para crear 3 usuarios de prueba en Firebase Auth + Firestore
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

const USERS = [
    { email: 'operador@cad.cl', password: 'Cad2025!', displayName: 'Operador Demo', role: 'OPERADOR' },
    { email: 'admin@cad.cl', password: 'Cad2025!', displayName: 'Administrador Demo', role: 'ADMIN' },
    { email: 'patrullero@cad.cl', password: 'Cad2025!', displayName: 'Patrullero Demo', role: 'PATRULLERO' },
];

async function createUser({ email, password, displayName, role }) {
    try {
        console.log(`Creando ${role}: ${email}...`);
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        await setDoc(doc(db, 'users', uid), {
            displayName,
            role,
            email,
            enabled: true,
        });

        console.log(`  ✅ ${role} creado (uid: ${uid})`);
        return true;
    } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
            console.log(`  ℹ️  ${email} ya existe — OK`);
            return true;
        }
        console.error(`  ❌ Error creando ${email}:`, err.message);
        return false;
    }
}

async function main() {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   CAD – Crear Usuarios de Prueba (3)    ║');
    console.log('╚══════════════════════════════════════════╝\n');

    // Firebase Auth solo permite un login a la vez,
    // así que debemos sign out entre creaciones
    for (const u of USERS) {
        await createUser(u);
        await auth.signOut();
    }

    console.log('\n═══ CREDENCIALES DE ACCESO ═══');
    console.log('┌──────────────────────────────────────────┐');
    for (const u of USERS) {
        console.log(`│ ${u.role.padEnd(12)} │ ${u.email.padEnd(22)} │`);
    }
    console.log('│ Contraseña común: Cad2025!                │');
    console.log('└──────────────────────────────────────────┘');

    process.exit(0);
}

main();
