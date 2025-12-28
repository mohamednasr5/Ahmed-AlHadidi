// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let db;

// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD1ReoAPI53LweugEUbpb7SnD9iJoEPPcs",
    authDomain: "verify-39eda.firebaseapp.com",
    projectId: "verify-39eda",
    storageBucket: "verify-39eda.firebasestorage.app",
    messagingSenderId: "36549490854",
    appId: "1:36549490854:web:79b4ab27672d54b005dc67"
};

try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

// وظيفة تسجيل الدخول
export function handleLogin() {
    const pass = document.getElementById('adminPass').value;
    if(pass === '742018') {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadMembers();
    } else {
        alert('كلمة السر خاطئة');
    }
}

// وظيفة إضافة عضو
export async function handleAddMember() {
    const name = document.getElementById('name').value;
    const nid = document.getElementById('nationalId').value;
    const addr = document.getElementById('address').value;
    
    if(!name || !nid) {
        alert('يرجى ملء الاسم والرقم القومي');
        return;
    }

    toggleBtn(true);
    try {
        await addDoc(collection(db, "members"), {
            name,
            nationalId: nid,
            address: addr,
            timestamp: serverTimestamp()
        });
        showNote('تمت الإضافة بنجاح');
        document.getElementById('name').value = '';
        document.getElementById('nationalId').value = '';
        document.getElementById('address').value = '';
        loadMembers();
    } catch(e) {
        console.error(e);
        alert('خطأ في الحفظ');
    } finally {
        toggleBtn(false);
    }
}

// تحميل الأعضاء
async function loadMembers() {
    const list = document.getElementById('membersList');
    list.innerHTML = 'جاري التحميل...';
    
    try {
        const q = query(collection(db, "members"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        list.innerHTML = '';
        
        snap.forEach((doc) => {
            const data = doc.data();
            const link = `https://mohamednasr5.github.io/Ahmed-Al-Hadidi/verify.html?id=${doc.id}`;
            list.innerHTML += `
                <div class="member-card">
                    <strong>${data.name}</strong><br>
                    <small>الرقم القومي: ${data.nationalId}</small>
                    <span class="link-display">${link}</span>
                </div>
            `;
        });
    } catch(e) {
        console.error(e);
        list.innerHTML = 'خطأ في تحميل البيانات';
    }
}

// التحكم في حالة الزر
function toggleBtn(loading) {
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const addBtn = document.getElementById('addBtn');
    
    if (btnText && btnSpinner && addBtn) {
        btnText.className = loading ? 'hidden' : '';
        btnSpinner.className = loading ? '' : 'hidden';
        addBtn.disabled = loading;
    }
}

// عرض الإشعارات
export function showNote(msg) {
    const n = document.getElementById('notification');
    n.textContent = msg;
    n.classList.remove('hidden');
    setTimeout(() => n.classList.add('hidden'), 3000);
}
