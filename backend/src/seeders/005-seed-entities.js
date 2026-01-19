'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('entities', [
      {
        name_ar: 'الشركة القابضة للصناعات الغذائية',
        name_en: 'Food Industries Holding Company',
        type: 'subsidiary',
        contact_person: 'مدير عام',
        contact_email: 'info@foodholding.eg',
        contact_phone: '+20-2-12345678',
        address: 'القاهرة، مصر',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name_ar: 'رئاسة الجمهورية',
        name_en: 'Presidency of the Republic',
        type: 'presidency',
        contact_person: 'السكرتير العام',
        contact_email: 'info@presidency.eg',
        contact_phone: '+20-2-87654321',
        address: 'القاهرة، مصر',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name_ar: 'وزارة التجارة والصناعة',
        name_en: 'Ministry of Trade and Industry',
        type: 'government',
        contact_person: 'مدير الإدارة',
        contact_email: 'info@mti.gov.eg',
        contact_phone: '+20-2-11223344',
        address: 'القاهرة، مصر',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name_ar: 'منظمة الأغذية والزراعة',
        name_en: 'Food and Agriculture Organization',
        type: 'external',
        contact_person: 'الممثل الإقليمي',
        contact_email: 'info@fao.org',
        contact_phone: '+39-06-57051',
        address: 'روما، إيطاليا',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('entities', null, {});
  },
};

