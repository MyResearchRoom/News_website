const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Ad extends Model {
    static associate(models) {}
  }

  Ad.init(
    {
      thumbnail: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      content: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "ads",
    }
  );

  return Ad;
};
