App({
  globalData: {
    darkMode: false
  },

  onLaunch() {
    // 加载用户设置
    this.loadSettings()
  },

  loadSettings() {
    const settings = wx.getStorageSync('settings')
    if (settings && settings.darkMode !== undefined) {
      this.globalData.darkMode = settings.darkMode
    }
  },

  setDarkMode(enabled) {
    this.globalData.darkMode = enabled
    wx.setStorageSync('settings', { darkMode: enabled })
  }
})
