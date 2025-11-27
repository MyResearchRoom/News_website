"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("news", "pdf", {
      type: Sequelize.BLOB("long"),
      allowNull: true,
    });
    await queryInterface.addColumn("news", "pdfName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("news", "pdf");
    await queryInterface.removeColumn("news", "pdfName");
  },
};
