const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class NewsComment extends Model {
    static associate(models) {
      NewsComment.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      NewsComment.belongsTo(models.News, {
        foreignKey: "newsId",
        as: "news",
      });
    }
  }

  NewsComment.init(
    {
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      reply: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "NewsComment",
      tableName: "news_comments",
      timestamps: true,
    }
  );

  return NewsComment;
};
