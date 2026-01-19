import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface AuditLogAttributes {
  id: number;
  user_id: number;
  action: string;
  resource: string;
  resource_id?: number;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

interface AuditLogCreationAttributes extends Partial<AuditLogAttributes> {}

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: number;
  public user_id!: number;
  public action!: string;
  public resource!: string;
  public resource_id?: number;
  public details?: string;
  public ip_address?: string;
  public user_agent?: string;
  public readonly created_at!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    resource_id: {
      type: DataTypes.INTEGER,
    },
    details: {
      type: DataTypes.TEXT,
    },
    ip_address: {
      type: DataTypes.STRING(45),
    },
    user_agent: {
      type: DataTypes.STRING(500),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['resource', 'resource_id'] },
      { fields: ['action'] },
      { fields: ['created_at'] },
    ],
  }
);

export default AuditLog;

