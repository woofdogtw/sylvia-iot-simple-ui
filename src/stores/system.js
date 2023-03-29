import { defineStore } from 'pinia';

export const useStore = defineStore('system', {
  state: () => ({
    language: '',
    accessToken: '',
    refreshToken: '',
    accountInfo: {},
  }),

  getters: {
    getLanguage: (state) => () => {
      state.language = localStorage.getItem('language');
      return state.language;
    },
    getTokens: (state) => () => {
      state.accessToken = localStorage.getItem('accessToken');
      state.refreshToken = localStorage.getItem('refreshToken');
      return {
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      };
    },
    getAccountInfo: (state) => () => {
      return state.accountInfo;
    },
  },

  actions: {
    setLanguage(language) {
      this.language = language;
      localStorage.setItem('language', language);
    },
    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    setAccountInfo(info) {
      this.accountInfo = info;
    },
  },
});
