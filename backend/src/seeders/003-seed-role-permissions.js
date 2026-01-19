'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get role IDs
    const [roles] = await queryInterface.sequelize.query("SELECT id, name FROM roles");
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role.id;
    });

    // Get permission IDs
    const [permissions] = await queryInterface.sequelize.query("SELECT id, name FROM permissions");
    const permMap = {};
    permissions.forEach(perm => {
      permMap[perm.name] = perm.id;
    });

    const rolePermissions = [
      // Admin - all permissions
      ...permissions.map(p => ({
        role_id: roleMap['admin'],
        permission_id: p.id,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      
      // Reviewer - correspondence read, review, report read
      {
        role_id: roleMap['reviewer'],
        permission_id: permMap['correspondence:read'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: roleMap['reviewer'],
        permission_id: permMap['correspondence:review'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: roleMap['reviewer'],
        permission_id: permMap['report:read'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: roleMap['reviewer'],
        permission_id: permMap['entity:read'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      
      // Employee - correspondence create, read, update
      {
        role_id: roleMap['employee'],
        permission_id: permMap['correspondence:create'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: roleMap['employee'],
        permission_id: permMap['correspondence:read'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: roleMap['employee'],
        permission_id: permMap['correspondence:update'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: roleMap['employee'],
        permission_id: permMap['entity:read'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      
      // Viewer - read only
      {
        role_id: roleMap['viewer'],
        permission_id: permMap['correspondence:read'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: roleMap['viewer'],
        permission_id: permMap['entity:read'],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('role_permissions', rolePermissions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role_permissions', null, {});
  },
};

