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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
