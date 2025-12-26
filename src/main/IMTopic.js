/**
 * IMTopic常量定义
 * 对应后端win.liyufan.im.IMTopic接口中的所有Topic
 */

export default {
  // 消息相关Topic
  SendMessageTopic: 'MS',
  RobotReplyMessageTopic: 'RRM',
  MultiCastMessageTopic: 'MMC',
  RecallMessageTopic: 'MR',
  RecallMultiCastMessageTopic: 'MRMC',
  DeleteMessageTopic: 'MD',
  UpdateMessageTopic: 'MU',
  MarkMessageReadTopic: 'MMR',
  PullMessageTopic: 'MP',
  NotifyMessageTopic: 'MN',
  NotifyRecallMessageTopic: 'RMN',
  NotifyOffline: 'ROFL',
  BroadcastMessageTopic: 'MBC',

  // 用户设置相关Topic
  GetUserSettingTopic: 'UG',
  PutUserSettingTopic: 'UP',
  NotifyUserSettingTopic: 'UN',

  // 群组相关Topic
  CreateGroupTopic: 'GC',
  AddGroupMemberTopic: 'GAM',
  KickoffGroupMemberTopic: 'GKM',
  QuitGroupTopic: 'GQ',
  DismissGroupTopic: 'GD',
  ModifyGroupInfoTopic: 'GMI',
  ModifyGroupAliasTopic: 'GMA',
  ModifyGroupMemberAliasTopic: 'GMMA',
  ModifyGroupMemberExtraTopic: 'GMME',
  GetGroupInfoTopic: 'GPGI',
  GetGroupMemberTopic: 'GPGM',
  TransferGroupTopic: 'GTG',
  SetGroupManagerTopic: 'GSM',
  GetMyGroupsTopic: 'GMGS',
  GetCommonGroupsTopic: 'GCGS',

  // 用户信息相关Topic
  GetUserInfoTopic: 'UPUI',
  ModifyMyInfoTopic: 'MMI',
  NotifyUserInfoTopic: 'UIN',

  // 七牛云上传Token
  GetQiniuUploadTokenTopic: 'GQNUT',

  // 好友相关Topic
  AddFriendRequestTopic: 'FAR',
  HandleFriendRequestTopic: 'FHR',
  FriendRequestPullTopic: 'FRP',
  NotifyFriendRequestTopic: 'FRN',
  RriendRequestUnreadSyncTopic: 'FRUS',
  DeleteFriendTopic: 'FDL',
  FriendPullTopic: 'FP',
  NotifyFriendTopic: 'FN',
  BlackListUserTopic: 'BLU',
  SetFriendAliasTopic: 'FALS',

  // 设备Token上传
  UploadDeviceTokenTopic: 'UDT',

  // 用户搜索
  UserSearchTopic: 'US',

  // 聊天室相关Topic
  JoinChatroomTopic: 'CRJ',
  QuitChatroomTopic: 'CRQ',
  GetChatroomInfoTopic: 'CRI',
  GetChatroomMemberTopic: 'CRMI',

  // 路由Topic
  RouteTopic: 'ROUTE',

  // 频道相关Topic
  CreateChannelTopic: 'CHC',
  ModifyChannelInfoTopic: 'CHMI',
  TransferChannelInfoTopic: 'CHT',
  DestroyChannelInfoTopic: 'CHD',
  ChannelSearchTopic: 'CHS',
  ChannelListenTopic: 'CHL',
  ChannelPullTopic: 'CHP',
  ListenedChannelListTopic: 'CHLL',

  // Token相关Topic
  GetTokenTopic: 'GETTOKEN',
  DestroyUserTopic: 'DESTROYUSER',

  // 历史消息加载
  LoadRemoteMessagesTopic: 'LRM',

  // 踢出PC客户端
  KickoffPCClientTopic: 'KPCC',

  // 清理会话（退出登录）
  ClearSessionTopic: 'CST',

  // 应用Token请求
  GetApplicationTokenRequestTopic: 'ATR',
  ApplicationConfigRequestTopic: 'ACR'
}
