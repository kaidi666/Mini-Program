// weekly-plan/pages/menu/menu.js
const dishStorage = require('../../utils/dish-storage.js')
const weekUtil = require('../../utils/week.js')
const util = require('../../utils/util.js')

const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']
const MEAL_ICONS = {
  '早餐': '🌅',
  '午餐': '🍱',
  '晚餐': '🌙',
  '下午茶': '🍰',
  '夜宵': '🍢'
}

Page({
  data: {
    darkMode: false,
    weekInfo: {
      weekNumber: 1,
      dateRange: ''
    },
    weekDays: [],
    currentDate: '',
    enabledMeals: [],
    allDishes: [],
    allTags: dishStorage.DEFAULT_TAGS,
    showDishPicker: false,
    showTagPicker: false,
    showDishModal: false,
    selectedTags: [],
    selectedMeal: '',
    editingDish: null,
    currentMealContext: null
  },

  onLoad() {
    dishStorage.initDishes()
    dishStorage.initMealConfig()
    this.initData()
  },

  onShow() {
    this.loadDayMenu()
    this.applyTheme()
  },

  initData() {
    const weekData = dishStorage.initCurrentMenuWeek()
    const weekNumber = weekUtil.getWeekNumber(new Date(weekData.startDate))

    // 生成日期列表 - days 是一个对象，键为日期字符串
    const weekDays = Object.keys(weekData.days).map(dateStr => {
      const date = new Date(dateStr)
      return {
        date: dateStr,
        weekday: '周' + WEEKDAY_NAMES[date.getDay()],
        day: date.getDate()
      }
    })

    // 默认选中今天
    const today = weekUtil.formatDate(new Date())

    this.setData({
      weekInfo: {
        weekNumber,
        dateRange: weekUtil.formatDateRange(weekData.startDate, weekData.endDate)
      },
      weekDays,
      currentDate: today
    })

    this.loadDayMenu()
  },

  loadDayMenu() {
    const { currentDate } = this.data
    const weekData = dishStorage.getCurrentMenuWeek()
    const allDishes = dishStorage.getDishes()
    const meals = dishStorage.getEnabledMeals()

    // 获取当天的菜谱数据
    let dayMeals = null
    if (weekData && weekData.days && weekData.days[currentDate]) {
      dayMeals = weekData.days[currentDate]
    }

    // 组装餐次数据
    const enabledMeals = meals.map(meal => {
      let dishes = []
      if (dayMeals && dayMeals[meal.name]) {
        const dishIds = dayMeals[meal.name]
        dishes = dishIds
          .map(id => allDishes.find(d => d.id === id))
          .filter(Boolean)
      }
      return {
        ...meal,
        icon: MEAL_ICONS[meal.name] || '🍽️',
        dishes
      }
    })

    this.setData({
      enabledMeals,
      allDishes
    })
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

  onDateSelect(e) {
    const date = e.currentTarget.dataset.date
    this.setData({ currentDate: date })
    this.loadDayMenu()
  },

  onAddDish(e) {
    const { date, mealName } = e.detail
    this.setData({
      showDishPicker: true,
      currentMealContext: { date, mealName }
    })
  },

  closeDishPicker() {
    this.setData({ showDishPicker: false })
  },

  onSelectDish(e) {
    const dishId = e.currentTarget.dataset.id
    const { currentMealContext } = this.data

    // 获取当前餐次的菜品列表
    const weekData = dishStorage.getCurrentMenuWeek()
    let dishIds = []
    if (weekData && weekData.days && weekData.days[currentMealContext.date]) {
      dishIds = weekData.days[currentMealContext.date][currentMealContext.mealName] || []
    }

    // 添加新菜品
    if (!dishIds.includes(dishId)) {
      dishIds.push(dishId)
      dishStorage.updateDayMeal(currentMealContext.date, currentMealContext.mealName, dishIds)
      this.loadDayMenu()
      util.showSuccess('已添加')
    }

    this.closeDishPicker()
  },

  onCreateNewDish() {
    this.setData({
      showDishPicker: false,
      showDishModal: true,
      editingDish: null
    })
  },

  onRemoveDish(e) {
    const { date, mealName, dishId } = e.detail
    dishStorage.removeDishFromMenu(date, mealName, dishId)
    this.loadDayMenu()
  },

  onDishModalCancel() {
    this.setData({ showDishModal: false })
  },

  onDishModalConfirm(e) {
    const { dish } = e.detail
    const newDish = dishStorage.addDish(dish)

    // 自动添加到当前餐次
    const { currentMealContext } = this.data
    if (currentMealContext) {
      const weekData = dishStorage.getCurrentMenuWeek()
      let dishIds = []
      if (weekData && weekData.days && weekData.days[currentMealContext.date]) {
        dishIds = weekData.days[currentMealContext.date][currentMealContext.mealName] || []
      }
      dishIds.push(newDish.id)
      dishStorage.updateDayMeal(currentMealContext.date, currentMealContext.mealName, dishIds)
    }

    this.setData({ showDishModal: false })
    this.loadDayMenu()
    util.showSuccess('已添加')
  },

  onRecommend() {
    const { enabledMeals } = this.data
    this.setData({
      showTagPicker: true,
      selectedTags: [],
      selectedMeal: enabledMeals[0]?.name || ''
    })
  },

  closeTagPicker() {
    this.setData({ showTagPicker: false })
  },

  onTagSelect(e) {
    const tag = e.currentTarget.dataset.tag
    let { selectedTags } = this.data
    const index = selectedTags.indexOf(tag)
    if (index === -1) {
      selectedTags = [...selectedTags, tag]
    } else {
      selectedTags = selectedTags.filter(t => t !== tag)
    }
    this.setData({ selectedTags })
  },

  onMealSelect(e) {
    const meal = e.currentTarget.dataset.meal
    this.setData({ selectedMeal: meal })
  },

  isTagSelected(tag) {
    return this.data.selectedTags.includes(tag)
  },

  onConfirmRecommend() {
    const { selectedTags, selectedMeal, currentDate } = this.data

    if (!selectedMeal) {
      wx.showToast({ title: '请选择餐次', icon: 'none' })
      return
    }

    // 筛选菜品
    let candidates = selectedTags.length > 0
      ? dishStorage.getDishesByTags(selectedTags)
      : dishStorage.getDishes()

    if (candidates.length === 0) {
      wx.showToast({ title: '没有符合条件的菜品', icon: 'none' })
      return
    }

    // 随机选择一个菜品
    const randomIndex = Math.floor(Math.random() * candidates.length)
    const selectedDish = candidates[randomIndex]
    dishStorage.addDishToMenu(currentDate, selectedMeal, selectedDish.id)
    this.loadDayMenu()
    util.showSuccess(`推荐：${selectedDish.name}`)

    this.closeTagPicker()
  },

  goToDishLibrary() {
    wx.navigateTo({
      url: '/pages/dishes/dishes'
    })
  }
})
