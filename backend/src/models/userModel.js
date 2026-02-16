const { STATUS } = require("../utils/constants");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        institution_id: DataTypes.BIGINT,
        full_name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        role: DataTypes.STRING,
        status: { type: DataTypes.STRING, defaultValue: STATUS.ACTIVE },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        deletedAt: { type: DataTypes.DATE, allowNull: true }
    }, {
        tableName: "users",
        timestamps: false
    });

    return User;
};
