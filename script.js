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
    const questionGroupsContainer = document.getElementById('questionGroupsContainer'); // Changed
    const addQuestionGroupBtn = document.getElementById('addQuestionGroupBtn'); // New

    // Save/Load Contest
    const saveContestBtn = document.getElementById('saveContestBtn');
    const loadContestSelect = document.getElementById('loadContestSelect');
    const loadContestBtn = document.getElementById('loadContestBtn');

    let totalQuestionCounter = 0; // To keep track of overall question numbering

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

        const questionGroupsData = [];
        document.querySelectorAll('.question-group-wrapper').forEach(groupWrapper => {
            const groupTitle = groupWrapper.querySelector('.group-title-input').value;
            const questionsInGroup = [];
            groupWrapper.querySelectorAll('.question-block').forEach(block => {
                const questionText = block.querySelector('textarea[name="questionText"]').value;
                const questionType = block.querySelector('select[name="questionType"]').value;
                const questionScore = block.querySelector('input[name="questionScore"]').value;
                const options = [];
                if (questionType === 'multiple-choice') {
                    block.querySelectorAll('.option-input').forEach(input => {
                        options.push(input.value);
                    });
                }
                questionsInGroup.push({ text: questionText, type: questionType, score: questionScore, options: options });
            });
            questionGroupsData.push({ title: groupTitle, questions: questionsInGroup });
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
            questionGroups: questionGroupsData // Storing groups
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

                // Clear existing question groups
                questionGroupsContainer.innerHTML = '';
                totalQuestionCounter = 0;

                // Add saved question groups and their questions
                if (contestData.questionGroups && Array.isArray(contestData.questionGroups)) {
                    contestData.questionGroups.forEach(group => {
                        const newGroupWrapper = addQuestionGroup(group.title);
                        if (group.questions && Array.isArray(group.questions)) {
                            group.questions.forEach(q => {
                                addQuestionToGroup(newGroupWrapper.querySelector('.questions-in-group-container'), q.text, q.type, q.score, q.options);
                            });
                        }
                    });
                }
                // If no groups loaded, add a default empty group
                if (questionGroupsContainer.children.length === 0) {
                    addQuestionGroup();
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

    // --- Question Group Management ---
    const addQuestionGroup = (groupTitle = '') => {
        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'question-group-wrapper';
        groupWrapper.innerHTML = `
            <div class="question-group-header">
                <input type="text" class="group-title-input" placeholder="عنوان قسم الأسئلة (اختياري)" value="${groupTitle}">
                <button type="button" class="remove-group-btn">حذف القسم</button>
            </div>
            <div class="questions-in-group-container">
                </div>
            <button type="button" class="add-question-to-group-btn">إضافة سؤال لهذا القسم</button>
        `;

        const removeGroupBtn = groupWrapper.querySelector('.remove-group-btn');
        removeGroupBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد أنك تريد حذف هذا القسم بكل أسئلته؟')) {
                groupWrapper.remove();
            }
        });

        const addQuestionToGroupBtn = groupWrapper.querySelector('.add-question-to-group-btn');
        const questionsInGroupContainer = groupWrapper.querySelector('.questions-in-group-container');
        addQuestionToGroupBtn.addEventListener('click', () => addQuestionToGroup(questionsInGroupContainer));

        questionGroupsContainer.appendChild(groupWrapper);
        return groupWrapper; // Return the created group element
    };

    addQuestionGroupBtn.addEventListener('click', () => addQuestionGroup());

    // --- Question Management ---
    const addQuestionToGroup = (targetContainer, qText = '', qType = 'text', qScore = '', qOptions = []) => {
        totalQuestionCounter++; // Increment overall question counter
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.dataset.questionId = totalQuestionCounter;

        questionBlock.innerHTML = `
            <div class="form-group">
                <label for="questionText_${totalQuestionCounter}">السؤال ${totalQuestionCounter}:</label>
                <textarea id="questionText_${totalQuestionCounter}" name="questionText" rows="3" placeholder="أدخل نص السؤال هنا">${qText}</textarea>
            </div>
            <div class="form-group">
                <label for="questionType_${totalQuestionCounter}">نوع السؤال:</label>
                <select id="questionType_${totalQuestionCounter}" name="questionType" class="question-type-select">
                    <option value="text" ${qType === 'text' ? 'selected' : ''}>نصي</option>
                    <option value="multiple-choice" ${qType === 'multiple-choice' ? 'selected' : ''}>اختيار من متعدد</option>
                    <option value="true-false" ${qType === 'true-false' ? 'selected' : ''}>صح/خطأ</option>
                </select>
                <label for="questionScore_${totalQuestionCounter}" style="display:inline-block; width:auto; margin-right: 5px;">الدرجة:</label>
                <input type="number" id="questionScore_${totalQuestionCounter}" name="questionScore" value="${qScore}" style="width: 80px; display:inline-block;">
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

        targetContainer.appendChild(questionBlock);
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

        // Questions Section (Updated to handle groups)
        let allQuestionGroupsHtml = '';
        let currentOverallQuestionNumber = 1; // Reset for preview display

        document.querySelectorAll('.question-group-wrapper').forEach(groupWrapper => {
            const groupTitle = groupWrapper.querySelector('.group-title-input').value.trim();
            let questionsInGroupHtml = '';

            groupWrapper.querySelectorAll('.question-block').forEach(questionBlock => {
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

                questionsInGroupHtml += `
                    <div class="question">
                        <p class="question-text">سؤال ${currentOverallQuestionNumber}${qScore ? ` (${qScore} علامات)` : ''}: ${qText}</p>
                        ${optionsHtml}
                    </div>
                `;
                currentOverallQuestionNumber++;
            });

            if (questionsInGroupHtml) {
                allQuestionGroupsHtml += `
                    <div class="question-group-in-doc">
                        ${groupTitle ? `<h4>${groupTitle}:</h4>` : ''}
                        ${questionsInGroupHtml}
                    </div>
                `;
            }
        });

        if (allQuestionGroupsHtml) {
            contentHtml += `
                <div class="questions-main-section">
                    <h3>الأسئلة:</h3>
                    ${allQuestionGroupsHtml}
                </div>
            `;
        }

        previewContent.innerHTML = contentHtml;
    };

    // --- Export Functionality ---
    exportPdfBtn.addEventListener('click', () => {
        generatePreview(); // Ensure content is up-to-date in previewContent

        // Add a temporary class to the body for PDF specific styling adjustments
        document.body.classList.add('exporting-pdf');

        // Small delay to allow fonts and rendering to settle
        setTimeout(() => {
            const element = previewContent;
            const opt = {
                margin: [0.5, 0.5, 0.5, 0.5], // Top, Left, Bottom, Right (inches)
                filename: 'مسابقة.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true, useCORS: true },
                jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' },
                // Use css: true to process media queries for print styles
                pagebreak: { mode: ['css', 'avoid-all', 'legacy'] }
            };

            html2pdf().set(opt).from(element).save().finally(() => {
                // Remove the temporary class after PDF generation is complete
                document.body.classList.remove('exporting-pdf');
            });
        }, 500);
    });

    exportWordBtn.addEventListener('click', () => {
        generatePreview(); // Ensure content is up-to-date in previewContent

        const content = previewContent.innerHTML;
        const filename = 'مسابقة.doc';
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
                        /* Use standard Word margins if padding is an issue */
                        margin: 1in; /* Equivalent to 2.54cm from all sides */
                        box-sizing: border-box;
                    }
                    .document-content h2 {
                        text-align: center;
                        font-size: 24pt;
                        margin-bottom: 20pt;
                        line-height: 1.2;
                    }
                    .document-content .contest-details {
                        border: 1px solid #ccc;
                        padding: 10pt;
                        margin-bottom: 30pt;
                        font-size: 12pt;
                    }
                    .document-content .contest-details div {
                        display: flex; /* Use flex for layout */
                        justify-content: space-between;
                        padding: 2pt 0;
                        margin-bottom: 5pt; /* Add spacing between lines */
                    }
                    .document-content .contest-details span:first-child {
                        font-weight: bold;
                        flex-basis: 40%; /* Adjust width for label */
                    }
                     .document-content .contest-details span:last-child {
                        flex-basis: 55%; /* Adjust width for value */
                        text-align: left; /* Value aligns left for RTL */
                    }


                    .document-content .text-section {
                        margin-bottom: 30pt;
                        font-size: 14pt;
                        line-height: 1.8;
                    }
                    .document-content .text-section ol {
                        list-style-type: decimal;
                        padding-right: 20pt; /* Indent for numbering */
                        margin-right: 0;
                        margin-left: 0;
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
                        padding-right: 20pt;
                        margin-right: 0;
                        margin-left: 0;
                        list-style-position: inside;
                    }
                    .document-content .vocabulary-section ol li {
                        margin-bottom: 5pt;
                        text-align: right;
                    }
                    .document-content .questions-main-section {
                        margin-top: 30pt;
                        page-break-before: always; /* Start questions on a new page */
                    }
                    .document-content .questions-main-section > h3 {
                        font-size: 18pt;
                        margin-bottom: 20pt;
                        text-align: center;
                    }
                    .document-content .question-group-in-doc {
                        margin-bottom: 30pt;
                        page-break-inside: avoid; /* Keep group together if possible */
                    }
                    .document-content .question-group-in-doc > h4 {
                        font-size: 16pt;
                        margin-bottom: 15pt;
                        text-align: right;
                        border-bottom: 1px solid #ccc;
                        padding-bottom: 5pt;
                    }
                    .document-content .question {
                        margin-bottom: 20pt;
                        font-size: 14pt;
                        page-break-inside: avoid; /* Keep individual questions together */
                    }
                    .document-content .question-text {
                        font-weight: bold;
                        margin-bottom: 10pt;
                    }
                    .document-content .options {
                        list-style: none;
                        padding-right: 0;
                        margin-right: 20pt;
                        margin-top: 5pt;
                    }
                    .document-content .options li {
                        margin-bottom: 5pt;
                        text-align: right;
                    }
                    p { margin: 0 0 1em; } /* Default paragraph spacing */
                    ol, ul { margin: 0 0 1em; padding: 0 0 0 40px; } /* Default list spacing/padding */
                    li { margin-bottom: 0.5em; }
                    /* Correct RTL list padding for Word */
                    .document-content ol, .document-content ul {
                        margin-right: 20pt; /* Indent from right for Arabic lists */
                        padding-right: 0;
                        margin-left: 0;
                        padding-left: 0;
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

    // Initial setup: Add a default question group with one question
    const defaultGroup = addQuestionGroup();
    addQuestionToGroup(defaultGroup.querySelector('.questions-in-group-container'));
});
