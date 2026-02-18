// Script para crear un usuario de prueba en Firebase Auth + Firestore
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

const EMAIL = 'operador@cad.cl';
const PASSWORD = 'Cad2026!';

async function main() {
    try {
        console.log('Creando usuario de prueba...');
        const cred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
        const uid = cred.user.uid;
        console.log(`✅ Usuario creado: ${EMAIL} (uid: ${uid})`);

        // Crear perfil en Firestore
        await setDoc(doc(db, 'users', uid), {
            displayName: 'Operador Demo',
            role: 'OPERADOR',
            email: EMAIL,
            enabled: true,
        });
        console.log('✅ Perfil creado en Firestore (colección users)');

        console.log('\n=== CREDENCIALES DE ACCESO ===');
        console.log(`  Correo: ${EMAIL}`);
        console.log(`  Contraseña: ${PASSWORD}`);
        console.log('==============================\n');

        process.exit(0);
    } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
            console.log(`ℹ️  El usuario ${EMAIL} ya existe. Puedes usarlo directamente.`);
            console.log(`\n  Correo: ${EMAIL}`);
            console.log(`  Contraseña: ${PASSWORD}\n`);
            process.exit(0);
        }
        console.error('Error:', err.message);
        process.exit(1);
    }
}

main();
