import sequelize from '../config/database';
import User from './User';
import Role from './Role';
import Permission from './Permission';
import RolePermission from './RolePermission';
import Entity from './Entity';
import Correspondence from './Correspondence';
import CorrespondenceReply from './CorrespondenceReply';
import Attachment from './Attachment';
import StatusHistory from './StatusHistory';
import AuditLog from './AuditLog';

// Define associations
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});

Correspondence.belongsTo(Entity, { foreignKey: 'sender_entity_id', as: 'senderEntity' });
Correspondence.belongsTo(Entity, { foreignKey: 'receiver_entity_id', as: 'receiverEntity' });
Correspondence.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Correspondence.hasMany(CorrespondenceReply, { foreignKey: 'correspondence_id', as: 'replies' });
Correspondence.hasMany(Attachment, { foreignKey: 'correspondence_id', as: 'attachments' });
Correspondence.hasMany(StatusHistory, { foreignKey: 'correspondence_id', as: 'statusHistory' });

CorrespondenceReply.belongsTo(Correspondence, { foreignKey: 'correspondence_id', as: 'correspondence' });
CorrespondenceReply.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
CorrespondenceReply.belongsTo(CorrespondenceReply, { foreignKey: 'parent_reply_id', as: 'parentReply' });
CorrespondenceReply.hasMany(CorrespondenceReply, { foreignKey: 'parent_reply_id', as: 'childReplies' });

Attachment.belongsTo(Correspondence, { foreignKey: 'correspondence_id', as: 'correspondence' });

StatusHistory.belongsTo(Correspondence, { foreignKey: 'correspondence_id', as: 'correspondence' });
StatusHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'changedBy' });

AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Export models
export {
  User,
  Role,
  Permission,
  RolePermission,
  Entity,
  Correspondence,
  CorrespondenceReply,
  Attachment,
  StatusHistory,
  AuditLog,
};

// Re-export sequelize from config
export { default as sequelize } from '../config/database';

