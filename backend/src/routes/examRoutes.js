const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const upload = require('../middlewares/uploadMiddleware');

// Route for uploading question paper
router.post('/upload-question-paper', upload.single('file'), examController.uploadQuestionPaper);

// Route for uploading model answer paper
router.post('/upload-model-answer', upload.single('file'), examController.uploadModelAnswer);

// Route for uploading student answer sheet (submission)
router.post('/upload-student-submission', upload.single('file'), examController.uploadStudentSubmission);

// Route for triggering evaluation
router.post('/evaluate-submission/:submissionId', examController.evaluateSubmission);

module.exports = router;
