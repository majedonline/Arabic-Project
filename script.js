document.addEventListener('DOMContentLoaded', () => {
    const inputSection = document.getElementById('input-section');
    const previewSection = document.getElementById('preview-section');
    const previewContent = document.getElementById('previewContent');
    const previewBtn = document.getElementById('previewBtn');
    const backToInputBtn = document.getElementById('backToInputBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportWordBtn = document.getElementById('exportWordBtn');

    // Input fields
    const contestNameInput = document.getElementById('contestName');
    const titleInput = document.getElementById('titleInput');
    const textInput = document.getElementById('textInput');
    const authorSourceInput = document.getElementById('authorSourceInput');
    const vocabularyInput = document.getElementById('vocabularyInput');
    const dateInput = document.getElementById('dateInput');
    const schoolNameInput = document.getElementById('schoolNameInput');
    const teacherNameInput = document.getElementById('teacherNameInput');
    const subjectInput = document.getElementById('subjectInput');
    const durationInput = document.getElementById('durationInput');
    const scoreInput = document.getElementById('scoreInput');
    const questionsContainer = document.getElementById('questionsContainer');
    const addQuestionBtn = document.getElementById('addQuestionBtn');

    // Save/Load Contest
    const saveContestBtn = document.getElementById('saveContestBtn');
    const loadContestSelect = document.getElementById('loadContestSelect');
    const loadContestBtn = document.getElementById('loadContestBtn');

    let questionCount = 0;

    // Helper to format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ar-EG', options); // Or 'ar-SA' for Saudi Arabia
    };

    // --- Save/Load Functionality ---
    const saveContest = () => {
        const contestName = contestNameInput.value.trim();
        if (!contestName) {
            alert('الرجاء إدخال اسم للمسابقة لحفظها.');
            return;
        }

        const questionsData = [];
        document.querySelectorAll('.question-block').forEach((block, index) => {
            const questionText = block.querySelector('textarea[name="questionText"]').value;
            const questionType = block.querySelector('select[name="questionType"]').value;
            const questionScore = block.querySelector('input[name="questionScore"]').value;
            const options = [];
            if (questionType === 'multiple-choice') {
                block.querySelectorAll('.option-input').forEach(input => {
                    options.push(input.value);
                });
            }
            questionsData.push({ text: questionText, type: questionType, score: questionScore, options: options });
        });

        const contestData = {
            title: titleInput.value,
            text: textInput.value,
            authorSource: authorSourceInput.value,
            vocabulary: vocabularyInput.value,
            date: dateInput.value,
            schoolName: schoolNameInput.value,
            teacherName: teacherNameInput.value,
            subject: subjectInput.value,
            duration: durationInput.value,
            score: scoreInput.value,
            questions: questionsData
        };

        try {
            localStorage.setItem(`contest_${contestName}`, JSON.stringify(contestData));
            alert(`تم حفظ المسابقة "${contestName}" بنجاح!`);
            loadSavedContests(); // Refresh the select dropdown
        } catch (e) {
            console.error('Failed to save contest:', e);
            alert('حدث خطأ أثناء حفظ المسابقة.');
        }
    };

    const loadSavedContests = () => {
        loadContestSelect.innerHTML = '<option value="">استعادة مسابقة محفوظة</option>';
        let hasSavedContests = false;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('contest_')) {
                const name = key.substring('contest_'.length);
                const option = document.createElement('option');
                option.value = key;
                option.textContent = name;
                loadContestSelect.appendChild(option);
                hasSavedContests = true;
            }
        }
        loadContestBtn.disabled = !hasSavedContests;
    };

    const loadContest = () => {
        const selectedKey = loadContestSelect.value;
        if (!selectedKey) return;

        try {
            const contestData = JSON.parse(localStorage.getItem(selectedKey));
            if (contestData) {
                // Populate input fields
                contestNameInput.value = selectedKey.substring('contest_'.length); // Set contest name field
                titleInput.value = contestData.title || '';
                textInput.value = contestData.text || '';
                authorSourceInput.value = contestData.authorSource || '';
                vocabularyInput.value = contestData.vocabulary || '';
                dateInput.value = contestData.date || '';
                schoolNameInput.value = contestData.schoolName || '';
                teacherNameInput.value = contestData.teacherName || '';
                subjectInput.value = contestData.subject || '';
                durationInput.value = contestData.duration || '';
                scoreInput.value = contestData.score || '';

                // Clear existing questions
                questionsContainer.innerHTML = '';
                questionCount = 0;

                // Add saved questions
                if (contestData.questions && Array.isArray(contestData.questions)) {
                    contestData.questions.forEach(q => {
                        addQuestion(q.text, q.type, q.score, q.options);
                    });
                }
                alert(`تم استعادة المسابقة "${selectedKey.substring('contest_'.length)}"`);
            }
        } catch (e) {
            console.error('Failed to load contest:', e);
            alert('حدث خطأ أثناء استعادة المسابقة.');
        }
    };

    saveContestBtn.addEventListener('click', saveContest);
    loadContestSelect.addEventListener('change', () => {
        loadContestBtn.disabled = !loadContestSelect.value;
    });
    loadContestBtn.addEventListener('click', loadContest);

    // Initial load of saved contests
    loadSavedContests();

    // --- Question Management ---
    const addQuestion = (qText = '', qType = 'text', qScore = '', qOptions = []) => {
        questionCount++;
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.dataset.questionId = questionCount;

        questionBlock.innerHTML = `
            <div class="form-group">
                <label for="questionText_${questionCount}">السؤال ${questionCount}:</label>
                <textarea id="questionText_${questionCount}" name="questionText" rows="3" placeholder="أدخل نص السؤال هنا">${qText}</textarea>
            </div>
            <div class="form-group">
                <label for="questionType_${questionCount}">نوع السؤال:</label>
                <select id="questionType_${questionCount}" name="questionType" class="question-type-select">
                    <option value="text" ${qType === 'text' ? 'selected' : ''}>نصي</option>
                    <option value="multiple-choice" ${qType === 'multiple-choice' ? 'selected' : ''}>اختيار من متعدد</option>
                    <option value="true-false" ${qType === 'true-false' ? 'selected' : ''}>صح/خطأ</option>
                </select>
                <label for="questionScore_${questionCount}" style="display:inline-block; width:auto; margin-right: 5px;">الدرجة:</label>
                <input type="number" id="questionScore_${questionCount}" name="questionScore" value="${qScore}" style="width: 80px; display:inline-block;">
                <button type="button" class="remove-question-btn">حذف السؤال</button>
            </div>
            <div class="options-container" style="${qType === 'multiple-choice' ? '' : 'display:none;'}">
                <label>الخيارات:</label>
                <div class="options-list">
                    </div>
                <button type="button" class="add-option-btn">إضافة خيار</button>
            </div>
        `;

        const typeSelect = questionBlock.querySelector(`select[name="questionType"]`);
        const optionsContainer = questionBlock.querySelector('.options-container');
        const optionsList = questionBlock.querySelector('.options-list');
        const addOptionButton = questionBlock.querySelector('.add-option-btn');
        const removeQuestionButton = questionBlock.querySelector('.remove-question-btn');

        // Add pre-existing options for multiple choice
        if (qType === 'multiple-choice' && qOptions.length > 0) {
            qOptions.forEach(optionText => {
                addOption(optionsList, optionText);
            });
        } else if (qType === 'multiple-choice' && qOptions.length === 0) {
            // Add default empty options if no options are provided for a new MC question
            addOption(optionsList);
            addOption(optionsList);
        }

        typeSelect.addEventListener('change', () => {
            if (typeSelect.value === 'multiple-choice') {
                optionsContainer.style.display = 'block';
                if (optionsList.children.length === 0) {
                    addOption(optionsList);
                    addOption(optionsList);
                }
            } else {
                optionsContainer.style.display = 'none';
            }
        });

        addOptionButton.addEventListener('click', () => addOption(optionsList));
        removeQuestionButton.addEventListener('click', () => questionBlock.remove());

        questionsContainer.appendChild(questionBlock);
    };

    const addOption = (optionsList, optionText = '') => {
        const optionGroup = document.createElement('div');
        optionGroup.className = 'option-input-group';
        optionGroup.innerHTML = `
            <input type="text" class="option-input" placeholder="أدخل الخيار هنا" value="${optionText}">
            <button type="button" class="remove-option-btn">حذف</button>
        `;
        optionGroup.querySelector('.remove-option-btn').addEventListener('click', () => optionGroup.remove());
        optionsList.appendChild(optionGroup);
    };

    addQuestionBtn.addEventListener('click', () => addQuestion());

    // --- Preview Functionality ---
    previewBtn.addEventListener('click', () => {
        generatePreview();
        inputSection.classList.add('hidden');
        previewSection.classList.remove('hidden');
    });

    backToInputBtn.addEventListener('click', () => {
        previewSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
    });

    const generatePreview = () => {
        let contentHtml = '';

        // Contest Info
        const date = formatDate(dateInput.value);
        const schoolName = schoolNameInput.value;
        const teacherName = teacherNameInput.value;
        const subject = subjectInput.value;
        const duration = durationInput.value;
        const score = scoreInput.value;

        if (date || schoolName || teacherName || subject || duration || score) {
            contentHtml += `
                <div class="contest-details">
                    ${date ? `<div><span>التاريخ:</span><span>${date}</span></div>` : ''}
                    ${schoolName ? `<div><span>اسم المدرسة:</span><span>${schoolName}</span></div>` : ''}
                    ${teacherName ? `<div><span>اسم المعلم:</span><span>${teacherName}</span></div>` : ''}
                    ${subject ? `<div><span>المادة:</span><span>${subject}</span></div>` : ''}
                    ${duration ? `<div><span>المدة:</span><span>${duration}</span></div>` : ''}
                    ${score ? `<div><span>العلامة:</span><span>${score}</span></div>` : ''}
                </div>
            `;
        }

        // Title
        const title = titleInput.value.trim();
        if (title) {
            contentHtml += `<h2>${title}</h2>`;
        }

        // Text Section
        const textContent = textInput.value.trim();
        if (textContent) {
            const paragraphs = textContent.split('\n').filter(p => p.trim() !== '');
            if (paragraphs.length > 0) {
                contentHtml += `<div class="text-section"><ol>`;
                paragraphs.forEach(p => {
                    contentHtml += `<li>${p.trim()}</li>`;
                });
                contentHtml += `</ol></div>`;
            }
        }

        // Author and Source
        const authorSource = authorSourceInput.value.trim();
        if (authorSource) {
            contentHtml += `<p class="author-source">${authorSource}</p>`;
        }

        // Vocabulary/Footnotes
        const vocabularyContent = vocabularyInput.value.trim();
        if (vocabularyContent) {
            const vocabPairs = vocabularyContent.split('\n').filter(line => line.includes(':')).map(line => {
                const parts = line.split(':');
                return { term: parts[0].trim(), explanation: parts.slice(1).join(':').trim() };
            });

            if (vocabPairs.length > 0) {
                contentHtml += `
                    <div class="vocabulary-section">
                        <h3>شرح المفردات:</h3>
                        <ol>
                            ${vocabPairs.map(v => `<li>${v.term}: ${v.explanation}</li>`).join('')}
                        </ol>
                    </div>
                `;
            }
        }

        // Questions Section
        const questionsHtml = Array.from(document.querySelectorAll('.question-block')).map((questionBlock, index) => {
            const qText = questionBlock.querySelector('textarea[name="questionText"]').value;
            const qType = questionBlock.querySelector('select[name="questionType"]').value;
            const qScore = questionBlock.querySelector('input[name="questionScore"]').value;
            let optionsHtml = '';

            if (qType === 'multiple-choice') {
                const options = Array.from(questionBlock.querySelectorAll('.option-input')).map(input => input.value);
                optionsHtml = `
                    <ul class="options">
                        ${options.map(option => `<li>${option}</li>`).join('')}
                    </ul>
                `;
            } else if (qType === 'true-false') {
                optionsHtml = `
                    <ul class="options">
                        <li>( ) صح</li>
                        <li>( ) خطأ</li>
                    </ul>
                `;
            }

            return `
                <div class="question">
                    <p class="question-text">سؤال ${index + 1}${qScore ? ` (${qScore} علامات)` : ''}: ${qText}</p>
                    ${optionsHtml}
                </div>
            `;
        }).join('');

        if (questionsHtml) {
            contentHtml += `
                <div class="questions-section">
                    <h3>الأسئلة:</h3>
                    ${questionsHtml}
                </div>
            `;
        }

        previewContent.innerHTML = contentHtml;
    };

    // --- Export Functionality ---
    exportPdfBtn.addEventListener('click', () => {
        // Ensure preview is generated before export
        generatePreview();

        // Use a timeout to ensure all rendering is complete, especially fonts
        setTimeout(() => {
            const element = previewContent; // Target the content within the preview section
            const opt = {
                margin: [0.5, 0.5, 0.5, 0.5], // Top, Left, Bottom, Right (inches)
                filename: 'مسابقة.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true, useCORS: true },
                jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'avoid-all', 'legacy'] }
            };
            html2pdf().set(opt).from(element).save();
        }, 500); // Small delay to allow fonts and rendering to settle
    });


    exportWordBtn.addEventListener('click', () => {
        // Ensure preview is generated before export
        generatePreview();

        const content = previewContent.innerHTML;
        const filename = 'مسابقة.doc'; // Using .doc for broader compatibility, Word can open HTML based .doc
        const convertedHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>مسابقة</title>
                <style>
                    /* Basic styles for Word compatibility */
                    body {
                        font-family: 'Simplified Arabic', serif;
                        direction: rtl;
                        text-align: right;
                        line-height: 1.6;
                    }
                    .document-content {
                        font-size: 14pt;
                        color: #000;
                        margin: 0 auto;
                        padding: 2cm; /* Word default margins */
                        box-sizing: border-box;
                    }
                    .document-content h2 {
                        text-align: center;
                        font-size: 24pt;
                        margin-bottom: 20pt;
                        line-height: 1.2;
                    }
                    .document-content .contest-details {
                        display: table; /* Use table for better Word layout control */
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30pt;
                        border: 1px solid #ccc;
                    }
                    .document-content .contest-details div {
                        display: table-row;
                    }
                    .document-content .contest-details span {
                        display: table-cell;
                        padding: 5pt;
                        border: 1px solid #eee;
                        font-weight: bold;
                        vertical-align: top;
                    }
                    .document-content .contest-details span:first-child {
                        width: 30%; /* Adjust as needed */
                    }
                    .document-content .text-section {
                        margin-bottom: 30pt;
                        font-size: 14pt;
                        line-height: 1.8;
                    }
                    .document-content .text-section ol {
                        list-style-type: decimal;
                        padding-right: 20pt; /* Indent for numbering */
                        margin-right: 0; /* Override default */
                        margin-left: 0; /* Override default */
                        list-style-position: inside; /* Numbers inside the line flow */
                    }
                    .document-content .text-section ol li {
                        margin-bottom: 10pt;
                        text-align: justify;
                        padding-right: 0;
                    }
                    .document-content .author-source {
                        text-align: left;
                        font-size: 12pt;
                        margin-top: 20pt;
                        font-style: italic;
                    }
                    .document-content .vocabulary-section {
                        margin-top: 30pt;
                        padding-top: 15pt;
                        border-top: 1px dashed #ccc;
                        font-size: 10pt;
                    }
                    .document-content .vocabulary-section h3 {
                        font-size: 14pt;
                        margin-bottom: 10pt;
                        text-align: right;
                    }
                    .document-content .vocabulary-section ol {
                        list-style-type: decimal;
                        padding-right: 20pt; /* Indent for numbering */
                        margin-right: 0; /* Override default */
                        margin-left: 0; /* Override default */
                        list-style-position: inside;
                    }
                    .document-content .vocabulary-section ol li {
                        margin-bottom: 5pt;
                        text-align: right;
                    }
                    .document-content .questions-section {
                        margin-top: 30pt;
                        page-break-before: always;
                    }
                    .document-content .questions-section h3 {
                        font-size: 18pt;
                        margin-bottom: 20pt;
                        text-align: center;
                    }
                    .document-content .question {
                        margin-bottom: 20pt;
                        font-size: 14pt;
                        page-break-inside: avoid; /* Keep questions together */
                    }
                    .document-content .question-text {
                        font-weight: bold;
                        margin-bottom: 10pt;
                    }
                    .document-content .options {
                        list-style: none;
                        padding-right: 0; /* No default padding */
                        margin-right: 20pt; /* Indent options */
                        margin-top: 5pt;
                    }
                    .document-content .options li {
                        margin-bottom: 5pt;
                        text-align: right;
                    }
                </style>
            </head>
            <body>
                <div class='document-content'>
                    ${content}
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([convertedHtml], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Initial addition of a question for better UX
    addQuestion();
});
