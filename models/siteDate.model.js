const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SiteData extends Model {
    static associate(models) {
      SiteData.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  SiteData.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      siteTitleMarathi: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      siteTitleEnglish: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      siteLogo: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      favicon: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      autoPublishApprovedArticle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "SiteData",
      tableName: "site_data",
      timestamps: false,
    }
  );

  return SiteData;
};
