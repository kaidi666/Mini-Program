// weekly-plan/pages/meal-config/meal-config.js
const dishStorage = require('../../utils/dish-storage.js')

Page({
  data: {
    darkMode: false,
    mealConfig: [],
    newMealName: ''
  },

  onLoad() {
    this.loadConfig()
  },

  onShow() {
    this.applyTheme()
  },

  loadConfig() {
    const config = dishStorage.getMealConfig()
    // 确保每个餐次都有id
    const configWithIds = config.map((m, index) => ({
      ...m,
      id: m.id || ('meal_' + (index + 1))
    }))
    this.setData({ mealConfig: configWithIds })
  },

  applyTheme() {
    const app = getApp()
    const darkMode = app.globalData.darkMode
    this.setData({ darkMode })

    if (darkMode) {
      wx.setNavigationBarColor({
        backgroundColor: '#1A1A1A',
        frontColor: '#FFFFFF'
      })
    } else {
      wx.setNavigationBarColor({
        backgroundColor: '#FFFFFF',
        frontColor: '#000000'
      })
    }
  },

  onToggleMeal(e) {
    const id = e.currentTarget.dataset.id
    const { mealConfig } = this.data
    const index = mealConfig.findIndex(m => m.id === id)
    if (index !== -1) {
      mealConfig[index].enabled = !mealConfig[index].enabled
      this.setData({ mealConfig })
      dishStorage.updateMealConfig(mealConfig)
    }
  },

  onMoveUp(e) {
    const id = e.currentTarget.dataset.id
    const { mealConfig } = this.data
    const index = mealConfig.findIndex(m => m.id === id)
    if (index > 0) {
      [mealConfig[index - 1], mealConfig[index]] = [mealConfig[index], mealConfig[index - 1]]
      mealConfig.forEach((m, i) => m.order = i + 1)
      this.setData({ mealConfig })
      dishStorage.updateMealConfig(mealConfig)
    }
  },

  onMoveDown(e) {
    const id = e.currentTarget.dataset.id
    const { mealConfig } = this.data
    const index = mealConfig.findIndex(m => m.id === id)
    if (index < mealConfig.length - 1) {
      [mealConfig[index], mealConfig[index + 1]] = [mealConfig[index + 1], mealConfig[index]]
      mealConfig.forEach((m, i) => m.order = i + 1)
      this.setData({ mealConfig })
      dishStorage.updateMealConfig(mealConfig)
    }
  },

  onNewMealInput(e) {
    this.setData({ newMealName: e.detail.value })
  },

  onAddMeal() {
    const { newMealName, mealConfig } = this.data
    if (!newMealName.trim()) {
      wx.showToast({ title: '请输入餐次名称', icon: 'none' })
      return
    }

    // 检查是否已存在
    if (mealConfig.some(m => m.name === newMealName.trim())) {
      wx.showToast({ title: '该餐次已存在', icon: 'none' })
      return
    }

    const newMeal = {
      id: 'meal_' + Date.now(),
      name: newMealName.trim(),
      order: mealConfig.length + 1,
      enabled: true
    }

    mealConfig.push(newMeal)
    this.setData({ mealConfig, newMealName: '' })
    dishStorage.updateMealConfig(mealConfig)
    wx.showToast({ title: '已添加', icon: 'success' })
  }
})
