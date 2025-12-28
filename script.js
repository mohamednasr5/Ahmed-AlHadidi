// إعدادات الأمان - كلمة مرور المسؤول
const ADMIN_PASSWORD = "Ahmed123";

// حالة التطبيق
let currentUser = null;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// تهيئة Firebase والتطبيق
async function initApp() {
    try {
        // استيراد Firebase بشكل ديناميكي
        await loadFirebase();
        
        // التحقق من جلسة مسجل الدخول
        checkAuthState();
        
        // إعداد المستمعين للأحداث
        setupEventListeners();
        
        // إضافة تأثيرات CSS ديناميكية
        addDynamicEffects();
        
    } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        showNotification('خطأ في تحميل النظام', 'error');
    }
}

// تحميل Firebase ديناميكياً
async function loadFirebase() {
    if (typeof firebase === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
        script.type = 'module';
        await loadScript(script);
        
        const authScript = document.createElement('script');
        authScript.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js';
        authScript.type = 'module';
        await loadScript(authScript);
        
        const firestoreScript = document.createElement('script');
        firestoreScript.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js';
        firestoreScript.type = 'module';
        await loadScript(firestoreScript);
    }
}

function loadScript(script) {
    return new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// التحقق من حالة المصادقة
function checkAuthState() {
    const savedLogin = localStorage.getItem('adminLoggedIn');
    if (savedLogin === 'true') {
        showAdminSection();
        loadMembers();
    }
}

// إعداد المستمعين للأحداث
function setupEventListeners() {
    // تسجيل الدخول
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        
        // السماح بالدخول بالزر Enter
        const adminPassInput = document.getElementById('adminPass');
        if (adminPassInput) {
            adminPassInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleLogin();
            });
        }
    }
    
    // إضافة عضو
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', addMember);
    }
    
    // تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // نسخ الروابط
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-link')) {
            copyToClipboard(e.target.dataset.link);
        }
    });
}

// معالجة تسجيل الدخول
function handleLogin() {
    const password = document.getElementById('adminPass').value.trim();
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginStatus = document.getElementById('loginStatus');
    
    if (!password) {
        showError(loginStatus, 'الرجاء إدخال كلمة المرور');
        return;
    }
    
    // إظهار حالة التحميل
    loginBtn.classList.add('loading');
    loginBtnText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
    
    // محاكاة تأخير للواقعية
    setTimeout(() => {
        if (password === ADMIN_PASSWORD) {
            // حفظ حالة تسجيل الدخول
            localStorage.setItem('adminLoggedIn', 'true');
            
            // إظهار قسم الإدارة
            showAdminSection();
            
            // تحميل الأعضاء
            loadMembers();
            
            // إظهار رسالة نجاح
            showNotification('تم تسجيل الدخول بنجاح', 'success');
            
            // إخفاء قسم تسجيل الدخول
            document.getElementById('login-section').style.display = 'none';
            
        } else {
            showError(loginStatus, 'كلمة المرور غير صحيحة');
            
            // تأثير اهتزاز
            loginBtn.style.animation = 'shake 0.5s';
            setTimeout(() => loginBtn.style.animation = '', 500);
        }
        
        // إعادة حالة الزر
        loginBtn.classList.remove('loading');
        loginBtnText.innerHTML = '<i class="fas fa-sign-in-alt"></i> دخول';
        
        // مسح كلمة المرور
        document.getElementById('adminPass').value = '';
        
    }, 1000);
}

// إظهار قسم الإدارة
function showAdminSection() {
    const adminSection = document.getElementById('admin-section');
    if (adminSection) {
        adminSection.style.display = 'block';
    }
}

// إضافة عضو جديد
async function addMember() {
    const name = document.getElementById('name').value.trim();
    const nationalId = document.getElementById('nationalId').value.trim();
    const address = document.getElementById('address').value.trim();
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    
    // التحقق من المدخلات
    if (!name || !nationalId) {
        showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // التحقق من صحة الرقم القومي
    if (!/^\d{14}$/.test(nationalId)) {
        showNotification('الرجاء إدخال رقم قومي صحيح (14 رقم)', 'error');
        return;
    }
    
    try {
        // إظهار حالة التحميل
        btnText.classList.add('hidden');
        btnSpinner.classList.remove('hidden');
        
        // إنشاء معرف فريد للعضو
        const memberId = generateMemberId();
        
        // بيانات العضو
        const memberData = {
            name,
            nationalId,
            address: address || 'غير محدد',
            timestamp: new Date().toISOString(),
            verificationLink: `${window.location.origin}/verify.html?id=${memberId}`
        };
        
        // حفظ في Firebase
        await db.collection('members').doc(memberId).set(memberData);
        
        // إظهار رسالة النجاح
        showNotification('تم إضافة العضو بنجاح', 'success');
        
        // تحديث قائمة الأعضاء
        await loadMembers();
        
        // مسح الحقول
        document.getElementById('name').value = '';
        document.getElementById('nationalId').value = '';
        document.getElementById('address').value = '';
        
        // إظهار الرابط
        const linkElement = document.createElement('div');
        linkElement.className = 'link-display';
        linkElement.innerHTML = `
            <i class="fas fa-link"></i> رابط التحقق:
            <br>
            ${memberData.verificationLink}
            <button class="copy-link btn btn-success" style="margin-top: 10px; padding: 8px 15px; font-size: 14px;" 
                    data-link="${memberData.verificationLink}">
                <i class="fas fa-copy"></i> نسخ الرابط
            </button>
        `;
        
        // إضافة الرابط مؤقتاً
        document.getElementById('addBtn').parentNode.insertBefore(linkElement, document.getElementById('addBtn').nextSibling);
        
        // إخفاء الرابط بعد 10 ثواني
        setTimeout(() => {
            if (linkElement.parentNode) {
                linkElement.remove();
            }
        }, 10000);
        
    } catch (error) {
        console.error('خطأ في إضافة العضو:', error);
        showNotification('حدث خطأ في حفظ البيانات', 'error');
    } finally {
        // إعادة حالة الزر
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
    }
}

// توليد معرف فريد للعضو
function generateMemberId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `MEMBER_${timestamp}_${random}`.toUpperCase();
}

// تحميل قائمة الأعضاء
async function loadMembers() {
    const membersList = document.getElementById('membersList');
    if (!membersList) return;
    
    try {
        membersList.innerHTML = '<p style="text-align:center;color:#666;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل البيانات...</p>';
        
        // جلب البيانات من Firebase
        const snapshot = await db.collection('members')
            .orderBy('timestamp', 'desc')
            .get();
        
        if (snapshot.empty) {
            membersList.innerHTML = '<p style="text-align:center;color:#666;">لا توجد أعضاء مسجلين بعد</p>';
            return;
        }
        
        // بناء قائمة الأعضاء
        let membersHTML = '';
        snapshot.forEach(doc => {
            const member = doc.data();
            membersHTML += `
                <div class="member-card">
                    <div class="member-info">
                        <h4><i class="fas fa-user"></i> ${member.name}</h4>
                        <p><i class="fas fa-id-card"></i> الرقم القومي: ${member.nationalId}</p>
                        <p><i class="fas fa-map-marker-alt"></i> العنوان: ${member.address}</p>
                        <small style="color:#888;"><i class="fas fa-clock"></i> ${formatDate(member.timestamp)}</small>
                    </div>
                    <div class="member-actions">
                        <button class="copy-link btn btn-success" 
                                data-link="${member.verificationLink}"
                                style="padding: 8px 15px; font-size: 14px;">
                            <i class="fas fa-copy"></i> نسخ الرابط
                        </button>
                    </div>
                </div>
            `;
        });
        
        membersList.innerHTML = membersHTML;
        
    } catch (error) {
        console.error('خطأ في تحميل الأعضاء:', error);
        membersList.innerHTML = '<p style="text-align:center;color:#b21f1f;">حدث خطأ في تحميل البيانات</p>';
    }
}

// نسخ النص للحافظة
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('تم نسخ الرابط بنجاح', 'success');
    }).catch(err => {
        console.error('خطأ في النسخ:', err);
        showNotification('خطأ في نسخ الرابط', 'error');
    });
}

// تسجيل الخروج
function handleLogout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('adminLoggedIn');
        document.getElementById('admin-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('loginStatus').innerHTML = '';
        showNotification('تم تسجيل الخروج بنجاح', 'success');
    }
}

// إظهار الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    notification.classList.remove('hidden');
    
    // إخفاء الإشعار تلقائياً بعد 5 ثواني
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// إظهار الأخطاء
function showError(element, message) {
    if (!element) return;
    
    element.className = 'error';
    element.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    element.classList.remove('hidden');
}

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// إضافة تأثيرات ديناميكية
function addDynamicEffects() {
    // إضافة تأثيرات للحقول
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
    
    // إضافة تأثيرات للأزرار
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'scale(0.98)';
        });
        
        btn.addEventListener('mouseup', () => {
            btn.style.transform = '';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// التأكد من أن Firebase متاح
function waitForFirebase() {
    return new Promise((resolve) => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            resolve();
        } else {
            setTimeout(() => waitForFirebase().then(resolve), 100);
        }
    });
}
