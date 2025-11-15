"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("news_views", {
      newsId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "news",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      visitorId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("news_views");
  },
};
