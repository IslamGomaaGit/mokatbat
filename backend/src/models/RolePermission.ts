import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface RolePermissionAttributes {
  id: number;
  role_id: number;
  permission_id: number;
  created_at?: Date;
  updated_at?: Date;
}

class RolePermission extends Model<RolePermissionAttributes> implements RolePermissionAttributes {
  public id!: number;
  public role_id!: number;
  public permission_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RolePermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['role_id', 'permission_id'] },
    ],
  }
);

export default RolePermission;

