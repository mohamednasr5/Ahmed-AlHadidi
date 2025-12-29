// إضافة عضو جديد
async function addMember() {
    const name = document.getElementById('name').value.trim();
    const nationalId = document.getElementById('nationalId').value.trim();
    const address = document.getElementById('address').value.trim();
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const addBtn = document.getElementById('addBtn');

    console.log('🔵 محاولة إضافة عضو...');
    console.log('📝 البيانات:', { name, nationalId, address });

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

    // التحقق من أن database محمّل
    if (!database) {
        console.error('❌ Database غير محمّل');
        showNotification('خطأ: قاعدة البيانات غير متصلة', 'error');
        return;
    }

    // التحقق من التكرار
    try {
        console.log('🔍 التحقق من التكرار...');
        const membersRef = database.ref('members');
        const snapshot = await membersRef.orderByChild('nationalId').equalTo(nationalId).once('value');
        
        if (snapshot.exists()) {
            console.warn('⚠️ الرقم القومي موجود مسبقاً');
            showNotification('هذا الرقم القومي مسجل بالفعل', 'error');
            return;
        }
        console.log('✅ لا يوجد تكرار');
    } catch (error) {
        console.error('❌ خطأ في التحقق من التكرار:', error);
        showNotification('خطأ في التحقق: ' + error.message, 'error');
        return;
    }

    try {
        // إظهار حالة التحميل
        btnText.classList.add('hidden');
        btnSpinner.classList.remove('hidden');
        addBtn.disabled = true;

        // إنشاء معرف فريد للعضو
        const memberId = generateMemberId();
        console.log('🆔 معرف العضو:', memberId);

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

        console.log('💾 محاولة الحفظ في Firebase...');
        console.log('📦 البيانات المرسلة:', memberData);

        // حفظ في Realtime Database
        await database.ref('members/' + memberId).set(memberData);

        console.log('✅ تم الحفظ بنجاح!');

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
        console.error('❌ خطأ في إضافة العضو:', error);
        console.error('📋 تفاصيل الخطأ:', {
            code: error.code,
            message: error.message,
            details: error
        });
        
        // رسائل خطأ مفصلة
        let errorMessage = 'حدث خطأ في حفظ البيانات';
        
        if (error.code === 'PERMISSION_DENIED') {
            errorMessage = 'خطأ: لا توجد صلاحيات للكتابة. تحقق من قواعد Firebase';
        } else if (error.message) {
            errorMessage = `خطأ: ${error.message}`;
        }
        
        showNotification(errorMessage, 'error');
    } finally {
        // إعادة حالة الزر
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
        addBtn.disabled = false;
    }
}
