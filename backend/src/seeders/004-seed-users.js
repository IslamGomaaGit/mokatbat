'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const [roles] = await queryInterface.sequelize.query("SELECT id, name FROM roles");
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role.id;
    });

    const passwordHash = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@example.com',
        password_hash: passwordHash,
        full_name_ar: 'مدير النظام',
        full_name_en: 'System Administrator',
        role_id: roleMap['admin'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'reviewer1',
        email: 'reviewer@example.com',
        password_hash: passwordHash,
        full_name_ar: 'مراجع أول',
        full_name_en: 'Senior Reviewer',
        role_id: roleMap['reviewer'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'employee1',
        email: 'employee@example.com',
        password_hash: passwordHash,
        full_name_ar: 'موظف أول',
        full_name_en: 'Senior Employee',
        role_id: roleMap['employee'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};

