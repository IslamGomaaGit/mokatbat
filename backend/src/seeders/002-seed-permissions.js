'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const permissions = [
      // Correspondence permissions
      { name: 'correspondence:create', name_ar: 'إنشاء مكاتبة', resource: 'correspondence', action: 'create' },
      { name: 'correspondence:read', name_ar: 'قراءة مكاتبة', resource: 'correspondence', action: 'read' },
      { name: 'correspondence:update', name_ar: 'تعديل مكاتبة', resource: 'correspondence', action: 'update' },
      { name: 'correspondence:delete', name_ar: 'حذف مكاتبة', resource: 'correspondence', action: 'delete' },
      { name: 'correspondence:review', name_ar: 'مراجعة مكاتبة', resource: 'correspondence', action: 'review' },
      
      // User permissions
      { name: 'user:create', name_ar: 'إنشاء مستخدم', resource: 'user', action: 'create' },
      { name: 'user:read', name_ar: 'قراءة مستخدم', resource: 'user', action: 'read' },
      { name: 'user:update', name_ar: 'تعديل مستخدم', resource: 'user', action: 'update' },
      { name: 'user:delete', name_ar: 'حذف مستخدم', resource: 'user', action: 'delete' },
      
      // Entity permissions
      { name: 'entity:create', name_ar: 'إنشاء جهة', resource: 'entity', action: 'create' },
      { name: 'entity:read', name_ar: 'قراءة جهة', resource: 'entity', action: 'read' },
      { name: 'entity:update', name_ar: 'تعديل جهة', resource: 'entity', action: 'update' },
      { name: 'entity:delete', name_ar: 'حذف جهة', resource: 'entity', action: 'delete' },
      
      // Report permissions
      { name: 'report:read', name_ar: 'قراءة التقارير', resource: 'report', action: 'read' },
    ];

    const permissionsWithTimestamps = permissions.map(p => ({
      ...p,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('permissions', permissionsWithTimestamps);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  },
};

