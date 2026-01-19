'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('entities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name_ar: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      name_en: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('subsidiary', 'presidency', 'government', 'external'),
        allowNull: false,
      },
      contact_person: {
        type: Sequelize.STRING(200),
      },
      contact_email: {
        type: Sequelize.STRING(100),
      },
      contact_phone: {
        type: Sequelize.STRING(50),
      },
      address: {
        type: Sequelize.TEXT,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('entities', ['type']);
    await queryInterface.addIndex('entities', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('entities');
  },
};

