module.exports = (sequelize, DataTypes) => {
    const Exam = sequelize.define("Exam", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        institution_id: DataTypes.BIGINT,
        subject_id: DataTypes.BIGINT,
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        exam_type: DataTypes.STRING,
        total_marks: DataTypes.INTEGER,
        start_time: DataTypes.DATE,
        end_time: DataTypes.DATE,
        created_by: DataTypes.BIGINT,
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        deletedAt: DataTypes.DATE
    }, {
        tableName: "exams",
        timestamps: false
    });

    return Exam;
};
