const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    static associate(models) {
      News.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
      });
    }
  }
  News.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.BLOB("long"),
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
      thumbnail: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
      },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      pdf: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      pdfName: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "News",
      tableName: "news",
      timestamps: true,
    }
  );

  return News;
};
