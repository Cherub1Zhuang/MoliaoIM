/**
 * ProtoConstants常量定义
 * 对应后端cn.wildfirechat.proto.ProtoConstants中的所有常量
 */

const ProtoConstants = {
  // 会话类型
  ConversationType: {
    ConversationType_Private: 0, // 私聊
    ConversationType_Group: 1, // 群聊
    ConversationType_ChatRoom: 2, // 聊天室
    ConversationType_Channel: 3, // 频道
    ConversationType_Things: 4, // 物联网
    ConversationType_SecretChat: 5 // 密聊
  },

  // 群组类型
  GroupType: {
    GroupType_Normal: 0, // 普通群
    GroupType_Free: 1, // 自由群
    GroupType_Restricted: 2, // 受限群
    GroupType_Organization: 3 // 组织群
  },

  // 群成员类型
  GroupMemberType: {
    GroupMemberType_Normal: 0, // 普通成员
    GroupMemberType_Manager: 1, // 管理员
    GroupMemberType_Owner: 2, // 群主
    GroupMemberType_Silent: 3, // 禁言
    GroupMemberType_Removed: 4, // 已移除
    GroupMemberType_Allowed: 5 // 允许
  },

  // 好友请求状态
  FriendRequestStatus: {
    RequestStatus_Sent: 0, // 已发送
    RequestStatus_Accepted: 1, // 已接受
    RequestStatus_Rejected: 2 // 已拒绝
  },

  // 平台类型
  Platform: {
    Platform_UNSET: 0,
    Platform_iOS: 1,
    Platform_Android: 2,
    Platform_Windows: 3,
    Platform_OSX: 4,
    Platform_WEB: 5,
    Platform_WX: 6,
    Platform_LINUX: 7,
    Platform_iPad: 8,
    Platform_APad: 9,
    Platform_Harmony: 10,
    Platform_HarmonyPad: 11,
    Platform_HarmonyPC: 12,
    Platform_MAX: 12
  },

  // 拉取类型
  PullType: {
    Pull_Normal: 0, // 普通消息
    Pull_ChatRoom: 1, // 聊天室消息
    Pull_Group: 2 // 群组消息
  },

  // 用户结果码
  UserResultCode: {
    Success: 0,
    NotFound: 1,
    NotModified: 2
  },

  // 聊天室状态
  ChatroomState: {
    Chatroom_State_Normal: 0, // 正常
    Chatroom_State_NotStart: 1, // 未开始
    Chatroom_State_End: 2 // 已结束
  },

  // 消息内容类型
  ContentType: {
    Unknown: 0,
    Text: 1, // 文本
    Voice: 2, // 语音
    Image: 3, // 图片
    Location: 4, // 位置
    File: 5, // 文件
    Video: 6, // 视频
    Sticker: 7, // 表情
    Link: 8, // 链接
    P_TEXT: 9, // 富文本
    Name_Card: 10, // 名片
    Composited: 11, // 复合消息
    Rich_Notification: 12, // 富通知
    Articles: 13, // 文章
    StreamingText_Generationg: 14, // 流式文本生成中
    StreamingText_Generated: 15, // 流式文本已生成
    Not_Delivered: 16, // 未送达
    Ptt_Voice: 23, // PTT语音
    Enter_Channel_Chat: 71, // 进入频道聊天
    Leave_Channel_Chat: 72, // 离开频道聊天
    Recall: 80, // 撤回
    Delete: 81, // 删除
    Tip: 90, // 提示
    Typing: 91, // 正在输入
    Friend_Greeting: 92, // 好友问候
    Friend_Added: 93, // 好友已添加
    PC_Login_Request: 94, // PC登录请求
    Create_Group: 104, // 创建群组
    Add_Group_Member: 105, // 添加群成员
    Kickoff_Group_Member: 106, // 踢出群成员
    Quit_Group: 107, // 退出群组
    Dismiss_Group: 108, // 解散群组
    Transfer_Group_Owner: 109, // 转移群主
    Change_Group_Name: 110, // 修改群名称
    Modify_Group_Alias: 111, // 修改群别名
    Change_Group_Portrait: 112, // 修改群头像
    Change_Group_Mute: 113, // 修改群禁言
    Change_Group_JoinType: 114, // 修改群加入类型
    Change_Group_PrivateChat: 115, // 修改群私聊
    Change_Group_Searchable: 116, // 修改群可搜索
    Set_Group_Manager: 117, // 设置群管理员
    Mute_Group_Member: 118, // 禁言群成员
    Allow_Group_Member: 119, // 允许群成员
    Kickoff_Group_Member_Visible_Notification: 120, // 踢出群成员可见通知
    Quit_Group_Visible_Notification: 121, // 退出群组可见通知
    Modify_Group_Extra: 122, // 修改群扩展信息
    Modify_Group_Member_Extra: 123, // 修改群成员扩展信息
    Call_Start: 400, // 开始通话
    Call_Accept: 401, // 接受通话
    Call_End: 402, // 结束通话
    Call_Add_Participant: 406, // 添加通话参与者
    Call_Multi_Call_Ongoing: 416 // 多方通话进行中
  },

  // 消息持久化标志
  MessagePersistFlag: {
    NOT_PERSIST: 0, // 不持久化
    PERSIST: 1, // 持久化
    PERSIST_AND_COUNT: 3, // 持久化并计数
    TRANSPARENT: 4 // 透明
  },

  // 消息媒体类型
  MessageMediaType: {
    GENERAL: 0, // 通用
    IMAGE: 1, // 图片
    VOICE: 2, // 语音
    VIDEO: 3, // 视频
    FILE: 4, // 文件
    PORTRAIT: 5, // 头像
    FAVORITE: 6, // 收藏
    STICKER: 7, // 表情
    MOMENTS: 8 // 朋友圈
  },

  // 修改群组信息类型
  ModifyGroupInfoType: {
    Modify_Group_Name: 0, // 修改群名称
    Modify_Group_Portrait: 1, // 修改群头像
    Modify_Group_Extra: 2, // 修改群扩展信息
    Modify_Group_Mute: 3, // 修改群禁言
    Modify_Group_JoinType: 4, // 修改群加入类型
    Modify_Group_PrivateChat: 5, // 修改群私聊
    Modify_Group_Searchable: 6, // 修改群可搜索
    Modify_Group_History_Message: 7, // 修改群历史消息
    Modify_Group_Max_Member_Count: 8, // 修改群最大成员数
    Modify_Group_Super_Group: 9, // 修改超级群
    Modify_Group_Type: 10 // 修改群类型
  },

  // 持久化标志
  PersistFlag: {
    Not_Persist: 0, // 不持久化
    Persist: 1, // 持久化
    Persist_And_Count: 3, // 持久化并计数
    Transparent: 4 // 透明
  },

  // 修改频道信息类型
  ModifyChannelInfoType: {
    Modify_Channel_Name: 0, // 修改频道名称
    Modify_Channel_Portrait: 1, // 修改频道头像
    Modify_Channel_Desc: 2, // 修改频道描述
    Modify_Channel_Extra: 3, // 修改频道扩展信息
    Modify_Channel_Secret: 4, // 修改频道密钥
    Modify_Channel_Callback: 5, // 修改频道回调
    Modify_Channel_OnlyCallback: 6, // 修改频道仅回调
    Modify_Channel_Menu: 7 // 修改频道菜单
  },

  // 频道状态
  ChannelState: {
    Channel_State_Mask_FullInfo: 0x01, // 允许查看所有信息
    Channel_State_Mask_Unsubscribed_User_Access: 0x02, // 允许查看非订阅用户信息
    Channel_State_Mask_Active_Subscribe: 0x04, // 允许主动添加订阅关系
    Channel_State_Mask_Message_Unsubscribed: 0x08, // 允许给非订阅用户发送消息
    Channel_State_Mask_Private: 0x10, // 私有频道
    Channel_State_Mask_Deleted: 0x40, // 已删除
    Channel_State_Mask_Global: 0x80 // 全局频道
  },

  // 用户类型
  UserType: {
    UserType_Normal: 0, // 普通用户
    UserType_Robot: 1, // 机器人
    UserType_Device: 2, // 设备
    UserType_Admin: 3, // 管理员
    UserType_Super_Admin: 100 // 超级管理员
  },

  // 系统设置类型
  SystemSettingType: {
    Group_Max_Member_Count: 1, // 群最大成员数
    NOT_ALLOW_USER_NAMES: 2 // 不允许用户名
  },

  // 搜索用户类型
  SearchUserType: {
    SearchUserType_General: 0, // 通用搜索
    SearchUserType_Name_Mobile: 1, // 姓名和手机号
    SearchUserType_Name: 2, // 姓名
    SearchUserType_Mobile: 3, // 手机号
    SearchUserType_UserId: 4, // 用户ID
    SearchUserType_Name_Mobile_UserId: 5, // 姓名、手机号和用户ID
    SearchUserType_Name_Mobile_DisplayName: 100 // 姓名、手机号和显示名
  },

  // 用户搜索用户类型
  UserSearchUserType: {
    UserSearchUserType_ALL: 0, // 全部
    UserSearchUserType_ONLY_USER: 1, // 仅用户
    UserSearchUserType_ONLY_ROBOT: 2 // 仅机器人
  },

  // 禁用搜索掩码
  DisableSearchMask: {
    DisableSearchDisplayNameMask: 1, // 禁用显示名搜索
    DisableSearchNameMask: 2, // 禁用姓名搜索
    DisableSearchMobileMask: 4, // 禁用手机号搜索
    DisableSearchUserIdMask: 8 // 禁用用户ID搜索
  },

  // 用户状态
  UserStatus: {
    Normal: 0, // 正常
    Muted: 1, // 禁言
    Forbidden: 2 // 封禁
  },

  // 黑名单策略
  BlacklistStrategy: {
    Message_Reject: 0, // 消息拒绝
    Message_Ignore: 1 // 消息忽略
  },

  // 群组更新事件类型
  GroupUpdateEventType: {
    Group_Event_Create: 0, // 创建
    Group_Event_Update: 1, // 更新
    Group_Event_Transfer: 2, // 转移
    Group_Event_Mute: 3, // 禁言
    Group_Event_Unmute: 4, // 取消禁言
    Group_Event_Destroy: 5 // 销毁
  },

  // 群成员更新事件类型
  GroupMemberUpdateEventType: {
    Group_Member_Event_Join: 0, // 加入
    Group_Member_Event_Leave: 1, // 离开
    Group_Member_Event_Kickoff: 2, // 踢出
    Group_Member_Event_Type_Update: 3, // 类型更新
    Group_Member_Event_Alias: 4, // 别名
    Group_Member_Event_Extra: 5 // 扩展信息
  },

  // 频道更新事件类型
  ChannelUpdateEventType: {
    Channel_Event_Create: 0, // 创建
    Channel_Event_Update: 1, // 更新
    Channel_Event_Transfer: 2, // 转移
    Channel_Event_Destroy: 3 // 销毁
  },

  // 聊天室更新事件类型
  ChatroomUpdateEventType: {
    Chatroom_Event_Create: 0, // 创建
    Chatroom_Event_Destroy: 1 // 销毁
  },

  // 聊天室成员更新事件类型
  ChatroomMemberUpdateEventType: {
    Chatroom_Member_Event_Join: 0, // 加入
    Chatroom_Member_Event_Leave: 1, // 离开
    Chatroom_Member_Event_Kickoff: 2, // 踢出
    Chatroom_Member_Event_Mute: 3, // 禁言
    Chatroom_Member_Event_Unmute: 4 // 取消禁言
  },

  // 更新用户信息掩码
  UpdateUserInfoMask: {
    Update_User_DisplayName: 0x01, // 更新显示名
    Update_User_Portrait: 0x02, // 更新头像
    Update_User_Gender: 0x04, // 更新性别
    Update_User_Mobile: 0x08, // 更新手机号
    Update_User_Email: 0x10, // 更新邮箱
    Update_User_Address: 0x20, // 更新地址
    Update_User_Company: 0x40, // 更新公司
    Update_User_Social: 0x80, // 更新社交账号
    Update_User_Extra: 0x100, // 更新扩展信息
    Update_User_Name: 0x200 // 更新姓名
  },

  // 请求来源类型
  RequestSourceType: {
    Request_From_User: 0, // 来自用户
    Request_From_Admin: 1, // 来自管理员
    Request_From_Robot: 2, // 来自机器人
    Request_From_Channel: 3 // 来自频道
  },

  // 应用类型
  ApplicationType: {
    ApplicationType_Robot: 0, // 机器人
    ApplicationType_Channel: 1, // 频道
    ApplicationType_Admin: 2 // 管理员
  },

  // 禁止客户端群操作掩码
  ForbiddenClientGroupOperationMask: {
    Forbidden_Create_Group: 0x01, // 禁止创建群组
    Forbidden_Dismiss_Group: 0x02, // 禁止解散群组
    Forbidden_Join_Group: 0x04, // 禁止加入群
    Forbidden_Quit_Group: 0x08, // 禁止退出群
    Forbidden_Invite_Group_Member: 0x10, // 禁止邀请群成员
    Forbidden_Kickoff_Group_Member: 0x20, // 禁止踢出群成员
    Forbidden_Transfer_Group: 0x40, // 禁止转移群
    Forbidden_Set_Group_Manage: 0x80, // 禁止设置群管理员
    Forbidden_Allow_Group_Member: 0x100, // 禁止允许群成员
    Forbidden_Mute_Group: 0x200, // 禁止群禁言
    Forbidden_Modify_Group_Info: 0x400, // 禁止修改群组信息
    Forbidden_Mute_Group_Member: 0x800 // 禁止群成员禁言
  },

  // 朋友圈内容类型
  MomentsContentType: {
    Moments_Content_Text_Type: 0, // 文本
    Moments_Content_Image_Type: 1, // 图片
    Moments_Content_Video_Type: 2, // 视频
    Moments_Content_Link_Type: 3 // 链接
  },

  // 朋友圈评论类型
  MomentsCommentType: {
    Moments_Comment_Text_Type: 0, // 文本
    Moments_Comment_Thumbup_Type: 1 // 点赞
  },

  // 朋友圈可见范围
  MomentsVisibleScope: {
    Moments_VisibleScope_NoLimit: 0, // 无限制
    Moments_VisibleScope_3Days: 1, // 3天
    Moments_VisibleScope_1Month: 2, // 1个月
    Moments_VisibleScope_6Months: 3 // 6个月
  },

  // 消息内容类型常量（用于快速访问）
  MESSAGE_CONTENT_TYPE_CREATE_GROUP: 104,
  MESSAGE_CONTENT_TYPE_ADD_GROUP_MEMBER: 105,
  MESSAGE_CONTENT_TYPE_KICKOF_GROUP_MEMBER: 106,
  MESSAGE_CONTENT_TYPE_QUIT_GROUP: 107,
  MESSAGE_CONTENT_TYPE_DISMISS_GROUP: 108,
  MESSAGE_CONTENT_TYPE_TRANSFER_GROUP_OWNER: 109,
  MESSAGE_CONTENT_TYPE_CHANGE_GROUP_NAME: 110,
  MESSAGE_CONTENT_TYPE_MODIFY_GROUP_ALIAS: 111,
  MESSAGE_CONTENT_TYPE_CHANGE_GROUP_PORTRAIT: 112,
  MESSAGE_CONTENT_TYPE_CHANGE_MUTE: 113,
  MESSAGE_CONTENT_TYPE_CHANGE_JOINTYPE: 114,
  MESSAGE_CONTENT_TYPE_CHANGE_PRIVATECHAT: 115,
  MESSAGE_CONTENT_TYPE_CHANGE_SEARCHABLE: 116,
  MESSAGE_CONTENT_TYPE_SET_MANAGER: 117,
  MESSAGE_CONTENT_TYPE_MUTE_MEMBER: 118,
  MESSAGE_CONTENT_TYPE_ALLOW_MEMBER: 119,
  MESSAGE_CONTENT_TYPE_KICKOF_GROUP_MEMBER_VISIBLE: 120,
  MESSAGE_CONTENT_TYPE_QUIT_GROUP_VISIBLE: 121,
  MESSAGE_CONTENT_TYPE_MODIFY_GROUP_EXTRA: 122,
  MESSAGE_CONTENT_TYPE_MODIFY_GROUP_MEMBER_EXTRA: 123,
  MESSAGE_CONTENT_TYPE_MODIFY_GROUP_SETTINGS: 124,
  MESSAGE_CONTENT_TYPE_REJECT_JOIN_GROUP: 125
}
