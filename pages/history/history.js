const storage = require('../../utils/storage.js')
const weekUtil = require('../../utils/week.js')

Page({
  data: {
    darkMode: false,
    historyList: [],
    showDetail: false,
    selectedWeek: null
  },

  onLoad() {
    this.loadHistory()
  },

  onShow() {
    this.applyTheme()
  },

  loadHistory() {
    const list = storage.getHistoryList()

    // 处理数据，添加周数和友好日期
    const processedList = list.map(item => {
      const weekNumber = parseInt(item.weekId.split('-W')[1])
      return {
        ...item,
        weekNumber: weekNumber,
        dateRange: weekUtil.formatDateRange(item.startDate, item.endDate)
      }
    })

    this.setData({ historyList: processedList })
  },

  onWeekTap(e) {
    const weekId = e.currentTarget.dataset.weekId
    const weekData = storage.getHistoryWeek(weekId)

    if (weekData) {
      // 处理任务数据
      const tasks = weekData.tasks.map(task => ({
        ...task,
        dueDateFriendly: task.dueDate ? weekUtil.formatDateFriendly(task.dueDate) : ''
      }))

      const weekNumber = parseInt(weekId.split('-W')[1])

      this.setData({
        showDetail: true,
        selectedWeek: {
          weekNumber: weekNumber,
          tasks: tasks
        }
      })
    }
  },

  closeDetail() {
    this.setData({
      showDetail: false,
      selectedWeek: null
    })
  },

  stopPropagation() {},

  applyTheme() {
    const app = getApp()
    const darkMode = app.globalData.darkMode
    this.setData({ darkMode })

    if (darkMode) {
      wx.setNavigationBarColor({
        backgroundColor: '#1A1A1A',
        frontColor: '#FFFFFF'
      })
      wx.setPageStyle({
        style: { backgroundColor: '#1A1A1A' }
      })
    } else {
      wx.setNavigationBarColor({
        backgroundColor: '#FFFFFF',
        frontColor: '#000000'
      })
      wx.setPageStyle({
        style: { backgroundColor: '#F5F5F5' }
      })
    }
  }
})
