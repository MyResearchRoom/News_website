const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.News, {
        foreignKey: "categoryId",
        as: "news",
      });
    }
  }
  Category.init(
    {
      categoryNameEnglish: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      categoryNameMarathi: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      timestamps: true,
      paranoid: true,
    }
  );

  return Category;
};
