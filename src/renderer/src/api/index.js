import instance from './instance'
// 用户
const login_pwd = (data) => {
  return instance.post('/login_pwd', data)
}
const getUserInfo = (userId) => {
  return instance.post(`/user/get`, { userId })
}
// contact
const getfriendlist = () => {
  return instance.get('/contact/friends')
}
const getGroupList = () => {
  return instance.get('/contact/groups')
}
// im
const get_im_token = (data) => {
  return instance.post('/get_im_token', data)
}
// msg
const pull_msg = (data) => {
  return instance.post('/messages/pull', data)
}
const get_conversation_list = (data) => {
  return instance.post('/conversation/list', data)
}
const load_remote = (data) => {
  return instance.post('/messages/loadRemote', data)
}
const send_msg = (data) => {
  return instance.post('/messages/send', data)
}
const conversation_with_more_info = (outputConversationItemList) => {
  return instance.post('/messages/aconvmessages', { outputConversationItemList })
}

export default {
  user: {
    login_pwd,
    getUserInfo
  },
  contact: {
    getfriendlist,
    getGroupList
  },
  im: {
    get_im_token
  },
  msg: {
    pull_msg,
    get_conversation_list,
    load_remote,
    send_msg,
    conversation_with_more_info
  }
}
