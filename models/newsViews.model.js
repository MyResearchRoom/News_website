const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class NewsView extends Model {
    static associate(models) {
      NewsView.belongsTo(models.News, {
        foreignKey: "newsId",
        as: "news",
      });
    }
  }

  NewsView.init(
    {
      newsId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      visitorId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "NewsView",
      tableName: "news_views",
      timestamps: false,
    }
  );

  NewsView.removeAttribute("id");

  return NewsView;
};
