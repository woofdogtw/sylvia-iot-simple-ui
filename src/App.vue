<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue';
import { Buffer } from 'buffer';
import qs from 'qs';
import strftime from 'strftime';
import { useStore } from 'stores/system';

export default defineComponent({
  name: 'App',

  methods: {
    errorHandler(err, callback) {
      let tokens = this.store.getTokens();
      let resp = err.response;

      if (resp && resp.status === 401) {
        if (!tokens.refreshToken) {
          return void this.signin();
        }
        let opts = {
          method: 'POST',
          url: `${this.config.auth.base}/oauth2/refresh`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: qs.stringify({
            grant_type: 'refresh_token',
            refresh_token: tokens.refreshToken,
            client_id: this.config.auth.clientId,
          }),
        };
        return void this.$axios(opts)
          .then((resp) => {
            this.$router.replace({ query: null });
            if (resp.status !== 200) {
              return void this.$router.push('/');
            }
            let data = resp.data;
            this.store.setTokens(data.access_token, data.refresh_token);
            callback();
          })
          .catch((_err) => {
            this.$router.replace({ query: null });
            this.$router.push('/');
          });
      } // (resp && resp.status === 401)

      // Prompt a dialog to display error messages.
      let errObj = {
        status: 500,
        code: '',
        message: '',
      };
      if (!resp) {
        if (err.message === 'Network Error') {
          errObj.status = 503;
          errObj.code = 'err_xhr_network';
          errObj.message = err.message;
        } else {
          errObj.status = 500;
          errObj.code = 'err_xhr_unknown';
          errObj.message = err.message;
        }
      } else if (resp.data && resp.data.code) {
        errObj.status = resp.status;
        errObj.code = resp.data.code;
        errObj.message = resp.data.message;
      } else {
        const body = JSON.stringify(resp.data);
        errObj.status = resp.status;
        errObj.code = 'err_xhr_unknown';
        errObj.message = `message: ${err.message}, body: ${body}`;
      }
      this.$q.dialog({
        title: this.$t('apiError.' + errObj.code),
        message: errObj.message,
        focus: 'ok',
      });
    },
    signin() {
      let url =
        this.config.auth.base +
        '/oauth2/auth?response_type=code&redirect_uri=' +
        encodeURIComponent(this.config.auth.redirectUri) +
        '&client_id=' +
        this.config.auth.clientId +
        '&state=' +
        this.$route.path;
      if (this.config.auth.scopes && this.config.auth.scopes.length > 0) {
        url +=
          '&scope=' + encodeURIComponent(this.config.auth.scopes.join(' '));
      }
      window.location.href = url;
    },
    signout() {
      this.store.setTokens('', '');
      this.store.setAccountInfo({});
    },
    isCode(str) {
      return /^[A-Za-z0-9]{1}[A-Za-z0-9_-]*$/.test(str);
    },
    isHex(str) {
      return str.length % 2 === 0 && /^[A-Fa-f0-9]+$/.test(str);
    },
    isJsonObject(str) {
      try {
        const obj = JSON.parse(str);
        return obj && typeof obj === 'object' && !Array.isArray(obj);
      } catch (_e) {
        return false;
      }
    },
    isURL(str) {
      let url;
      try {
        url = new URL(str);
      } catch (_e) {
        return false;
      }
      let pathname = url.pathname;
      while (pathname.charAt(0) === '/') {
        pathname = pathname.substring(1);
      }
      return !!url.protocol && (!!url.hostname || !!pathname);
    },
    isZeroPositiveInt(str) {
      return /^[0-9]+$/.test(str);
    },
    hex2str(hexStr) {
      return Buffer.from(hexStr, 'hex').toString() || hexStr;
    },
    str2arr(str) {
      if (!str) {
        return [];
      }
      let splits = str.split(',');
      let arr = [];
      for (let i of splits) {
        let s = i.trim();
        if (s) {
          arr.push(s);
        }
      }
      return arr;
    },
    timeStr(apiTime) {
      const t = new Date(apiTime);
      return isNaN(t) ? '' : strftime('%Y/%m/%d %H:%M:%S', t);
    },
  },

  setup() {
    const config = window.config;
    const store = useStore();

    return {
      config,
      store,
    };
  },
});
</script>
