"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("ads", "thumbnail", {
      type: Sequelize.BLOB("long"),
      allowNull: true,
    });
    await queryInterface.changeColumn("ads", "url", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {},
};
