'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
await queryInterface.addColumn('Frees', 'link2',   { type: Sequelize.STRING, allowNull: true });
await queryInterface.addColumn('Frees', 'linkMV4', { type: Sequelize.STRING, allowNull: true });

  },

  async down (queryInterface, Sequelize) {

// down:
await queryInterface.removeColumn('Frees', 'link2');
await queryInterface.removeColumn('Frees', 'linkMV4');

  }
};
