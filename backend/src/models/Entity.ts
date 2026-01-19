import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface EntityAttributes {
  id: number;
  name_ar: string;
  name_en: string;
  type: 'subsidiary' | 'presidency' | 'government' | 'external';
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

interface EntityCreationAttributes extends Partial<EntityAttributes> {}

class Entity extends Model<EntityAttributes, EntityCreationAttributes> implements EntityAttributes {
  public id!: number;
  public name_ar!: string;
  public name_en!: string;
  public type!: 'subsidiary' | 'presidency' | 'government' | 'external';
  public contact_person?: string;
  public contact_email?: string;
  public contact_phone?: string;
  public address?: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public deleted_at?: Date;
}

Entity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name_ar: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    name_en: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('subsidiary', 'presidency', 'government', 'external'),
      allowNull: false,
    },
    contact_person: {
      type: DataTypes.STRING(200),
    },
    contact_email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true,
      },
    },
    contact_phone: {
      type: DataTypes.STRING(50),
    },
    address: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: 'entities',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ['type'] },
      { fields: ['is_active'] },
    ],
  }
);

export default Entity;

