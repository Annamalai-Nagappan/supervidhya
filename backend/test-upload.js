const fs = require('fs');
const path = require('path');

async function testUpload() {
    const filePath = path.join(__dirname, 'test_question_paper.pdf');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'Dummy PDF content for testing');
    }

    const formData = new FormData();
    const fileContent = fs.readFileSync(filePath);
    const blob = new Blob([fileContent], { type: 'application/pdf' });

    formData.append('file', blob, 'test_question_paper.pdf');
    formData.append('examId', '1');
    formData.append('setCode', 'A');

    try {
        const response = await fetch('http://localhost:5000/api/exam/upload-question-paper', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error during upload test:', error.message);
    }
}

testUpload();
