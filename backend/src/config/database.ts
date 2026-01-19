import { Sequelize } from 'sequelize';

// Note: dotenv.config() should be called before this module is imported
const dbStorage = process.env.DB_STORAGE || './database.sqlite';

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbStorage,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Export as default
export default sequelize;

