const app = getApp();
const util = require('../../utils/util.js');

// pages/create.js
Page({
  data: {
    htmlCode: '',
    originCode: '',
    height: app.globalData.screenHeight,
    title: '',
    focus: false,
    value: '',
    height: '' //data里面增加height属性
  },
  onShow: function () {
    var that = this;

    let id = "#textareawrap";
    let query = wx.createSelectorQuery();//创建查询对象
    query.select(id).boundingClientRect();//获取view的边界及位置信息
    query.exec(function (res) {
      that.setData({
        height: res[0].height + "px"
      });
    });

    try {
      var draft_code = wx.getStorageSync('draft_code');
      if (draft_code) {
        draft_code = JSON.parse(draft_code);
        if (draft_code.title) {
          this.setData({
            title: draft_code.title
          });
        }
        this.setData({
          originCode: util.clearCode(draft_code.code)
        })
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  bindButtonTap: function () {
    this.setData({
      focus: true
    })
  },
  bindTextAreaBlur: function (e) {
    console.log(e.detail.value)
  },
  emptyTextArea: function (e) {
    this.setData({
      originCode: ''
    })
  },
  bindKeyInput: function (e) {
    console.log(e);
    this.setData({
      title: e.detail.value
    })
  },
  bindFormSubmit: function (e) {
    var that = this;
    //发起网络请求
    console.log(this.data.title, e.detail.value.textarea);
    if (!this.data.title || !e.detail.value.textarea) {
      return wx.showModal({
        title: '提示',
        content: '请填写标题或者代码',
        success: function (res) {

        }
      })
    }
    wx.showLoading({
      title: '创建中',
    })
    wx.request({
      url: 'https://code.wdsm.io/',
      method: 'POST',
      data: {
        title: this.data.title,
        user_id: app.globalData.openid,
        code: '```\n' + e.detail.value.textarea + '\n```'
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.removeStorageSync("draft_code");
        wx.navigateTo({
          url: '/pages/code/code?rowId=' + res.data.id
        })
        that.setData({
          title: '',
          originCode: ''
        })
      },
      fail: function (error) {
        return wx.showModal({
          title: '创建失败',
          content: JSON.stringify(error)
        })

      },
      complete: function () {
        wx.hideLoading();
      }
    })
  }
});
