const { Exam, ExamSet, File, Question, Submission, sequelize } = require('../models/indexModel');
const path = require('path');
const { scrapeWithGemini } = require('../services/geminiService');

const uploadQuestionPaper = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        /* -------------------- BASIC VALIDATION -------------------- */

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { examId, setCode } = req.body;

        if (!examId) {
            throw new Error('examId is required');
        }

        if (isNaN(examId)) {
            throw new Error('examId must be a valid number');
        }

        /* -------------------- VERIFY PARENT RECORD -------------------- */

        const exam = await Exam.findByPk(examId, { transaction });

        if (!exam) {
            throw new Error(`Invalid examId: ${examId} (exam not found)`);
        }

        /* -------------------- SAVE FILE -------------------- */

        const savedFile = await File.create({
            original_name: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            mime_type: req.file.mimetype,
            size: req.file.size,
            uploaded_by: req.user ? req.user.id : null
        }, { transaction });

        /* -------------------- CREATE EXAM SET -------------------- */

        const examSet = await ExamSet.create({
            exam_id: exam.id,                      // safer than raw examId
            set_code: setCode || 'A',
            question_paper_file_id: savedFile.id,
            created_at: new Date(),
            isDeleted: 0
        }, { transaction });

        /* -------------------- CALL GEMINI SCRAPER -------------------- */

        let scrapedQuestions;

        try {
            scrapedQuestions = await scrapeWithGemini(
                req.file.path,
                'question_paper'
            );
        } catch (aiError) {
            throw new Error('AI processing failed: ' + aiError.message);
        }

        if (!scrapedQuestions || !Array.isArray(scrapedQuestions)) {
            throw new Error('AI returned invalid question data');
        }

        /* -------------------- STORE QUESTIONS -------------------- */

        const questionPromises = scrapedQuestions.map(q => {
            return Question.create({
                exam_set_id: examSet.id,
                question_no: q.question_no?.toString() || null,
                question_text: q.question_text || '',
                max_marks: parseInt(q.max_marks) || 0,
                question_type: q.question_type || 'subjective',
                isDeleted: 0
            }, { transaction });
        });

        await Promise.all(questionPromises);

        /* -------------------- UPDATE SNAPSHOT JSON -------------------- */

        await examSet.update({
            question_json: scrapedQuestions
        }, { transaction });

        /* -------------------- COMMIT -------------------- */

        await transaction.commit();

        return res.status(201).json({
            message: 'Question paper uploaded and processed by AI successfully',
            examSetId: examSet.id,
            questionsCount: scrapedQuestions.length,
            questions: scrapedQuestions
        });

    } catch (error) {

        await transaction.rollback();

        console.error('Error processing question paper:', error);

        return res.status(500).json({
            message: 'Failed to process question paper with AI',
            error: error.message
        });
    }
};

const uploadModelAnswer = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { examSetId } = req.body;

        const savedFile = await File.create({
            original_name: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            mime_type: req.file.mimetype,
            size: req.file.size,
            uploaded_by: req.user ? req.user.id : null
        }, { transaction });

        const examSet = await ExamSet.findByPk(examSetId);
        if (!examSet) {
            throw new Error('Exam Set not found');
        }

        // 3. Trigger Gemini for Answer Key
        const scrapedAnswers = await scrapeWithGemini(req.file.path, 'model_answer');

        await examSet.update({
            model_answer_file_id: savedFile.id,
            answer_key_json: scrapedAnswers
        }, { transaction });

        await transaction.commit();

        res.status(200).json({
            message: 'Model answer paper uploaded and processed by AI successfully',
            examSetId: examSet.id,
            answers: scrapedAnswers
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error processing model answer:', error);
        res.status(500).json({ message: 'Failed to process model answer with AI', error: error.message });
    }
};

const uploadStudentSubmission = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { examId, examSetId, studentId } = req.body;

        const savedFile = await File.create({
            original_name: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            mime_type: req.file.mimetype,
            size: req.file.size,
            uploaded_by: req.user ? req.user.id : null
        }, { transaction });

        const submission = await Submission.create({
            exam_id: examId,
            exam_set_id: examSetId,
            student_id: studentId,
            answer_paper_file_id: savedFile.id,
            submitted_at: new Date(),
            status: 'pending'
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Student answer sheet uploaded successfully',
            submissionId: submission.id
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error processing student submission:', error);
        res.status(500).json({ message: 'Failed to process student submission', error: error.message });
    }
};

module.exports = {
    uploadQuestionPaper,
    uploadModelAnswer,
    uploadStudentSubmission
};
