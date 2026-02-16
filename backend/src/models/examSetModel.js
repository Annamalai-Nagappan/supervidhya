module.exports = (sequelize, DataTypes) => {
    const ExamSet = sequelize.define("ExamSet", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        exam_id: DataTypes.BIGINT,
        set_code: DataTypes.STRING,
        model_answer_file_id: DataTypes.BIGINT,
        question_paper_file_id: DataTypes.BIGINT,
        question_json: DataTypes.JSON,
        answer_key_json: DataTypes.JSON,
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        deletedAt: DataTypes.DATE
    }, {
        tableName: "exam_sets",
        timestamps: false
    });

    return ExamSet;
};
