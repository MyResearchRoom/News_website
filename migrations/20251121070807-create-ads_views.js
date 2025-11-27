"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "ads_views",
      {
        adId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "ads",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        visitorId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      {
        uniqueKeys: {
          unique_adId_visitorId: {
            fields: ["adId", "visitorId"],
          },
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ads_views");
  },
};
