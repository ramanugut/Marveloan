import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDe1eY3KUfuY9LAL9l-NYZmbu7MFqB33Vc',
  authDomain: 'marveloan-d74a9.firebaseapp.com',
  projectId: 'marveloan-d74a9',
  storageBucket: 'marveloan-d74a9.firebasestorage.app',
  messagingSenderId: '558943376658',
  appId: '1:558943376658:web:7a511643e701e202214fcb'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
