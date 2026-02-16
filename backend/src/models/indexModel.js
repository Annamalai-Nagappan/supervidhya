const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.File = require("./fileModel")(sequelize, Sequelize.DataTypes);
db.User = require("./userModel")(sequelize, Sequelize.DataTypes);
db.Department = require("./departmentModel")(sequelize, Sequelize.DataTypes);
db.Institution = require("./InstitutionModel")(sequelize, Sequelize.DataTypes);
db.Subject = require("./subjectModel")(sequelize, Sequelize.DataTypes);
db.Exam = require("./examsModel")(sequelize, Sequelize.DataTypes);
db.Question = require("./questionsModel")(sequelize, Sequelize.DataTypes);
db.ExamSet = require("./examSetModel")(sequelize, Sequelize.DataTypes);
db.Submission = require("./submissionModel")(sequelize, Sequelize.DataTypes);
db.EvaluationResult = require("./evaluvationModelResult")(sequelize, Sequelize.DataTypes);

// Define Associations
db.Exam.hasMany(db.ExamSet, { foreignKey: 'exam_id' });
db.ExamSet.belongsTo(db.Exam, { foreignKey: 'exam_id' });

db.ExamSet.hasMany(db.Question, { foreignKey: 'exam_set_id' });
db.Question.belongsTo(db.ExamSet, { foreignKey: 'exam_set_id' });

db.ExamSet.belongsTo(db.File, { foreignKey: 'question_paper_file_id', as: 'QuestionPaper' });
db.ExamSet.belongsTo(db.File, { foreignKey: 'model_answer_file_id', as: 'ModelAnswer' });
db.File.hasOne(db.ExamSet, { foreignKey: 'question_paper_file_id' });
db.File.hasOne(db.ExamSet, { foreignKey: 'model_answer_file_id' });

// Initialize associations
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;
