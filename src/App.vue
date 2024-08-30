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
    /**
     * To download API content to a local file.
     *
     * @param url {string} The FQDN URL.
     * @param filename {string} The output file name.
     * @param callback {function} The callback function to retry the request.
     */
    downloadStream(url, filename, callback) {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      // Reference:
      // https://medium.com/js-dojo/force-file-download-in-vuejs-using-axios-a7fe1b5dfe7b
      let opts = {
        method: 'GET',
        url,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        responseType: 'blob',
      };
      let self = this;
      this.$axios(opts)
        .then((resp) => {
          const url = window.URL.createObjectURL(new Blob([resp.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
        })
        .catch((err) => {
          self.errorHandler(err, callback);
        });
    },
    /**
     * The API error handler.
     *
     * - 401: try to refresh token and call `callback` again.
     * - Others: prompt a dialog to show error message.
     *
     * @param err {Error}
     * @param callback {function} The callback function to retry the request.
     */
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
    /**
     * Redirect to the sign-in page.
     */
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
    /**
     * Clear the token information.
     */
    signout() {
      this.store.setTokens('', '');
      this.store.setAccountInfo({});
    },
    /**
     * To determine if the string is a valid code (in Sylvia-IoT).
     *
     * @param str {string} Input string.
     * @returns {boolean}
     */
    isCode(str) {
      return /^[A-Za-z0-9]{1}[A-Za-z0-9_-]*$/.test(str);
    },
    /**
     * To determine if the string is a valid hexadecimal string.
     *
     * @param str {string} Input string.
     * @returns {boolean}
     */
    isHex(str) {
      return str.length % 2 === 0 && /^[A-Fa-f0-9]+$/.test(str);
    },
    /**
     * To determine if the string is a valid JSON object (not array).
     *
     * @param str {string} Input string.
     * @returns {boolean}
     */
    isJsonObject(str) {
      try {
        const obj = JSON.parse(str);
        return obj && typeof obj === 'object' && !Array.isArray(obj);
      } catch (_e) {
        return false;
      }
    },
    /**
     * To determine if the string is a valid URL.
     *
     * @param str {string} Input string.
     * @returns {boolean}
     */
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
    /**
     * To determine if the string is zero or positive integer.
     *
     * @param str {string} Input string.
     * @returns {boolean}
     */
    isZeroPositiveInt(str) {
      return /^[0-9]+$/.test(str);
    },
    /**
     * Decode hexadecimal string to human-readable string. If the input is not
     * a valid hex-string, it will be returned.
     *
     * For example `41` will be decoded as `A`.
     *
     * @param hexStr {string} Hexade
     * @returns {string} Decoded string.
     */
    hex2str(hexStr) {
      return Buffer.from(hexStr, 'hex').toString() || hexStr;
    },
    /**
     * Transfer comma-separated string into array. This function will trim
     * spaces automatically.
     *
     * @param str {string} Comma-separated string.
     * @returns {string[]} String array.
     */
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
    /**
     * Transfer ISO string (from API) to `YYYY/mm/dd HH:MM:SS` format.
     *
     * @param apiTime {string} API time string
     * @returns {string} File name time string.
     */
    timeStr(apiTime) {
      const t = new Date(apiTime);
      return isNaN(t) ? '' : strftime('%Y/%m/%d %H:%M:%S', t);
    },
    /**
     * Transfer `Date` to `YYYYmmddHHMMSS` format.
     *
     * @param dt {Date}
     * @returns {string} File name time string.
     */
    fileTimeStr(dt) {
      return strftime('%Y%m%d%H%M%S', dt);
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
