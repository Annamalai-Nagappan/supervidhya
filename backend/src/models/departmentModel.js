module.exports = (sequelize, DataTypes) => {
    const Department = sequelize.define("Department", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        institution_id: DataTypes.BIGINT,
        department_name: DataTypes.STRING,
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        deletedAt: DataTypes.DATE
    }, {
        tableName: "departments",
        timestamps: false
    });

    return Department;
};
