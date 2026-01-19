'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        name: 'admin',
        name_ar: 'مدير',
        description: 'Full system administrator',
        description_ar: 'مدير النظام الكامل',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'reviewer',
        name_ar: 'مراجع',
        description: 'Can review and approve correspondences',
        description_ar: 'يمكنه مراجعة والموافقة على المكاتبات',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'employee',
        name_ar: 'موظف',
        description: 'Can create and manage correspondences',
        description_ar: 'يمكنه إنشاء وإدارة المكاتبات',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'viewer',
        name_ar: 'مشاهد',
        description: 'Read-only access',
        description_ar: 'صلاحية القراءة فقط',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};

