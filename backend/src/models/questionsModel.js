module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define("Question", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        exam_set_id: DataTypes.BIGINT,
        question_text: DataTypes.TEXT,
        question_type: DataTypes.STRING,
        max_marks: DataTypes.INTEGER,
        parent_question_id: DataTypes.BIGINT,
        question_no: DataTypes.STRING,
        grading_rules: DataTypes.JSON,
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        deletedAt: DataTypes.DATE
    }, {
        tableName: "questions",
        timestamps: false
    });

    return Question;
};
