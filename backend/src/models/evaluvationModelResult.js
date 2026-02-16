module.exports = (sequelize, DataTypes) => {
    const EvaluationResult = sequelize.define("EvaluationResult", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        submission_id: DataTypes.BIGINT,
        question_id: DataTypes.BIGINT,
        match_quality: DataTypes.STRING,
        is_flagged: DataTypes.BOOLEAN,
        flag_reason: DataTypes.STRING,
        ai_score: DataTypes.DECIMAL(5, 2),
        final_score: DataTypes.DECIMAL(5, 2),
        feedback: DataTypes.TEXT,
        confidence_score: DataTypes.DECIMAL(5, 2),
        evaluated_at: DataTypes.DATE,
        evaluated_by: DataTypes.BIGINT,
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        deletedAt: DataTypes.DATE
    }, {
        tableName: "evaluation_results",
        timestamps: false
    });

    return EvaluationResult;
};
