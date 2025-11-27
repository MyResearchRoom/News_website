const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MediaNews extends Model {
    static associate(models) {
      MediaNews.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
      });
    }
  }
  MediaNews.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "published",
          "archived",
          "scheduled",
          "approved"
        ),
        allowNull: false,
        defaultValue: "draft",
      },
      tags: {
        type: DataTypes.STRING,
        allowNull: true,
      },  
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "MediaNews",
      tableName: "media_news",
      timestamps: true,
    }
  );

  return MediaNews;
};
