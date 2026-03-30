/**
 * 菜品存储管理工具
 * 管理菜品、菜谱和餐次配置
 */

// 存储键名
const STORAGE_KEYS = {
  DISHES: 'dishes',
  MENU_WEEKS: 'menu_weeks',
  MEAL_CONFIG: 'meal_config'
}

// 预置标签
const DEFAULT_TAGS = ['快手菜', '素菜', '肉菜', '汤', '主食', '辣', '清淡']

// 预置菜品
// 注意: createdAt 字段在 initDishes() 中动态添加，避免模块缓存导致时间戳不准确
const DEFAULT_DISHES = [
  {
    id: 'dish_default_1',
    name: '红烧肉',
    tags: ['肉菜'],
    ingredients: ['五花肉', '酱油', '糖']
  },
  {
    id: 'dish_default_2',
    name: '清炒时蔬',
    tags: ['素菜', '快手菜'],
    ingredients: ['时令蔬菜', '蒜']
  }
]

// 默认餐次配置
const DEFAULT_MEAL_CONFIG = [
  { name: '早餐', enabled: true, order: 1 },
  { name: '午餐', enabled: true, order: 2 },
  { name: '晚餐', enabled: true, order: 3 },
  { name: '下午茶', enabled: false, order: 4 },
  { name: '夜宵', enabled: false, order: 5 }
]

/**
 * 生成唯一ID
 * @returns {String} 唯一ID
 */
function generateId() {
  return 'dish_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 获取当前周的ID
 * 周ID格式为日期字符串（如 '2026-03-24'），表示该周周一的日期
 * 注意: 此格式与 weekUtil 的周ID格式不同，weekUtil 使用 'YYYY-WW' 格式
 * @returns {String} 周ID 格式: YYYY-MM-DD (周一日期)
 */
function getCurrentWeekId() {
  const now = new Date()
  const dayOfWeek = now.getDay() || 7 // 周日为7
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek + 1)
  return monday.toISOString().split('T')[0]
}

// ==================== 菜品操作函数 ====================

/**
 * 初始化菜品数据
 * 如果没有菜品数据，使用预置数据初始化
 * @returns {Array} 菜品列表
 */
function initDishes() {
  let dishes = wx.getStorageSync(STORAGE_KEYS.DISHES)
  if (!dishes || dishes.length === 0) {
    dishes = DEFAULT_DISHES.map(d => ({...d, createdAt: new Date().toISOString()}))
    wx.setStorageSync(STORAGE_KEYS.DISHES, dishes)
  }
  return dishes
}

/**
 * 获取所有菜品
 * @returns {Array} 菜品列表
 */
function getDishes() {
  return wx.getStorageSync(STORAGE_KEYS.DISHES) || []
}

/**
 * 根据ID获取菜品
 * @param {String} id 菜品ID
 * @returns {Object|null} 菜品对象，未找到返回null
 */
function getDishById(id) {
  const dishes = getDishes()
  return dishes.find(dish => dish.id === id) || null
}

/**
 * 添加菜品
 * @param {Object} dish 菜品对象 { name, tags, ingredients }
 * @returns {Object} 添加后的菜品（包含id和createdAt）
 */
function addDish(dish) {
  const dishes = getDishes()
  const newDish = {
    id: generateId(),
    name: dish.name,
    tags: dish.tags || [],
    ingredients: dish.ingredients || [],
    createdAt: new Date().toISOString()
  }
  dishes.push(newDish)
  wx.setStorageSync(STORAGE_KEYS.DISHES, dishes)
  return newDish
}

/**
 * 更新菜品
 * @param {String} id 菜品ID
 * @param {Object} data 更新数据
 * @returns {Object|null} 更新后的菜品，未找到返回null
 */
function updateDish(id, data) {
  const dishes = getDishes()
  const index = dishes.findIndex(dish => dish.id === id)
  if (index === -1) return null

  dishes[index] = {
    ...dishes[index],
    ...data,
    id: id, // 确保id不被修改
    updatedAt: new Date().toISOString()
  }
  wx.setStorageSync(STORAGE_KEYS.DISHES, dishes)
  return dishes[index]
}

/**
 * 删除菜品
 * @param {String} id 菜品ID
 * @returns {Boolean} 是否删除成功
 */
function deleteDish(id) {
  const dishes = getDishes()
  const index = dishes.findIndex(dish => dish.id === id)
  if (index === -1) return false

  dishes.splice(index, 1)
  wx.setStorageSync(STORAGE_KEYS.DISHES, dishes)
  return true
}

/**
 * 根据标签筛选菜品
 * @param {Array} tags 标签数组
 * @returns {Array} 匹配的菜品列表
 */
function getDishesByTags(tags) {
  if (!tags || tags.length === 0) return getDishes()
  const dishes = getDishes()
  return dishes.filter(dish => {
    return tags.some(tag => dish.tags && dish.tags.includes(tag))
  })
}

// ==================== 餐次配置函数 ====================

/**
 * 初始化餐次配置
 * 如果没有配置，使用默认配置
 * @returns {Array} 餐次配置列表
 */
function initMealConfig() {
  let config = wx.getStorageSync(STORAGE_KEYS.MEAL_CONFIG)
  if (!config || config.length === 0) {
    config = DEFAULT_MEAL_CONFIG
    wx.setStorageSync(STORAGE_KEYS.MEAL_CONFIG, config)
  }
  return config
}

/**
 * 获取餐次配置
 * @returns {Array} 餐次配置列表
 */
function getMealConfig() {
  return wx.getStorageSync(STORAGE_KEYS.MEAL_CONFIG) || DEFAULT_MEAL_CONFIG
}

/**
 * 获取启用的餐次
 * @returns {Array} 启用的餐次列表
 */
function getEnabledMeals() {
  const config = getMealConfig()
  return config
    .filter(meal => meal.enabled)
    .sort((a, b) => a.order - b.order)
}

/**
 * 更新餐次配置
 * @param {Array} config 餐次配置列表
 */
function updateMealConfig(config) {
  wx.setStorageSync(STORAGE_KEYS.MEAL_CONFIG, config)
}

// ==================== 菜谱操作函数 ====================

/**
 * 获取当前周的菜谱
 * @returns {Object} 菜谱数据 { weekId, days: { 'YYYY-MM-DD': { mealName: [dishIds] } } }
 */
function getCurrentMenuWeek() {
  const weekId = getCurrentWeekId()
  const allWeeks = wx.getStorageSync(STORAGE_KEYS.MENU_WEEKS) || {}
  return allWeeks[weekId] || null
}

/**
 * 初始化当前周菜谱
 * @returns {Object} 当前周菜谱数据
 */
function initCurrentMenuWeek() {
  const weekId = getCurrentWeekId()
  const allWeeks = wx.getStorageSync(STORAGE_KEYS.MENU_WEEKS) || {}

  if (allWeeks[weekId]) {
    return allWeeks[weekId]
  }

  // 生成一周的日期
  const days = {}
  const monday = new Date(weekId)
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    days[dateStr] = {}
  }

  const newWeek = {
    weekId: weekId,
    startDate: weekId,
    endDate: Object.keys(days).pop(),
    days: days
  }

  allWeeks[weekId] = newWeek
  wx.setStorageSync(STORAGE_KEYS.MENU_WEEKS, allWeeks)
  return newWeek
}

/**
 * 更新某天某餐的菜品
 * @param {String} date 日期 YYYY-MM-DD
 * @param {String} mealName 餐次名称
 * @param {Array} dishIds 菜品ID数组
 * @returns {Object|null} 更新后的菜谱数据
 */
function updateDayMeal(date, mealName, dishIds) {
  let allWeeks = wx.getStorageSync(STORAGE_KEYS.MENU_WEEKS) || {}
  const weekId = getCurrentWeekId()

  // 确保当前周菜谱存在
  if (!allWeeks[weekId]) {
    initCurrentMenuWeek()
    // 重新读取存储，因为 initCurrentMenuWeek() 可能已修改数据
    allWeeks = wx.getStorageSync(STORAGE_KEYS.MENU_WEEKS) || {}
  }

  const currentWeek = allWeeks[weekId]
  if (!currentWeek.days[date]) {
    currentWeek.days[date] = {}
  }

  currentWeek.days[date][mealName] = dishIds
  allWeeks[weekId] = currentWeek
  wx.setStorageSync(STORAGE_KEYS.MENU_WEEKS, allWeeks)
  return currentWeek
}

/**
 * 从菜谱中移除菜品
 * @param {String} date 日期 YYYY-MM-DD
 * @param {String} mealName 餐次名称
 * @param {String} dishId 菜品ID
 * @returns {Boolean} 是否移除成功
 */
function removeDishFromMenu(date, mealName, dishId) {
  const weekId = getCurrentWeekId()
  const allWeeks = wx.getStorageSync(STORAGE_KEYS.MENU_WEEKS) || {}

  if (!allWeeks[weekId] || !allWeeks[weekId].days[date]) {
    return false
  }

  const dayMeals = allWeeks[weekId].days[date]
  if (!dayMeals[mealName]) {
    return false
  }

  const index = dayMeals[mealName].indexOf(dishId)
  if (index === -1) return false

  dayMeals[mealName].splice(index, 1)
  wx.setStorageSync(STORAGE_KEYS.MENU_WEEKS, allWeeks)
  return true
}

/**
 * 添加菜品到菜谱（追加，不替换）
 * @param {String} date 日期 YYYY-MM-DD
 * @param {String} mealName 餐次名称
 * @param {String} dishId 菜品ID
 * @returns {Boolean} 是否添加成功
 */
function addDishToMenu(date, mealName, dishId) {
  let allWeeks = wx.getStorageSync(STORAGE_KEYS.MENU_WEEKS) || {}
  const weekId = getCurrentWeekId()

  // 确保当前周菜谱存在
  if (!allWeeks[weekId]) {
    initCurrentMenuWeek()
    allWeeks = wx.getStorageSync(STORAGE_KEYS.MENU_WEEKS) || {}
  }

  const currentWeek = allWeeks[weekId]
  if (!currentWeek.days[date]) {
    currentWeek.days[date] = {}
  }

  if (!currentWeek.days[date][mealName]) {
    currentWeek.days[date][mealName] = []
  }

  // 避免重复添加
  if (!currentWeek.days[date][mealName].includes(dishId)) {
    currentWeek.days[date][mealName].push(dishId)
    allWeeks[weekId] = currentWeek
    wx.setStorageSync(STORAGE_KEYS.MENU_WEEKS, allWeeks)
  }

  return true
}

module.exports = {
  // 常量
  STORAGE_KEYS,
  DEFAULT_TAGS,
  DEFAULT_DISHES,
  DEFAULT_MEAL_CONFIG,
  // 菜品操作
  initDishes,
  getDishes,
  getDishById,
  addDish,
  updateDish,
  deleteDish,
  getDishesByTags,
  // 餐次配置
  initMealConfig,
  getMealConfig,
  getEnabledMeals,
  updateMealConfig,
  // 菜谱操作
  getCurrentMenuWeek,
  initCurrentMenuWeek,
  updateDayMeal,
  addDishToMenu,
  removeDishFromMenu
}
