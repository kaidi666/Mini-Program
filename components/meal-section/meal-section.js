Component({
  properties: {
    // 餐次名称
    mealName: {
      type: String,
      value: ''
    },
    // 餐次图标（如 🌅🍱🌙）
    icon: {
      type: String,
      value: ''
    },
    // 已添加的菜品列表
    dishes: {
      type: Array,
      value: []
    },
    // 当前日期
    date: {
      type: String,
      value: ''
    }
  },

  data: {
    // 是否展开
    expanded: true
  },

  methods: {
    // 切换展开/收起
    onToggle() {
      this.setData({
        expanded: !this.data.expanded
      })
    },

    // 添加菜品
    onAddDish() {
      this.triggerEvent('adddish', {
        date: this.properties.date,
        mealName: this.properties.mealName
      })
    },

    // 删除菜品
    onRemoveDish(e) {
      const index = e.currentTarget.dataset.index
      const dish = this.properties.dishes[index]
      this.triggerEvent('removedish', {
        date: this.properties.date,
        mealName: this.properties.mealName,
        dishIndex: index,
        dishId: dish ? dish.id : undefined
      })
    }
  }
})
