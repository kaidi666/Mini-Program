const dishStorage = require('../../utils/dish-storage.js')

Component({
  options: {
    styleIsolation: 'shared'
  },

  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    dishData: {
      type: Object,
      value: null
    }
  },

  data: {
    isEdit: false,
    dishId: '',
    allTags: dishStorage.DEFAULT_TAGS,
    formData: {
      name: '',
      tags: [],
      ingredients: '',
      note: ''
    }
  },

  observers: {
    'dishData, visible': function(dishData, visible) {
      if (visible) {
        if (dishData) {
          // 编辑模式
          const ingredients = Array.isArray(dishData.ingredients)
            ? dishData.ingredients.join('、')
            : (dishData.ingredients || '')
          this.setData({
            isEdit: true,
            dishId: dishData.id,
            formData: {
              name: dishData.name || '',
              tags: dishData.tags || [],
              ingredients: ingredients,
              note: dishData.note || ''
            }
          })
        } else {
          // 新建模式
          this.setData({
            isEdit: false,
            dishId: '',
            formData: {
              name: '',
              tags: [],
              ingredients: '',
              note: ''
            }
          })
        }
      }
    }
  },

  methods: {
    stopPropagation() {},

    onNameInput(e) {
      this.setData({
        'formData.name': e.detail.value
      })
    },

    onIngredientsInput(e) {
      this.setData({
        'formData.ingredients': e.detail.value
      })
    },

    onNoteInput(e) {
      this.setData({
        'formData.note': e.detail.value
      })
    },

    onTagToggle(e) {
      const tag = e.currentTarget.dataset.tag
      const tags = this.data.formData.tags.slice()
      const index = tags.indexOf(tag)

      if (index === -1) {
        tags.push(tag)
      } else {
        tags.splice(index, 1)
      }

      this.setData({
        'formData.tags': tags
      })
    },

    onCancel() {
      this.triggerEvent('cancel')
    },

    onConfirm() {
      if (!this.data.formData.name.trim()) {
        wx.showToast({
          title: '请输入菜名',
          icon: 'none'
        })
        return
      }

      // 处理食材字符串为数组
      const ingredientsStr = this.data.formData.ingredients.trim()
      const ingredients = ingredientsStr
        ? ingredientsStr.split(/[、,，\s]+/).filter(s => s.trim())
        : []

      const dish = {
        name: this.data.formData.name.trim(),
        tags: this.data.formData.tags,
        ingredients: ingredients,
        note: this.data.formData.note.trim()
      }

      // 编辑模式需要包含id
      if (this.data.isEdit) {
        dish.id = this.data.dishId
      }

      this.triggerEvent('confirm', {
        isEdit: this.data.isEdit,
        dish: dish
      })
    }
  }
})
