import instance from './instance'
// 用户
const login_pwd = (data) => {
  return instance.post('/login_pwd', data)
}
// contact
const getfriendlist = () => {
  return instance.post('/contact/friends')
}
// im
const get_im_token = (data) => {
  return instance.post('/get_im_token', data)
}

export default {
  user: {
    login_pwd
  },
  contact: {
    getfriendlist
  },
  im: {
    get_im_token
  }
}
