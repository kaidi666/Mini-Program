const storage = require('../../utils/storage.js')
const util = require('../../utils/util.js')

Page({
  data: {
    darkMode: false
  },

  onLoad() {
    this.loadSettings()
  },

  onShow() {
    this.applyTheme()
  },

  loadSettings() {
    const settings = storage.getSettings()
    this.setData({ darkMode: settings.darkMode })
  },

  onDarkModeChange(e) {
    const darkMode = e.detail.value

    // 保存设置
    storage.saveSettings({ darkMode })

    // 更新全局数据
    const app = getApp()
    app.setDarkMode(darkMode)

    // 更新页面数据
    this.setData({ darkMode })

    // 应用主题
    this.applyTheme()

    util.showSuccess(darkMode ? '已切换到深色模式' : '已切换到浅色模式')
  },

  applyTheme() {
    const app = getApp()
    const darkMode = app.globalData.darkMode

    // 设置页面容器class
    this.setData({ darkMode })

    if (darkMode) {
      wx.setNavigationBarColor({
        backgroundColor: '#1A1A1A',
        frontColor: '#FFFFFF'
      })
      wx.setTabBarStyle({
        backgroundColor: '#1A1A1A',
        borderStyle: 'white'
      })
      // 设置页面背景色
      wx.setPageStyle({
        style: {
          backgroundColor: '#1A1A1A'
        }
      })
    } else {
      wx.setNavigationBarColor({
        backgroundColor: '#FFFFFF',
        frontColor: '#000000'
      })
      wx.setTabBarStyle({
        backgroundColor: '#FFFFFF',
        borderStyle: 'black'
      })
      wx.setPageStyle({
        style: {
          backgroundColor: '#F5F5F5'
        }
      })
    }
  },

  onClearData() {
    util.showConfirm({
      title: '清除数据',
      content: '确定要清除所有数据吗？此操作不可恢复。'
    }).then(confirm => {
      if (confirm) {
        storage.clearAllData()
        util.showSuccess('数据已清除')

        // 重新初始化
        storage.initCurrentWeek()
      }
    })
  }
})
