export const MessageTypes = {
  Unknown: 0,
  TEXT: 1,
  Voice: 2, // 语音
  IMAGE: 3, // 图片
  Location: 4, // 位置
  FILE: 5,
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
  Multiple: 30, //多图文
  Enter_Channel_Chat: 71, // 进入频道聊天
  Leave_Channel_Chat: 72, // 离开频道聊天
  Recall: 80, // 撤回
  Delete: 81, // 删除
  Tip: 90, // 提示
  Typing: 91, // 正在输入
  HELLO: 92,
  YOUAREFRIENDS: 93,
  PC_Login_Request: 94, // PC登录请求
  CREATEGROUP: 104,
  INVITETOGROUP: 105,
  REMOVEFROMGROUP: 106,
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
}
// 消息媒体类型
export const MessageMediaType = {
  GENERAL: 0, // 通用
  IMAGE: 1, // 图片
  VOICE: 3, // 语音
  VIDEO: 2, // 视频
  FILE: 4, // 文件
  PORTRAIT: 5, // 头像
  FAVORITE: 6, // 收藏
  STICKER: 7, // 表情
  MOMENTS: 8 // 朋友圈
}
