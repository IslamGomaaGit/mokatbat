import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface CorrespondenceReplyAttributes {
  id: number;
  correspondence_id: number;
  parent_reply_id?: number;
  subject: string;
  body: string;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

interface CorrespondenceReplyCreationAttributes extends Partial<CorrespondenceReplyAttributes> {}

class CorrespondenceReply extends Model<CorrespondenceReplyAttributes, CorrespondenceReplyCreationAttributes> implements CorrespondenceReplyAttributes {
  public id!: number;
  public correspondence_id!: number;
  public parent_reply_id?: number;
  public subject!: string;
  public body!: string;
  public created_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public deleted_at?: Date;
}

CorrespondenceReply.init(
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
    parent_reply_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'correspondence_replies',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_by: {
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
    tableName: 'correspondence_replies',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ['correspondence_id'] },
      { fields: ['parent_reply_id'] },
      { fields: ['created_by'] },
    ],
  }
);

export default CorrespondenceReply;

