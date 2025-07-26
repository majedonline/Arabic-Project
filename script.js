document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputSection = document.getElementById('input-section');
    const previewSection = document.getElementById('preview-section');
    const previewContent = document.getElementById('previewContent');

    const previewBtn = document.getElementById('previewBtn');
    const backToInputBtn = document.getElementById('backToInputBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportWordBtn = document.getElementById('exportWordBtn');

    const addQuestionGroupBtn = document.getElementById('addQuestionGroupBtn');
    const questionGroupsContainer = document.getElementById('questionGroupsContainer');

    // Input fields
    const contestNameInput = document.getElementById('contestName');
    const schoolNameInput = document.getElementById('schoolNameInput');
    const teacherNameInput = document.getElementById('teacherNameInput');
    const subjectInput = document.getElementById('subjectInput');
    const dateInput = document.getElementById('dateInput');
    const durationInput = document.getElementById('durationInput');
    const scoreInput = document.getElementById('scoreInput');
    const titleInput = document.getElementById('titleInput');
    const textInput = document.getElementById('textInput');
    const authorSourceInput = document.getElementById('authorSourceInput');
    const vocabularyInput = document.getElementById('vocabularyInput');

    // Save/Load Contest Elements
    const saveContestBtn = document.getElementById('saveContestBtn');
    const loadContestSelect = document.getElementById('loadContestSelect');
    const loadContestBtn = document.getElementById('loadContestBtn');

    let questionGroupCounter = 0; // To keep track of question group IDs
    let questionCounter = 0; // To keep track of question IDs within groups

    // --- Core Functions ---

    // Function to add a new question group
    function addQuestionGroup(groupTitle = '') {
        questionGroupCounter++;
        const groupId = `group-${questionGroupCounter}`;
        const groupWrapper = document.createElement('div');
        groupWrapper.classList.add('question-group-wrapper');
        groupWrapper.setAttribute('data-group-id', groupId); // Store group ID

        groupWrapper.innerHTML = `
            <div class="question-group-header">
                <input type="text" class="group-title-input" placeholder="عنوان قسم الأسئلة (اختياري)" value="${groupTitle}">
                <button type="button" class="remove-group-btn">حذفُ القسمِ</button>
            </div>
            <div class="questions-in-group-container">
                </div>
            <button type="button" class="add-question-to-group-btn">إضافةُ سؤالٍ لهذا القسمِ</button>
        `;

        questionGroupsContainer.appendChild(groupWrapper);

        // Add event listeners for new elements
        groupWrapper.querySelector('.remove-group-btn').addEventListener('click', () => {
            groupWrapper.remove();
            updateQuestionNumbers();
        });
        groupWrapper.querySelector('.add-question-to-group-btn').addEventListener('click', () => {
            addQuestionToGroup(groupWrapper.querySelector('.questions-in-group-container'));
            updateQuestionNumbers();
        });

        // Add an initial question to the new group
        addQuestionToGroup(groupWrapper.querySelector('.questions-in-group-container'));
        updateQuestionNumbers();
    }

    // Function to add a question to a specific group
    function addQuestionToGroup(container, questionData = {}) {
        questionCounter++; // Increment global question counter
        const questionId = `question-${questionCounter}`;
        const questionBlock = document.createElement('div');
        questionBlock.classList.add('question-block');
        questionBlock.setAttribute('data-question-id', questionId); // Store question ID

        const qText = questionData.text || '';
        const qType = questionData.type || 'text';
        const qScore = questionData.score || 1;
        const qOptions = questionData.options || [];

        questionBlock.innerHTML = `
            <div class="form-group">
                <label for="questionText_${questionId}">السؤال <span class="question-number"></span>:</label>
                <textarea id="questionText_${questionId}" name="questionText" rows="3" placeholder="أدخلْ نصَّ السؤالِ هنا">${qText}</textarea>
            </div>
            <div class="form-group">
                <label for="questionType_${questionId}">نوعُ السؤالِ:</label>
                <select id="questionType_${questionId}" name="questionType" class="question-type-select">
                    <option value="text" ${qType === 'text' ? 'selected' : ''}>نصِّيٌّ</option>
                    <option value="multiple-choice" ${qType === 'multiple-choice' ? 'selected' : ''}>اختيارٌ من متعدِّدٍ</option>
                    <option value="true-false" ${qType === 'true-false' ? 'selected' : ''}>صحٌّ/خطأٌ</option>
                </select>
                <label for="questionScore_${questionId}" style="display:inline-block; width:auto; margin-left: 5px;">الدرجةُ:</label>
                <input type="number" id="questionScore_${questionId}" name="questionScore" value="${qScore}" style="width: 80px; display:inline-block;">
                <button type="button" class="remove-question-btn">حذفُ السؤالِ</button>
            </div>
            <div class="options-container" style="display: ${qType === 'multiple-choice' || qType === 'true-false' ? 'block' : 'none'};">
                <label>الخياراتُ:</label>
                <div class="options-list">
                    </div>
                <button type="button" class="add-option-btn">إضافةُ خيارٍ</button>
            </div>
        `;

        container.appendChild(questionBlock);

        // Populate options if available
        const optionsList = questionBlock.querySelector('.options-list');
        qOptions.forEach(option => {
            addOptionToQuestion(optionsList, option.text, option.isCorrect);
        });


        // Add event listeners for new elements
        questionBlock.querySelector('.remove-question-btn').addEventListener('click', () => {
            questionBlock.remove();
            updateQuestionNumbers();
        });

        const questionTypeSelect = questionBlock.querySelector('.question-type-select');
        const optionsContainer = questionBlock.querySelector('.options-container');

        questionTypeSelect.addEventListener('change', (event) => {
            toggleOptionsVisibility(event.target.value, optionsContainer);
        });

        questionBlock.querySelector('.add-option-btn').addEventListener('click', () => {
            addOptionToQuestion(optionsList);
        });
    }

    // Function to toggle options visibility based on question type
    function toggleOptionsVisibility(type, optionsContainer) {
        if (type === 'multiple-choice' || type === 'true-false') {
            optionsContainer.style.display = 'block';
            // Clear existing options if type changed to true-false and re-add them
            const optionsList = optionsContainer.querySelector('.options-list');
            if (type === 'true-false' && optionsList.children.length !== 2) {
                optionsList.innerHTML = '';
                addOptionToQuestion(optionsList, 'صحٌّ', false); // Default to false, correct can be set later
                addOptionToQuestion(optionsList, 'خطأٌ', false);
            } else if (type === 'multiple-choice' && optionsList.children.length === 0) {
                 // If changing back to multiple-choice and no options, add one
                addOptionToQuestion(optionsList);
            }
        } else {
            optionsContainer.style.display = 'none';
        }
    }


    // Function to add an option to a multiple-choice question
    function addOptionToQuestion(optionsList, optionText = '', isCorrect = false) {
        const optionItem = document.createElement('div');
        optionItem.classList.add('option-item');
        const optionId = `option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Unique ID for option radio

        optionItem.innerHTML = `
            <input type="radio" name="option_${optionsList.closest('.question-block').dataset.questionId}" id="${optionId}" ${isCorrect ? 'checked' : ''}>
            <label for="${optionId}"></label>
            <input type="text" value="${optionText}" placeholder="أدخلْ خيارًا هنا">
            <button type="button" class="remove-option-btn">حذفُ</button>
        `;
        optionsList.appendChild(optionItem);

        // Add event listener for removing option
        optionItem.querySelector('.remove-option-btn').addEventListener('click', () => {
            optionItem.remove();
        });
    }

    // Function to update question numbers dynamically
    function updateQuestionNumbers() {
        let currentQuestionNumber = 1;
        document.querySelectorAll('.question-group-wrapper').forEach(groupWrapper => {
            groupWrapper.querySelectorAll('.question-block').forEach(questionBlock => {
                const questionNumberSpan = questionBlock.querySelector('.question-number');
                if (questionNumberSpan) {
                    questionNumberSpan.textContent = currentQuestionNumber;
                    // Update radio button names to ensure uniqueness across ALL questions
                    const questionId = questionBlock.dataset.questionId;
                    const radioButtons = questionBlock.querySelectorAll(`input[type="radio"][name^="option_"]`);
                    radioButtons.forEach(radio => {
                        radio.name = `option_question-${currentQuestionNumber}`; // Use current question number for name
                    });
                }
                currentQuestionNumber++;
            });
        });
    }

    // Function to collect all input data
    function collectContestData() {
        const data = {
            contestName: contestNameInput.value.trim(),
            schoolName: schoolNameInput.value.trim(),
            teacherName: teacherNameInput.value.trim(),
            subject: subjectInput.value.trim(),
            date: dateInput.value.trim(),
            duration: durationInput.value.trim(),
            score: scoreInput.value.trim(),
            title: titleInput.value.trim(),
            text: textInput.value.trim(),
            authorSource: authorSourceInput.value.trim(),
            vocabulary: vocabularyInput.value.trim(),
            questionGroups: []
        };

        document.querySelectorAll('.question-group-wrapper').forEach(groupWrapper => {
            const groupTitle = groupWrapper.querySelector('.group-title-input').value.trim();
            const questions = [];

            groupWrapper.querySelectorAll('.question-block').forEach(questionBlock => {
                const qText = questionBlock.querySelector('textarea[name="questionText"]').value.trim();
                const qType = questionBlock.querySelector('select[name="questionType"]').value;
                const qScore = questionBlock.querySelector('input[name="questionScore"]').value.trim();
                const options = [];

                if (qType === 'multiple-choice' || qType === 'true-false') {
                    questionBlock.querySelectorAll('.options-list .option-item').forEach(optionItem => {
                        const optionText = optionItem.querySelector('input[type="text"]').value.trim();
                        const isCorrect = optionItem.querySelector('input[type="radio"]').checked;
                        options.push({ text: optionText, isCorrect: isCorrect });
                    });
                }

                questions.push({
                    text: qText,
                    type: qType,
                    score: qScore,
                    options: options
                });
            });

            data.questionGroups.push({
                title: groupTitle,
                questions: questions
            });
        });
        return data;
    }

    // Function to populate inputs from data
    function populateContestData(data) {
        contestNameInput.value = data.contestName || '';
        schoolNameInput.value = data.schoolName || '';
        teacherNameInput.value = data.teacherName || '';
        subjectInput.value = data.subject || '';
        dateInput.value = data.date || '';
        durationInput.value = data.duration || '';
        scoreInput.value = data.score || '';
        titleInput.value = data.title || '';
        textInput.value = data.text || '';
        authorSourceInput.value = data.authorSource || '';
        vocabularyInput.value = data.vocabulary || '';

        // Clear existing question groups
        questionGroupsContainer.innerHTML = '';
        questionGroupCounter = 0;
        questionCounter = 0;

        // Add question groups and questions
        if (data.questionGroups && data.questionGroups.length > 0) {
            data.questionGroups.forEach(group => {
                const newGroupWrapper = document.createElement('div');
                newGroupWrapper.classList.add('question-group-wrapper');
                questionGroupCounter++;
                const groupId = `group-${questionGroupCounter}`;
                newGroupWrapper.setAttribute('data-group-id', groupId);

                newGroupWrapper.innerHTML = `
                    <div class="question-group-header">
                        <input type="text" class="group-title-input" placeholder="عنوان قسم الأسئلة (اختياري)" value="${group.title}">
                        <button type="button" class="remove-group-btn">حذفُ القسمِ</button>
                    </div>
                    <div class="questions-in-group-container">
                        </div>
                    <button type="button" class="add-question-to-group-btn">إضافةُ سؤالٍ لهذا القسمِ</button>
                `;
                questionGroupsContainer.appendChild(newGroupWrapper);

                const questionsInGroupContainer = newGroupWrapper.querySelector('.questions-in-group-container');

                group.questions.forEach(q => {
                    addQuestionToGroup(questionsInGroupContainer, q);
                });

                // Re-attach event listeners for newly created group elements
                newGroupWrapper.querySelector('.remove-group-btn').addEventListener('click', () => {
                    newGroupWrapper.remove();
                    updateQuestionNumbers();
                });
                newGroupWrapper.querySelector('.add-question-to-group-btn').addEventListener('click', () => {
                    addQuestionToGroup(questionsInGroupContainer);
                    updateQuestionNumbers();
                });
            });
        } else {
            // If no groups, add one empty group
            addQuestionGroup();
        }
        updateQuestionNumbers();
    }


    // Function to generate the preview HTML
    function generatePreview(data) {
        let html = `
            <div class="contest-details">
                <div><span>التاريخُ:</span><span>${data.date || '----------'}</span></div>
                <div><span>اسْمُ المدرسةِ:</span><span>${data.schoolName || '----------'}</span></div>
                <div><span>اسْمُ المعلِّمِ:</span><span>${data.teacherName || '----------'}</span></div>
                <div><span>المادةُ:</span><span>${data.subject || '----------'}</span></div>
                <div><span>المدةُ:</span><span>${data.duration || '----------'}</span></div>
                <div><span>العلامةُ الكليَّةُ:</span><span>${data.score || '----------'}</span></div>
            </div>
            <h2>${data.title || 'مسابقةٌ'}</h2>
        `;

        if (data.text) {
            html += `<div class="text-section">${formatTextWithNumberedLines(data.text)}</div>`;
        }

        if (data.authorSource) {
            html += `<p class="author-source">المصدرُ/المؤلِّفُ: ${data.authorSource}</p>`;
        }

        if (data.vocabulary) {
            html += `<div class="vocabulary-section">
                        <h3>شرحُ المفرداتِ/الحواشي:</h3>
                        <ul>`;
            const vocabularyLines = data.vocabulary.split('\n').filter(line => line.trim() !== '');
            vocabularyLines.forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    html += `<li><strong>${parts[0].trim()}:</strong> ${parts.slice(1).join(':').trim()}</li>`;
                } else {
                    html += `<li>${line.trim()}</li>`;
                }
            });
            html += `</ul></div>`;
        }

        if (data.questionGroups.length > 0) {
            html += `<div class="questions-main-section"><h3>الأسئلةُ:</h3>`;
            let currentQNum = 1;
            data.questionGroups.forEach(group => {
                if (group.title) {
                    html += `<div class="question-group-in-doc"><h4>${group.title}:</h4>`;
                }
                group.questions.forEach(q => {
                    html += `<div class="question">
                                <p class="question-text">سؤالٌ ${currentQNum} (${q.score || 0} علامةٍ): ${q.text}</p>`;
                    if ((q.type === 'multiple-choice' || q.type === 'true-false') && q.options.length > 0) {
                        html += `<div class="options-container-in-doc"><ul>`;
                        q.options.forEach(option => {
                            html += `<li><input type="radio" disabled> <label>${option.text}</label></li>`;
                        });
                        html += `</ul></div>`;
                    }
                    html += `</div>`;
                    currentQNum++;
                });
                if (group.title) {
                    html += `</div>`; // Close question-group-in-doc
                }
            });
            html += `</div>`; // Close questions-main-section
        }

        previewContent.innerHTML = html;
    }

    // Helper to format text with numbered lines for preview
    function formatTextWithNumberedLines(text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return '';

        let formattedText = '<ol>';
        lines.forEach(line => {
            formattedText += `<li>${line.trim()}</li>`;
        });
        formattedText += '</ol>';
        return formattedText;
    }

    // --- Event Listeners ---

    // Initial addition of a question group when the page loads
    addQuestionGroupBtn.addEventListener('click', () => addQuestionGroup());

    // Preview Button
    previewBtn.addEventListener('click', () => {
        const data = collectContestData();
        generatePreview(data);
        inputSection.classList.add('hidden');
        previewSection.classList.remove('hidden');
    });

    // Back to Input Button
    backToInputBtn.addEventListener('click', () => {
        previewSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
    });

    // Export to PDF
    exportPdfBtn.addEventListener('click', () => {
        const element = previewContent; // Target the preview content for PDF

        // Define PDF options
        const options = {
            margin: [20, 15, 20, 15], // Top, Left, Bottom, Right
            filename: `${contestNameInput.value.trim() || 'مسابقة'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(options).from(element).save().then(() => {
            console.log('PDF generated successfully!');
        }).catch(error => {
            console.error('Error during PDF generation:', error);
            alert('حدثَ خطأٌ أثناءَ تصديرِ PDF. يرجى التحقُّقُ من وحدةِ التحكُّمِ للمزيدِ من التفاصيلِ.');
        });
    });

    // Export to Word (Basic HTML to DOC)
    exportWordBtn.addEventListener('click', () => {
        const content = previewContent.innerHTML;
        const filename = `${contestNameInput.value.trim() || 'مسابقة'}.doc`;
        const blob = new Blob(['<html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>',
                                document.querySelector('link[rel="stylesheet"]').outerHTML, // Include CSS link
                                'body { font-family: \'Cairo\', \'Scheherazade New\', Arial, sans-serif; direction: rtl; }',
                                // You might need to inline some critical CSS for Word to render it well
                                '</style></head><body>',
                                content,
                                '</body></html>'], { type: 'application/msword' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('تمَّ تصديرُ المسابقةِ إلى ملفِّ Word.');
    });

    // --- Save/Load Contest Functions ---

    // Load saved contests into the dropdown
    function loadSavedContests() {
        loadContestSelect.innerHTML = '<option value="">استعادةُ مسابقةٍ محفوظةٍ</option>';
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('contest_')) {
                const contestName = key.substring(8); // Remove 'contest_' prefix
                const option = document.createElement('option');
                option.value = key;
                option.textContent = contestName;
                loadContestSelect.appendChild(option);
            }
        }
        loadContestBtn.disabled = true; // Disable until a contest is selected
    }

    // Save Contest
    saveContestBtn.addEventListener('click', () => {
        const name = contestNameInput.value.trim();
        if (name) {
            const data = collectContestData();
            try {
                localStorage.setItem(`contest_${name}`, JSON.stringify(data));
                alert(`تمَّ حفظُ المسابقةِ باسمِ: "${name}"`);
                loadSavedContests(); // Refresh dropdown
            } catch (e) {
                alert('عذرًا، لا يمكنُ حفظُ المسابقةِ. قد تكونُ الذاكرةُ ممتلئةً أو هناكَ مشكلةٌ في المتصفحِ.');
                console.error('Local Storage Save Error:', e);
            }
        } else {
            alert('الرجاءُ إدخالُ اسْمٍ للمسابقةِ لحفظِها.');
        }
    });

    // Enable Load Button when selection changes
    loadContestSelect.addEventListener('change', () => {
        loadContestBtn.disabled = !loadContestSelect.value;
    });

    // Load Contest
    loadContestBtn.addEventListener('click', () => {
        const selectedKey = loadContestSelect.value;
        if (selectedKey) {
            try {
                const storedData = localStorage.getItem(selectedKey);
                if (storedData) {
                    const data = JSON.parse(storedData);
                    populateContestData(data);
                    alert(`تمَّ استعادةُ المسابقةِ: "${data.contestName}"`);
                } else {
                    alert('المسابقةُ المختارةُ غيرُ موجودةٍ.');
                }
            } catch (e) {
                alert('حدثَ خطأٌ أثناءَ استعادةِ المسابقةِ.');
                console.error('Local Storage Load Error:', e);
            }
        }
    });

    // --- Initial Setup ---
    loadSavedContests(); // Load contests on page load
    if (questionGroupsContainer.children.length === 0) {
        addQuestionGroup(); // Add an initial empty group if none exist
    }
    updateQuestionNumbers(); // Initial numbering
});
