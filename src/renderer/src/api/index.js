import instance from './instance'
// 用户
const login_pwd = (data) => {
  return instance.post('/login_pwd', data)
}
const getUserInfo = (userId) => {
  return instance.post(`/user/get`, { userId })
}
const searchUser = (data) => {
  return instance.post('/user/search', data)
}
const sendAddFriendRequest = (data) => {
  return instance.post('/friend/sendRequest', data)
}
const getUserOnlineStatus = (userId) => {
  return instance.post('/getUserOnlineStatusWithTime', null, { params: { userId } })
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
const recall_msg = (messageUid) => {
  return instance.post('/messages/recall', { messageUid })
}
const batch_mark_read = (data) => {
  return instance.post('/messages/batch_mark_read', data)
}
const update_msg = (data) => {
  return instance.post('/messages/update', data)
}
const send_file_msg = (data) => {
  return instance.post('/messages/send_file', data)
}
const delete_msg = (messageUid) => {
  return instance.post('/messages/delete', { messageUid })
}
const send_voice_msg = (data) => {
  return instance.post('/messages/send_voice', data)
}
const send_quote_msg = (data) => {
  return instance.post('/messages/send_quote', data)
}
const get_msg_detail = (messageUid) => {
  return instance.post('/messages/detail', { messageUid })
}
// upload
const upload_media = (media_type, file, handleProgress = null) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('media_type', media_type)
  return instance.post(`/media/upload/${media_type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (handleProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        handleProgress(percentCompleted)
      }
    }
  })
}
const upload_files = (userId, file, handleProgress = null) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('userId', userId)
  return instance.post(`/logs/${userId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (handleProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        handleProgress(percentCompleted)
      }
    }
  })
}
const upload_file_v2 = (file, handleProgress = null) => {
  const formData = new FormData()
  formData.append('file', file)
  return instance.post('/uploadConversationFile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (handleProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        handleProgress(percentCompleted)
      }
    }
  })
}
export default {
  user: {
    login_pwd,
    getUserInfo,
    searchUser,
    sendAddFriendRequest,
    getUserOnlineStatus
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
    conversation_with_more_info,
    recall_msg,
    batch_mark_read,
    update_msg,
    send_file_msg,
    delete_msg,
    send_voice_msg,
    send_quote_msg,
    get_msg_detail
  },
  upload: {
    upload_media,
    upload_files,
    upload_file_v2
  }
}
