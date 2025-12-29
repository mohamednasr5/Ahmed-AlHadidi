// إعدادات الأمان - كلمة مرور المسؤول
const ADMIN_PASSWORD = "Ahmed123";

// حالة التطبيق
let currentUser = null;
let database = null;

// انتظار تحميل DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM محمّل');
    initApp();
});

// تهيئة التطبيق
async function initApp() {
    try {
        console.log('🚀 بدء تهيئة التطبيق...');
        
        // انتظار تحميل Firebase
        await waitForFirebase();
        
        // التحقق من جلسة مسجل الدخول
        checkAuthState();
        
        // إعداد المستمعين للأحداث
        setupEventListeners();
        
        console.log('✅ تم تهيئة التطبيق بنجاح');
    } catch (error) {
        console.error('❌ خطأ في تهيئة التطبيق:', error);
        showNotification('خطأ في تحميل النظام', 'error');
    }
}

// انتظار تحميل Firebase
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkFirebase = setInterval(() => {
            attempts++;
            
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0 && window.database) {
                clearInterval(checkFirebase);
                database = window.database;
                console.log('✅ Firebase Realtime Database جاهز');
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkFirebase);
                reject(new Error('فشل تحميل Firebase'));
            }
        }, 100);
    });
}

// التحقق من حالة المصادقة
function checkAuthState() {
    const savedLogin = localStorage.getItem('adminLoggedIn');
    if (savedLogin === 'true') {
        console.log('👤 المستخدم مسجل دخول');
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
    }

    // السماح بالدخول بالزر Enter
    const adminPassInput = document.getElementById('adminPass');
    if (adminPassInput) {
        adminPassInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    // إضافة عضو
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addMember();
        });
    }

    // تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // نسخ الروابط
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-link')) {
            e.preventDefault();
            copyToClipboard(e.target.dataset.link);
        }
    });
}

// معالجة تسجيل الدخول
function handleLogin(e) {
    if (e) e.preventDefault();
    
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
    loginBtn.disabled = true;
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
            const loginSection = document.getElementById('login-section');
            if (loginSection) {
                loginSection.style.display = 'none';
            }
        } else {
            showError(loginStatus, 'كلمة المرور غير صحيحة');
            
            // تأثير اهتزاز
            loginBtn.style.animation = 'shake 0.5s';
            setTimeout(() => loginBtn.style.animation = '', 500);
        }

        // إعادة حالة الزر
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
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
    const addBtn = document.getElementById('addBtn');

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

    // التحقق من التكرار
    try {
        const membersRef = database.ref('members');
        const snapshot = await membersRef.orderByChild('nationalId').equalTo(nationalId).once('value');
        
        if (snapshot.exists()) {
            showNotification('هذا الرقم القومي مسجل بالفعل', 'error');
            return;
        }
    } catch (error) {
        console.error('خطأ في التحقق من التكرار:', error);
    }

    try {
        // إظهار حالة التحميل
        btnText.classList.add('hidden');
        btnSpinner.classList.remove('hidden');
        addBtn.disabled = true;

        // إنشاء معرف فريد للعضو
        const memberId = generateMemberId();

        // بيانات العضو
        const memberData = {
            name,
            nationalId,
            address: address || 'غير محدد',
            timestamp: new Date().toISOString(),
            verificationLink: `${window.location.origin}${window.location.pathname.replace(/\/[^\/]*$/, '')}/verify.html?id=${memberId}`,
            addedBy: 'admin',
            status: 'active'
        };

        // حفظ في Realtime Database
        await database.ref('members/' + memberId).set(memberData);

        // إظهار رسالة النجاح
        showNotification('تم إضافة العضو بنجاح ✓', 'success');

        // تحديث قائمة الأعضاء
        await loadMembers();

        // مسح الحقول
        document.getElementById('name').value = '';
        document.getElementById('nationalId').value = '';
        document.getElementById('address').value = '';

        // إظهار الرابط
        showVerificationLink(memberData.verificationLink);

    } catch (error) {
        console.error('خطأ في إضافة العضو:', error);
        showNotification('حدث خطأ في حفظ البيانات: ' + error.message, 'error');
    } finally {
        // إعادة حالة الزر
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
        addBtn.disabled = false;
    }
}

// إظهار رابط التحقق
function showVerificationLink(link) {
    const linkElement = document.createElement('div');
    linkElement.className = 'link-display';
    linkElement.innerHTML = `
        <i class="fas fa-link"></i> رابط التحقق:
        <div style="margin-top: 8px; background: white; padding: 10px; border-radius: 5px;">
            <a href="${link}" target="_blank" style="color: #27ae60; word-break: break-all; text-decoration: none; font-size: 0.85rem;">
                ${link}
            </a>
        </div>
        <button onclick="copyToClipboard('${link}')" style="margin-top: 10px; padding: 8px 15px; background: var(--accent); color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
            <i class="fas fa-copy"></i> نسخ الرابط
        </button>
    `;
    
    const addBtn = document.getElementById('addBtn');
    addBtn.parentNode.insertBefore(linkElement, addBtn.nextSibling);
    
    // إخفاء الرابط بعد 30 ثانية
    setTimeout(() => {
        if (linkElement.parentNode) {
            linkElement.remove();
        }
    }, 30000);
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
        membersList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p style="margin-top: 15px;">جاري تحميل البيانات...</p>
            </div>
        `;

        // جلب البيانات من Realtime Database
        const snapshot = await database.ref('members').orderByChild('timestamp').once('value');

        if (!snapshot.exists()) {
            membersList.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #999;">
                    <i class="fas fa-users fa-3x" style="opacity: 0.3;"></i>
                    <p style="margin-top: 20px; font-size: 1.1rem;">لا توجد أعضاء مسجلين بعد</p>
                </div>
            `;
            return;
        }

        // تحويل البيانات إلى مصفوفة وترتيبها
        const membersArray = [];
        snapshot.forEach((childSnapshot) => {
            membersArray.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // ترتيب حسب التاريخ (الأحدث أولاً)
        membersArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // بناء قائمة الأعضاء
        let membersHTML = '';
        membersArray.forEach(member => {
            membersHTML += `
                <div class="member-card">
                    <div class="member-info">
                        <h4><i class="fas fa-user"></i> ${member.name}</h4>
                        <p><i class="fas fa-id-card"></i> الرقم القومي: ${member.nationalId}</p>
                        <p><i class="fas fa-map-marker-alt"></i> العنوان: ${member.address}</p>
                        <p style="font-size: 0.85rem; color: #999;">
                            <i class="fas fa-calendar"></i> ${formatDate(member.timestamp)}
                        </p>
                    </div>
                    <div class="member-actions">
                        <button class="btn btn-success copy-link" data-link="${member.verificationLink}" style="width: auto; padding: 10px 20px;">
                            <i class="fas fa-copy"></i> نسخ الرابط
                        </button>
                        <button class="btn btn-danger" onclick="deleteMember('${member.id}')" style="width: auto; padding: 10px 20px;">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
            `;
        });

        membersList.innerHTML = membersHTML;
        
        // إضافة عداد الأعضاء
        const count = membersArray.length;
        const countBadge = document.createElement('div');
        countBadge.style.cssText = 'background: var(--gradient-success); color: white; padding: 10px 20px; border-radius: 10px; text-align: center; margin-bottom: 20px; font-weight: 600;';
        countBadge.innerHTML = `<i class="fas fa-users"></i> إجمالي الأعضاء: ${count}`;
        membersList.insertBefore(countBadge, membersList.firstChild);

    } catch (error) {
        console.error('خطأ في تحميل الأعضاء:', error);
        membersList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #b21f1f;">
                <i class="fas fa-exclamation-triangle fa-2x"></i>
                <p style="margin-top: 15px;">حدث خطأ في تحميل البيانات</p>
                <p style="font-size: 0.9rem; color: #999;">${error.message}</p>
                <button class="btn" onclick="loadMembers()" style="width: auto; margin-top: 15px; padding: 10px 30px;">
                    <i class="fas fa-redo"></i> إعادة المحاولة
                </button>
            </div>
        `;
    }
}

// حذف عضو
async function deleteMember(memberId) {
    if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) {
        return;
    }

    try {
        await database.ref('members/' + memberId).remove();
        showNotification('تم حذف العضو بنجاح', 'success');
        await loadMembers();
    } catch (error) {
        console.error('خطأ في حذف العضو:', error);
        showNotification('حدث خطأ في حذف العضو: ' + error.message, 'error');
    }
}

// نسخ النص للحافظة
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('تم نسخ الرابط بنجاح ✓', 'success');
        }).catch(err => {
            console.error('خطأ في النسخ:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// نسخ احتياطي
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('تم نسخ الرابط بنجاح ✓', 'success');
    } catch (err) {
        console.error('خطأ في النسخ:', err);
        showNotification('خطأ في نسخ الرابط', 'error');
    }
    
    document.body.removeChild(textArea);
}

// تسجيل الخروج
function handleLogout(e) {
    if (e) e.preventDefault();
    
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('adminLoggedIn');
        location.reload();
    }
}

// إظهار الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${icons[type]}"></i>
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
    element.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i> ${message}
    `;
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
