'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('correspondence_replies', {
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
      parent_reply_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'correspondence_replies',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      subject: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
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

    await queryInterface.addIndex('correspondence_replies', ['correspondence_id']);
    await queryInterface.addIndex('correspondence_replies', ['parent_reply_id']);
    await queryInterface.addIndex('correspondence_replies', ['created_by']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('correspondence_replies');
  },
};

