'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('status_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      correspondence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'correspondences',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      old_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      new_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      changed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      notes: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('status_history', ['correspondence_id']);
    await queryInterface.addIndex('status_history', ['changed_by']);
    await queryInterface.addIndex('status_history', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('status_history');
  },
};

