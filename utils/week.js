/**
 * 周计算工具
 * 用于计算自然周相关数据
 */

/**
 * 获取当前日期所在周的信息
 * @param {Date} date 日期对象，默认为当前日期
 * @returns {Object} 周信息 { id, startDate, endDate, year, weekNumber }
 */
function getWeekInfo(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay() || 7 // 将周日的 0 转为 7

  // 计算周一日期
  const monday = new Date(d)
  monday.setDate(d.getDate() - day + 1)
  monday.setHours(0, 0, 0, 0)

  // 计算周日日期
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  // 计算年度第几周
  const year = monday.getFullYear()
  const weekNumber = getWeekNumber(monday)

  return {
    id: `${year}-W${String(weekNumber).padStart(2, '0')}`,
    startDate: formatDate(monday),
    endDate: formatDate(sunday),
    year: year,
    weekNumber: weekNumber
  }
}

/**
 * 计算日期所在年度第几周
 * @param {Date} date 日期对象
 * @returns {Number} 周数 (1-53)
 */
function getWeekNumber(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // 获取该年的第一天
  const yearStart = new Date(d.getFullYear(), 0, 1)
  // 计算该年第一天是周几
  const firstDayWeek = yearStart.getDay() || 7
  // 计算第一周有多少天
  const firstWeekDays = 8 - firstDayWeek
  // 计算当前日期是该年第几天
  const dayOfYear = Math.floor((d - yearStart) / (24 * 60 * 60 * 1000)) + 1

  if (dayOfYear <= firstWeekDays) {
    return 1
  }

  return Math.ceil((dayOfYear - firstWeekDays) / 7) + 1
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {Date} date 日期对象
 * @returns {String} 格式化后的日期字符串
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期为友好显示格式 (M月D日)
 * @param {String} dateStr YYYY-MM-DD 格式的日期字符串
 * @returns {String} 友好格式日期
 */
function formatDateFriendly(dateStr) {
  const parts = dateStr.split('-')
  return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
}

/**
 * 获取日期范围友好显示
 * @param {String} startDate 开始日期 YYYY-MM-DD
 * @param {String} endDate 结束日期 YYYY-MM-DD
 * @returns {String} 友好格式日期范围
 */
function formatDateRange(startDate, endDate) {
  return `${formatDateFriendly(startDate)} - ${formatDateFriendly(endDate)}`
}

/**
 * 检查是否是新的一周
 * @param {String} currentWeekId 当前存储的周ID
 * @returns {Boolean} 是否是新的一周
 */
function isNewWeek(currentWeekId) {
  const now = getWeekInfo()
  return now.id !== currentWeekId
}

module.exports = {
  getWeekInfo,
  getWeekNumber,
  formatDate,
  formatDateFriendly,
  formatDateRange,
  isNewWeek
}
