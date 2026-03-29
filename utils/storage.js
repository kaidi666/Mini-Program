/**
 * 存储管理工具
 * 封装微信小程序本地存储操作
 */

const weekUtil = require('./week.js')

// 存储键名
const STORAGE_KEYS = {
  CURRENT_WEEK: 'currentWeek',
  HISTORY_PREFIX: 'history_',
  SETTINGS: 'settings'
}

/**
 * 获取当前周数据
 * @returns {Object} 当前周数据 { weekId, tasks }
 */
function getCurrentWeek() {
  const data = wx.getStorageSync(STORAGE_KEYS.CURRENT_WEEK)
  if (!data) {
    return null
  }
  return data
}

/**
 * 保存当前周数据
 * @param {Object} data 周数据 { weekId, tasks }
 */
function saveCurrentWeek(data) {
  wx.setStorageSync(STORAGE_KEYS.CURRENT_WEEK, data)
}

/**
 * 初始化当前周
 * 如果是新的一周，将旧数据归档并创建新周
 * @returns {Object} 当前周数据
 */
function initCurrentWeek() {
  const now = weekUtil.getWeekInfo()
  const stored = getCurrentWeek()

  // 如果没有存储数据，创建新周
  if (!stored) {
    const newData = {
      weekId: now.id,
      startDate: now.startDate,
      endDate: now.endDate,
      tasks: []
    }
    saveCurrentWeek(newData)
    return newData
  }

  // 如果是新的一周，归档旧数据
  if (stored.weekId !== now.id) {
    // 归档旧周数据
    archiveWeek(stored)

    // 创建新周
    const newData = {
      weekId: now.id,
      startDate: now.startDate,
      endDate: now.endDate,
      tasks: []
    }
    saveCurrentWeek(newData)
    return newData
  }

  return stored
}

/**
 * 归档周数据到历史
 * @param {Object} weekData 周数据
 */
function archiveWeek(weekData) {
  const year = weekData.weekId.split('-W')[0]
  const historyKey = STORAGE_KEYS.HISTORY_PREFIX + year

  // 获取该年历史数据
  let history = wx.getStorageSync(historyKey) || {}

  // 计算统计数据
  const completed = weekData.tasks.filter(t => t.completed).length
  const total = weekData.tasks.length

  // 保存到历史
  history[weekData.weekId] = {
    startDate: weekData.startDate,
    endDate: weekData.endDate,
    tasks: weekData.tasks,
    stats: {
      completed: completed,
      total: total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  wx.setStorageSync(historyKey, history)
}

/**
 * 获取历史周列表
 * @param {Number} year 年份，默认当前年
 * @returns {Array} 历史周列表
 */
function getHistoryList(year = new Date().getFullYear()) {
  const historyKey = STORAGE_KEYS.HISTORY_PREFIX + year
  const history = wx.getStorageSync(historyKey) || {}

  // 转换为数组并按周数降序排列
  const list = Object.keys(history).map(weekId => {
    const data = history[weekId]
    return {
      weekId: weekId,
      startDate: data.startDate,
      endDate: data.endDate,
      stats: data.stats
    }
  }).sort((a, b) => b.weekId.localeCompare(a.weekId))

  return list
}

/**
 * 获取特定历史周数据
 * @param {String} weekId 周ID
 * @returns {Object} 周数据
 */
function getHistoryWeek(weekId) {
  const year = weekId.split('-W')[0]
  const historyKey = STORAGE_KEYS.HISTORY_PREFIX + year
  const history = wx.getStorageSync(historyKey) || {}
  return history[weekId] || null
}

/**
 * 添加任务
 * @param {Object} task 任务对象
 */
function addTask(task) {
  const currentWeek = getCurrentWeek()
  if (!currentWeek) return

  task.id = generateId()
  task.createdAt = new Date().toISOString()
  task.completed = false
  task.completedAt = null

  currentWeek.tasks.push(task)
  saveCurrentWeek(currentWeek)
}

/**
 * 更新任务
 * @param {String} taskId 任务ID
 * @param {Object} updates 更新内容
 */
function updateTask(taskId, updates) {
  const currentWeek = getCurrentWeek()
  if (!currentWeek) return

  const taskIndex = currentWeek.tasks.findIndex(t => t.id === taskId)
  if (taskIndex === -1) return

  const task = currentWeek.tasks[taskIndex]

  // 处理完成状态变更
  if (updates.completed !== undefined && updates.completed !== task.completed) {
    updates.completedAt = updates.completed ? new Date().toISOString() : null
  }

  currentWeek.tasks[taskIndex] = { ...task, ...updates }
  saveCurrentWeek(currentWeek)
}

/**
 * 删除任务
 * @param {String} taskId 任务ID
 */
function deleteTask(taskId) {
  const currentWeek = getCurrentWeek()
  if (!currentWeek) return

  currentWeek.tasks = currentWeek.tasks.filter(t => t.id !== taskId)
  saveCurrentWeek(currentWeek)
}

/**
 * 获取按优先级分组的任务
 * @param {Array} tasks 任务列表
 * @returns {Object} 分组后的任务 { high: [], medium: [], low: [] }
 */
function groupByPriority(tasks) {
  return {
    high: tasks.filter(t => t.priority === 1),
    medium: tasks.filter(t => t.priority === 2),
    low: tasks.filter(t => t.priority === 3)
  }
}

/**
 * 获取任务统计
 * @param {Array} tasks 任务列表
 * @returns {Object} 统计数据 { completed, total, percentage }
 */
function getTaskStats(tasks) {
  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length
  return {
    completed: completed,
    total: total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  }
}

/**
 * 生成唯一ID
 * @returns {String} 唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 获取用户设置
 * @returns {Object} 设置对象
 */
function getSettings() {
  return wx.getStorageSync(STORAGE_KEYS.SETTINGS) || { darkMode: false }
}

/**
 * 保存用户设置
 * @param {Object} settings 设置对象
 */
function saveSettings(settings) {
  wx.setStorageSync(STORAGE_KEYS.SETTINGS, settings)
}

/**
 * 清除所有数据
 */
function clearAllData() {
  wx.clearStorageSync()
}

module.exports = {
  getCurrentWeek,
  saveCurrentWeek,
  initCurrentWeek,
  archiveWeek,
  getHistoryList,
  getHistoryWeek,
  addTask,
  updateTask,
  deleteTask,
  groupByPriority,
  getTaskStats,
  getSettings,
  saveSettings,
  clearAllData
}
