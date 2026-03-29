Component({
  properties: {
    taskId: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    priority: {
      type: Number,
      value: 2
    },
    dueDate: {
      type: String,
      value: ''
    },
    completed: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { taskId: this.properties.taskId })
    },

    onCheckTap() {
      this.triggerEvent('toggle', {
        taskId: this.properties.taskId,
        completed: !this.properties.completed
      })
    },

    onEditTap() {
      this.triggerEvent('edit', { taskId: this.properties.taskId })
    },

    onDeleteTap() {
      this.triggerEvent('delete', { taskId: this.properties.taskId })
    }
  }
})
