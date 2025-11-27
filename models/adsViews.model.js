const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AdView extends Model {
    static associate(models) {
      AdView.belongsTo(models.Ad, {
        foreignKey: "adId",
        as: "ad",
      });
    }
  }

  AdView.init(
    {
      adId: {
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
      modelName: "AdView",
      tableName: "ads_views",
      timestamps: false,
    }
  );

  AdView.removeAttribute("id");

  return AdView;
};
