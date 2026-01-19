import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface PermissionAttributes {
  id: number;
  name: string;
  name_ar: string;
  resource: string;
  action: string;
  description?: string;
  description_ar?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

interface PermissionCreationAttributes extends Partial<PermissionAttributes> {}

class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
  public id!: number;
  public name!: string;
  public name_ar!: string;
  public resource!: string;
  public action!: string;
  public description?: string;
  public description_ar?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public deleted_at?: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    name_ar: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    description_ar: {
      type: DataTypes.TEXT,
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
    tableName: 'permissions',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['resource', 'action'] },
    ],
  }
);

export default Permission;

