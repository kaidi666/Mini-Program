Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    taskData: {
      type: Object,
      value: null
    }
  },

  data: {
    isEdit: false,
    taskId: '',
    title: '',
    priority: 2,
    dueDate: '',
    minDate: '',
    maxDate: ''
  },

  observers: {
    'taskData, visible': function(taskData, visible) {
      if (visible) {
        if (taskData) {
          // 编辑模式
          this.setData({
            isEdit: true,
            taskId: taskData.id,
            title: taskData.title,
            priority: taskData.priority,
            dueDate: taskData.dueDate
          })
        } else {
          // 新建模式
          const today = new Date()
          const weekUtil = require('../../utils/week.js')
          this.setData({
            isEdit: false,
            taskId: '',
            title: '',
            priority: 2,
            dueDate: weekUtil.formatDate(today)
          })
        }

        // 设置日期范围
        const today = new Date()
        const weekUtil = require('../../utils/week.js')
        const weekInfo = weekUtil.getWeekInfo(today)
        this.setData({
          minDate: weekInfo.startDate,
          maxDate: weekInfo.endDate
        })
      }
    }
  },

  methods: {
    stopPropagation() {},

    onTitleInput(e) {
      this.setData({ title: e.detail.value })
    },

    onPriorityChange(e) {
      const priority = parseInt(e.currentTarget.dataset.priority)
      this.setData({ priority })
    },

    onDateChange(e) {
      this.setData({ dueDate: e.detail.value })
    },

    onCancel() {
      this.triggerEvent('cancel')
    },

    onConfirm() {
      if (!this.data.title.trim()) {
        wx.showToast({
          title: '请输入任务名称',
          icon: 'none'
        })
        return
      }

      const taskData = {
        id: this.data.taskId,
        title: this.data.title.trim(),
        priority: this.data.priority,
        dueDate: this.data.dueDate
      }

      this.triggerEvent('confirm', {
        isEdit: this.data.isEdit,
        task: taskData
      })
    }
  }
})
