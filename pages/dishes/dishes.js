const dishStorage = require('../../utils/dish-storage.js')
const util = require('../../utils/util.js')

Page({
  data: {
    darkMode: false,
    allTags: dishStorage.DEFAULT_TAGS,
    currentFilter: '',
    dishes: [],
    filteredDishes: [],
    showModal: false,
    editingDish: null
  },

  onLoad() {
    this.initData()
  },

  onShow() {
    this.loadDishes()
    this.applyTheme()
  },

  initData() {
    // 初始化菜品数据
    dishStorage.initDishes()
  },

  loadDishes() {
    const dishes = dishStorage.getDishes()
    this.setData({ dishes })
    this.applyFilter()
  },

  applyFilter() {
    const { dishes, currentFilter } = this.data
    let filteredDishes = dishes

    if (currentFilter) {
      filteredDishes = dishes.filter(dish =>
        dish.tags && dish.tags.includes(currentFilter)
      )
    }

    // 按创建时间倒序排列
    filteredDishes.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime()
      const timeB = new Date(b.createdAt || 0).getTime()
      return timeB - timeA
    })

    this.setData({ filteredDishes })
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

  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.applyFilter()
  },

  onAddDish() {
    this.setData({
      showModal: true,
      editingDish: null
    })
  },

  onEditDish(e) {
    const { dishId } = e.detail
    const dish = dishStorage.getDishById(dishId)

    if (dish) {
      this.setData({
        showModal: true,
        editingDish: dish
      })
    }
  },

  onDeleteDish(e) {
    const { dishId } = e.detail

    util.showConfirm({
      title: '删除菜品',
      content: '确定要删除这个菜品吗？'
    }).then(confirm => {
      if (confirm) {
        dishStorage.deleteDish(dishId)
        this.loadDishes()
        util.showSuccess('已删除')
      }
    })
  },

  onModalCancel() {
    this.setData({ showModal: false })
  },

  onModalConfirm(e) {
    const { isEdit, dish } = e.detail

    if (isEdit) {
      dishStorage.updateDish(dish.id, {
        name: dish.name,
        tags: dish.tags,
        ingredients: dish.ingredients,
        note: dish.note
      })
      util.showSuccess('已更新')
    } else {
      dishStorage.addDish({
        name: dish.name,
        tags: dish.tags,
        ingredients: dish.ingredients,
        note: dish.note
      })
      util.showSuccess('已添加')
    }

    this.setData({ showModal: false })
    this.loadDishes()
  }
})
