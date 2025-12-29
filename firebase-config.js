// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD1ReoAPI53LweugEUbpb7SnD9iJoEPPcs",
    authDomain: "verify-39eda.firebaseapp.com",
    projectId: "verify-39eda",
    storageBucket: "verify-39eda.firebasestorage.app",
    messagingSenderId: "36549490854",
    appId: "1:36549490854:web:79b4ab27672d54b005dc67"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// تصدير للاستخدام العام
window.db = db;
window.auth = auth;
window.firebaseModules = {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    where
};

console.log('✅ Firebase v9 تم تهيئته بنجاح');
