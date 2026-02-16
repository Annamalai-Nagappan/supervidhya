const db = require('../models/indexModel');
const { Exam, ExamSet, File, Question, Submission, EvaluationResult, sequelize } = db;
const path = require('path');
const { scrapeWithGemini, evaluateStudentAnswer } = require('../services/geminiService');

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
        const questions = await Question.findAll({ where: { exam_set_id: examSet.id } });
        const questionNos = questions.map(q => q.question_no);

        // 3. Trigger Gemini for Answer Key with Expected Question Nos
        const scrapedAnswers = await scrapeWithGemini(req.file.path, 'model_answer', questionNos);

        if (!scrapedAnswers || !Array.isArray(scrapedAnswers)) {
            throw new Error('AI returned invalid answer data');
        }

        /* -------------------- UPDATE QUESTIONS WITH MODEL ANSWERS -------------------- */

        const updatePromises = scrapedAnswers.map(ans => {
            return Question.update({
                model_answer: ans.correct_answer || '',
                key_points: ans.points || []
            }, {
                where: {
                    exam_set_id: examSet.id,
                    question_no: ans.question_no?.toString()
                },
                transaction
            });
        });

        await Promise.all(updatePromises);

        /* -------------------- UPDATE EXAM SET SNAPSHOT -------------------- */

        await examSet.update({
            model_answer_file_id: savedFile.id,
            answer_key_json: scrapedAnswers
        }, { transaction });

        await transaction.commit();

        res.status(200).json({
            message: 'Model answer paper uploaded and individual questions updated successfully',
            examSetId: examSet.id,
            answersCount: scrapedAnswers.length
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

const evaluateSubmission = async (req, res) => {
    const { submissionId } = req.params;

    try {
        const submission = await Submission.findByPk(submissionId, {
            include: [
                { model: ExamSet, include: [Question] },
                { model: File }
            ]
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        if (!submission.ExamSet || !submission.ExamSet.Questions) {
            return res.status(400).json({ message: 'Exam set or questions not found for this submission' });
        }

        const questionNos = submission.ExamSet.Questions.map(q => q.question_no);

        // 1. Scrape student's handwritten answers with Expected Nos
        const studentAnswers = await scrapeWithGemini(submission.File.path, 'student_submission', questionNos);

        if (!studentAnswers || !Array.isArray(studentAnswers)) {
            throw new Error('Failed to extract answers from student paper');
        }

        const evaluationResults = [];

        // 2. Evaluate each answer
        for (const ans of studentAnswers) {
            const question = submission.ExamSet.Questions.find(q => q.question_no === ans.question_no);

            if (question) {
                const evaluation = await evaluateStudentAnswer(
                    question.question_text,
                    question.model_answer,
                    question.key_points,
                    ans.student_answer,
                    question.max_marks
                );

                const result = await EvaluationResult.create({
                    submission_id: submission.id,
                    question_id: question.id,
                    match_quality: evaluation.match_quality,
                    ai_score: evaluation.score,
                    final_score: evaluation.score, // Default to AI score
                    feedback: evaluation.feedback,
                    confidence_score: evaluation.confidence_score,
                    evaluated_at: new Date()
                });

                evaluationResults.push(result);
            }
        }

        await submission.update({ status: 'evaluated' });

        // Batch fetch results with Question info to return to frontend
        const enrichedResults = await EvaluationResult.findAll({
            where: { submission_id: submission.id },
            include: [{ model: Question }]
        });

        const totalMarks = enrichedResults.reduce((acc, r) => acc + parseFloat(r.ai_score || 0), 0);
        const maxMarks = submission.ExamSet.Questions.reduce((acc, q) => acc + (q.max_marks || 0), 0);
        const avgConfidence = enrichedResults.length > 0
            ? Math.round((enrichedResults.reduce((acc, r) => acc + parseFloat(r.confidence_score || 0), 0) / enrichedResults.length) * 100)
            : 0;

        return res.status(200).json({
            message: 'Evaluation completed successfully',
            totalMarks,
            maxMarks,
            confidenceScore: avgConfidence,
            results: enrichedResults
        });

    } catch (error) {
        console.error('Error during evaluation:', error);
        return res.status(500).json({
            message: 'Evaluation failed',
            error: error.message
        });
    }
};

module.exports = {
    uploadQuestionPaper,
    uploadModelAnswer,
    uploadStudentSubmission,
    evaluateSubmission
};
