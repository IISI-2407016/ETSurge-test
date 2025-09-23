import { defineStore } from 'pinia'

export const toolBar = defineStore('toolBar', {
  state: () => ({
    user: {
      level: ''
    },
    have_stids_title: [],
    stids: [],
    login_state: false,
    current_page: ''
  }),
  actions: {
    CURRENT_PAGE(page) {
      this.current_page = page
    }
  }
})
