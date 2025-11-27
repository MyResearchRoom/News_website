"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("site_data", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          type: Sequelize.INTEGER,
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      siteTitleMarathi: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      siteTitleEnglish: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contactEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      siteLogo: {
        type: Sequelize.BLOB("long"),
        allowNull: true,
      },
      favicon: {
        type: Sequelize.BLOB("long"),
        allowNull: true,
      },
      language: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      autoPublishApprovedArticle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("site_data");
  },
};
