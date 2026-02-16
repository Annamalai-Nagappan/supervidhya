module.exports = (sequelize, DataTypes) => {
    const Institution = sequelize.define("Institution", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        status: DataTypes.STRING,
        config_json: DataTypes.JSON,
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        deletedAt: { type: DataTypes.DATE, allowNull: true }
    }, {
        tableName: "institutions",
        timestamps: false
    });

    return Institution;
};








