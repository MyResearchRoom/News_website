const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MediaNewsComment extends Model {
    static associate(models) {
      MediaNewsComment.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      MediaNewsComment.belongsTo(models.MediaNews, {
        foreignKey: "mediaNewsId",
        as: "mediaNews",
      });
    }
  }

  MediaNewsComment.init(
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
      modelName: "MediaNewsComment",
      tableName: "media_news_comments",
      timestamps: true,
    }
  );

  return MediaNewsComment;
};
