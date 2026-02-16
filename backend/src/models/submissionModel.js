module.exports = (sequelize, DataTypes) => {
    const Submission = sequelize.define("Submission", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        exam_id: DataTypes.BIGINT,
        exam_set_id: DataTypes.BIGINT,
        student_id: DataTypes.BIGINT,
        batch_id: DataTypes.BIGINT,
        answer_paper_file_id: DataTypes.BIGINT,
        submitted_at: DataTypes.DATE,
        status: DataTypes.STRING,
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        deletedAt: DataTypes.DATE
    }, {
        tableName: "submissions",
        timestamps: false
    });

    return Submission;
};
