module.exports = (sequelize, DataTypes) => {
    const Subject = sequelize.define("Subject", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        institution_id: DataTypes.BIGINT,
        department_id: DataTypes.BIGINT,
        subject_name: DataTypes.STRING,
        subject_code: DataTypes.STRING,
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        deletedAt: DataTypes.DATE
    }, {
        tableName: "subjects",
        timestamps: false
    });

    return Subject;
};
