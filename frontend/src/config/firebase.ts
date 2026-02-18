import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA7i7jCWiq4ID8yjrovZPxMgCeTCsCvj8I",
    authDomain: "cad-seguridad-municipal.firebaseapp.com",
    projectId: "cad-seguridad-municipal",
    storageBucket: "cad-seguridad-municipal.firebasestorage.app",
    messagingSenderId: "715449470887",
    appId: "1:715449470887:web:d16f199f05266f75607082",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
