Component({
  properties: {
    dish: {
      type: Object,
      value: {}
    }
  },

  data: {
    showActions: false
  },

  methods: {
    onTouchStart() {
      this.setData({ showActions: true })
    },

    onTouchEnd() {
      // 延迟隐藏，给用户时间点击按钮
      setTimeout(() => {
        this.setData({ showActions: false })
      }, 2000)
    },

    onEditTap() {
      this.triggerEvent('edit', { dishId: this.properties.dish?.id })
      this.setData({ showActions: false })
    },

    onDeleteTap() {
      this.triggerEvent('delete', { dishId: this.properties.dish?.id })
      this.setData({ showActions: false })
    }
  }
})
