const storage = require('../../utils/storage.js')
const weekUtil = require('../../utils/week.js')
const util = require('../../utils/util.js')

Page({
  data: {
    darkMode: false,
    weekInfo: {
      weekNumber: 1,
      dateRange: ''
    },
    stats: {
      completed: 0,
      total: 0,
      percentage: 0
    },
    groupedTasks: {
      high: [],
      medium: [],
      low: []
    },
    showModal: false,
    editingTask: null
  },

  onLoad() {
    this.initData()
  },

  onShow() {
    this.loadTasks()
    this.applyTheme()
  },

  initData() {
    // 初始化当前周
    storage.initCurrentWeek()

    // 获取周信息
    const weekData = storage.getCurrentWeek()
    const weekNumber = weekUtil.getWeekNumber(new Date(weekData.startDate))

    this.setData({
      weekInfo: {
        weekNumber: weekNumber,
        dateRange: weekUtil.formatDateRange(weekData.startDate, weekData.endDate)
      }
    })
  },

  loadTasks() {
    const weekData = storage.getCurrentWeek()
    if (!weekData) return

    // 处理任务数据，添加友好日期格式
    const tasks = weekData.tasks.map(task => ({
      ...task,
      dueDateFriendly: task.dueDate ? weekUtil.formatDateFriendly(task.dueDate) : ''
    }))

    // 按优先级分组
    const groupedTasks = storage.groupByPriority(tasks)

    // 排序：未完成在前，按截止日期排序
    const sortTasks = (taskList) => {
      return taskList.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
        if (a.dueDate && b.dueDate) {
          return a.dueDate.localeCompare(b.dueDate)
        }
        return 0
      })
    }

    // 计算统计
    const stats = storage.getTaskStats(tasks)

    this.setData({
      groupedTasks: {
        high: sortTasks(groupedTasks.high),
        medium: sortTasks(groupedTasks.medium),
        low: sortTasks(groupedTasks.low)
      },
      stats: stats
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
  },

  onAddTask() {
    this.setData({
      showModal: true,
      editingTask: null
    })
  },

  onTaskToggle(e) {
    const { taskId, completed } = e.detail
    storage.updateTask(taskId, { completed })
    this.loadTasks()

    if (completed) {
      util.showSuccess('任务已完成')
    }
  },

  onTaskEdit(e) {
    const { taskId } = e.detail
    const weekData = storage.getCurrentWeek()
    const task = weekData.tasks.find(t => t.id === taskId)

    if (task) {
      this.setData({
        showModal: true,
        editingTask: task
      })
    }
  },

  onTaskDelete(e) {
    const { taskId } = e.detail

    util.showConfirm({
      title: '删除任务',
      content: '确定要删除这个任务吗？'
    }).then(confirm => {
      if (confirm) {
        storage.deleteTask(taskId)
        this.loadTasks()
        util.showSuccess('已删除')
      }
    })
  },

  onModalCancel() {
    this.setData({ showModal: false })
  },

  onModalConfirm(e) {
    const { isEdit, task } = e.detail

    if (isEdit) {
      storage.updateTask(task.id, {
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate
      })
      util.showSuccess('已更新')
    } else {
      storage.addTask({
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate,
        weekId: storage.getCurrentWeek().weekId
      })
      util.showSuccess('已添加')
    }

    this.setData({ showModal: false })
    this.loadTasks()
  }
})
