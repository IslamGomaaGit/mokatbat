import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface StatusHistoryAttributes {
  id: number;
  correspondence_id: number;
  old_status: string;
  new_status: string;
  changed_by: number;
  notes?: string;
  created_at?: Date;
}

interface StatusHistoryCreationAttributes extends Partial<StatusHistoryAttributes> {}

class StatusHistory extends Model<StatusHistoryAttributes, StatusHistoryCreationAttributes> implements StatusHistoryAttributes {
  public id!: number;
  public correspondence_id!: number;
  public old_status!: string;
  public new_status!: string;
  public changed_by!: number;
  public notes?: string;
  public readonly created_at!: Date;
}

StatusHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    correspondence_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'correspondences',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    old_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    new_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    notes: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'status_history',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['correspondence_id'] },
      { fields: ['changed_by'] },
      { fields: ['created_at'] },
    ],
  }
);

export default StatusHistory;

