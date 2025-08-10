/* ==========================
   الإعدادات العامة
========================== */
document.addEventListener("DOMContentLoaded", () => {

    // عناصر DOM
    const contestNameInput = document.getElementById("contestName");
    const saveContestBtn = document.getElementById("saveContestBtn");
    const loadContestSelect = document.getElementById("loadContestSelect");
    const loadContestBtn = document.getElementById("loadContestBtn");

    const inputSection = document.getElementById("input-section");
    const previewSection = document.getElementById("preview-section");
    const previewContent = document.getElementById("previewContent");

    const addQuestionGroupBtn = document.getElementById("addQuestionGroupBtn");
    const questionGroupsContainer = document.getElementById("questionGroupsContainer");

    const previewBtn = document.getElementById("previewBtn");
    const backToInputBtn = document.getElementById("backToInputBtn");
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    const exportWordBtn = document.getElementById("exportWordBtn");

    /* ==========================
       تحميل قائمة المسابقات المحفوظة
    ========================== */
    function updateSavedContestsList() {
        loadContestSelect.innerHTML = `<option value="">استعادةُ مسابقةٍ محفوظةٍ</option>`;
        const keys = Object.keys(localStorage).filter(key => key.startsWith("contest_"));
        keys.forEach(key => {
            const contestName = key.replace("contest_", "");
            const option = document.createElement("option");
            option.value = contestName;
            option.textContent = contestName;
            loadContestSelect.appendChild(option);
        });
        loadContestBtn.disabled = true;
    }

    updateSavedContestsList();

    /* ==========================
       حفظ المسابقة
    ========================== */
    saveContestBtn.addEventListener("click", () => {
        const contestName = contestNameInput.value.trim();
        if (!contestName) {
            alert("من فضلك أدخل اسم المسابقة أولاً.");
            return;
        }
        const data = getFormData();
        localStorage.setItem(`contest_${contestName}`, JSON.stringify(data));
        alert("تم حفظ المسابقة بنجاح ✅");
        updateSavedContestsList();
    });

    /* ==========================
       تمكين زر الاستعادة عند اختيار مسابقة
    ========================== */
    loadContestSelect.addEventListener("change", () => {
        loadContestBtn.disabled = !loadContestSelect.value;
    });

    /* ==========================
       استعادة المسابقة
    ========================== */
    loadContestBtn.addEventListener("click", () => {
        const selected = loadContestSelect.value;
        if (!selected) return;
        const data = JSON.parse(localStorage.getItem(`contest_${selected}`) || "{}");
        setFormData(data);
        alert("تم استعادة بيانات المسابقة بنجاح 📂");
    });

    /* ==========================
       إضافة قسم أسئلة جديد
    ========================== */
    addQuestionGroupBtn.addEventListener("click", () => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "question-group";
        groupDiv.innerHTML = `
            <h3>قسم أسئلة جديد</h3>
            <textarea placeholder="أدخل الأسئلة هنا" rows="4"></textarea>
            <button class="danger remove-group">حذف القسم</button>
            <hr>
        `;
        questionGroupsContainer.appendChild(groupDiv);

        // حذف القسم
        groupDiv.querySelector(".remove-group").addEventListener("click", () => {
            groupDiv.remove();
        });
    });

    /* ==========================
       المعاينة
    ========================== */
    previewBtn.addEventListener("click", () => {
        const data = getFormData();
        previewContent.innerHTML = generatePreviewHTML(data);
        inputSection.classList.add("hidden");
        previewSection.classList.remove("hidden");
    });

    /* ==========================
       العودة للتعديل
    ========================== */
    backToInputBtn.addEventListener("click", () => {
        previewSection.classList.add("hidden");
        inputSection.classList.remove("hidden");
    });

    /* ==========================
       تصدير PDF
    ========================== */
    exportPdfBtn.addEventListener("click", () => {
        const opt = {
            margin: 10,
            filename: 'المسابقة.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(previewContent).set(opt).save();
    });

    /* ==========================
       تصدير Word
    ========================== */
    exportWordBtn.addEventListener("click", () => {
        const blob = new Blob([previewContent.innerHTML], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'المسابقة.doc';
        link.click();
    });

    /* ==========================
       جلب البيانات من النموذج
    ========================== */
    function getFormData() {
        return {
            contestName: contestNameInput.value,
            schoolName: document.getElementById("schoolNameInput").value,
            teacherName: document.getElementById("teacherNameInput").value,
            subject: document.getElementById("subjectInput").value,
            date: document.getElementById("dateInput").value,
            duration: document.getElementById("durationInput").value,
            score: document.getElementById("scoreInput").value,
            title: document.getElementById("titleInput").value,
            text: document.getElementById("textInput").value,
            authorSource: document.getElementById("authorSourceInput").value,
            vocabulary: document.getElementById("vocabularyInput").value,
            questions: [...document.querySelectorAll(".question-group textarea")].map(t => t.value)
        };
    }

    /* ==========================
       تعيين البيانات في النموذج
    ========================== */
    function setFormData(data) {
        contestNameInput.value = data.contestName || "";
        document.getElementById("schoolNameInput").value = data.schoolName || "";
        document.getElementById("teacherNameInput").value = data.teacherName || "";
        document.getElementById("subjectInput").value = data.subject || "";
        document.getElementById("dateInput").value = data.date || "";
        document.getElementById("durationInput").value = data.duration || "";
        document.getElementById("scoreInput").value = data.score || "";
        document.getElementById("titleInput").value = data.title || "";
        document.getElementById("textInput").value = data.text || "";
        document.getElementById("authorSourceInput").value = data.authorSource || "";
        document.getElementById("vocabularyInput").value = data.vocabulary || "";

        questionGroupsContainer.innerHTML = "";
        (data.questions || []).forEach(q => {
            const groupDiv = document.createElement("div");
            groupDiv.className = "question-group";
            groupDiv.innerHTML = `
                <h3>قسم أسئلة</h3>
                <textarea rows="4">${q}</textarea>
                <button class="danger remove-group">حذف القسم</button>
                <hr>
            `;
            questionGroupsContainer.appendChild(groupDiv);
            groupDiv.querySelector(".remove-group").addEventListener("click", () => {
                groupDiv.remove();
            });
        });
    }

    /* ==========================
       إنشاء HTML للمعاينة
    ========================== */
    function generatePreviewHTML(data) {
        return `
            <h2>${data.title || "بدون عنوان"}</h2>
            <p><strong>المدرسة:</strong> ${data.schoolName || "-"}</p>
            <p><strong>الأستاذ:</strong> ${data.teacherName || "-"}</p>
            <p><strong>المادة:</strong> ${data.subject || "-"}</p>
            <p><strong>التاريخ:</strong> ${data.date || "-"}</p>
            <p><strong>المدة:</strong> ${data.duration || "-"}</p>
            <p><strong>العلامة الكلية:</strong> ${data.score || "-"}</p>
            ${data.text ? `<div><strong>النص:</strong><p>${data.text}</p></div>` : ""}
            ${data.authorSource ? `<p><strong>المصدر/المؤلف:</strong> ${data.authorSource}</p>` : ""}
            ${data.vocabulary ? `<div><strong>شرح المفردات:</strong><pre>${data.vocabulary}</pre></div>` : ""}
            ${data.questions.map((q, i) => `
                <div>
                    <h4>قسم ${i + 1}:</h4>
                    <pre>${q}</pre>
                </div>
            `).join("")}
        `;
    }
});
