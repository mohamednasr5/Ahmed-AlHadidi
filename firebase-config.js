// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD1ReoAPI53LweugEUbpb7SnD9iJoEPPcs",
    authDomain: "verify-39eda.firebaseapp.com",
    databaseURL: "https://verify-39eda-default-rtdb.firebaseio.com",
    projectId: "verify-39eda",
    storageBucket: "verify-39eda.firebasestorage.app",
    messagingSenderId: "36549490854",
    appId: "1:36549490854:web:79b4ab27672d54b005dc67"
};

// تهيئة Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    // تصدير كائنات Firebase بشكل عام
    window.database = firebase.database();
    window.auth = firebase.auth();
    
    console.log('✅ Firebase Realtime Database تم تهيئته بنجاح');
} catch (error) {
    console.error('❌ خطأ في تهيئة Firebase:', error);
}
