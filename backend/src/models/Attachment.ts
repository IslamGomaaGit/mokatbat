import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface AttachmentAttributes {
  id: number;
  correspondence_id: number;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

interface AttachmentCreationAttributes extends Partial<AttachmentAttributes> {}

class Attachment extends Model<AttachmentAttributes, AttachmentCreationAttributes> implements AttachmentAttributes {
  public id!: number;
  public correspondence_id!: number;
  public file_name!: string;
  public original_name!: string;
  public file_path!: string;
  public file_size!: number;
  public mime_type!: string;
  public uploaded_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public deleted_at?: Date;
}

Attachment.init(
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
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    tableName: 'attachments',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ['correspondence_id'] },
      { fields: ['uploaded_by'] },
    ],
  }
);

export default Attachment;

