module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define("File", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        original_name: { type: DataTypes.STRING, allowNull: false },
        filename: { type: DataTypes.STRING, allowNull: false },
        path: { type: DataTypes.STRING, allowNull: false },
        mime_type: { type: DataTypes.STRING },
        size: { type: DataTypes.INTEGER },
        uploaded_by: { type: DataTypes.BIGINT },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: "files",
        timestamps: false
    });

    return File;
};
