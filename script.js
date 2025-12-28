// script.js - النسخة المعدلة
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

// جعل db متاحة عالمياً
window.db = null;

// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD1ReoAPI53LweugEUbpb7SnD9iJoEPPcs",
    authDomain: "verify-39eda.firebaseapp.com",
    projectId: "verify-39eda",
    storageBucket: "verify-39eda.firebasestorage.app",
    messagingSenderId: "36549490854",
    appId: "1:36549490854:web:79b4ab27672d54b005dc67"
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    try {
        const app = initializeApp(firebaseConfig);
        window.db = getFirestore(app);
        console.log("✅ Firebase initialized successfully");
        
        // تعيين event listeners بعد تحميل Firebase
        setupEventListeners();
    } catch (error) {
        console.error("❌ Firebase initialization failed:", error);
        showNote('خطأ في الاتصال بقاعدة البيانات');
    }
});

// تعيين event listeners
function setupEventListeners() {
    // زر تسجيل الدخول
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // زر إضافة عضو
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', handleAddMember);
    }
    
    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            location.reload();
        });
    }
    
    // السماح بالضغط على Enter في حقل كلمة السر
    const adminPass = document.getElementById('adminPass');
    if (adminPass) {
        adminPass.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
}

// وظيفة تسجيل الدخول - جعلها متاحة عالمياً
window.handleLogin = function() {
    const pass = document.getElementById('adminPass').value;
    if(pass === '742018') {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadMembers();
    } else {
        alert('كلمة السر خاطئة');
    }
};

// وظيفة إضافة عضو - جعلها متاحة عالمياً
window.handleAddMember = async function() {
    const name = document.getElementById('name').value;
    const nid = document.getElementById('nationalId').value;
    const addr = document.getElementById('address').value;
    
    if(!name || !nid) {
        alert('يرجى ملء الاسم والرقم القومي');
        return;
    }

    toggleBtn(true);
    try {
        await addDoc(collection(window.db, "members"), {
            name,
            nationalId: nid,
            address: addr,
            timestamp: serverTimestamp()
        });
        showNote('✅ تمت الإضافة بنجاح');
        document.getElementById('name').value = '';
        document.getElementById('nationalId').value = '';
        document.getElementById('address').value = '';
        loadMembers();
    } catch(e) {
        console.error(e);
        alert('❌ خطأ في الحفظ: ' + e.message);
    } finally {
        toggleBtn(false);
    }
};

// تحميل الأعضاء
async function loadMembers() {
    const list = document.getElementById('membersList');
    if (!list) return;
    
    list.innerHTML = 'جاري التحميل...';
    
    try {
        const q = query(collection(window.db, "members"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        list.innerHTML = '';
        
        if (snap.empty) {
            list.innerHTML = '<p style="text-align:center;color:#666;">لا توجد بيانات</p>';
            return;
        }
        
        snap.forEach((doc) => {
            const data = doc.data();
            const link = `https://mohamednasr5.github.io/Ahmed-Al-Hadidi/verify.html?id=${doc.id}`;
            list.innerHTML += `
                <div class="member-card">
                    <strong>${data.name}</strong><br>
                    <small>الرقم القومي: ${data.nationalId}</small><br>
                    ${data.address ? `<small>العنوان: ${data.address}</small><br>` : ''}
                    <span class="link-display">${link}</span>
                </div>
            `;
        });
    } catch(e) {
        console.error(e);
        list.innerHTML = '<p style="color:red;">❌ خطأ في تحميل البيانات</p>';
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
window.showNote = function(msg) {
    const n = document.getElementById('notification');
    if (!n) return;
    
    n.textContent = msg;
    n.classList.remove('hidden');
    setTimeout(() => n.classList.add('hidden'), 3000);
};

// لجعل الوظائف متاحة للأزرار القديمة
window.handleLogin = window.handleLogin;
window.handleAddMember = window.handleAddMember;
