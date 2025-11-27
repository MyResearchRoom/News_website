"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addConstraint("news_views", {
    //   fields: ["newsId", "visitorId"],
    //   type: "unique",
    //   name: "unique_newsId_visitorId",
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "news_views",
      "unique_newsId_visitorId"
    );
  },
};
