<template>
  <q-page class="flex flex-center"> Redirect </q-page>
</template>

<script>
import qs from 'qs';
import { defineComponent } from 'vue';
import { parseQuery } from 'vue-router';
import { useStore } from 'stores/system';

export default defineComponent({
  name: 'IndexPage',

  created() {
    let query = parseQuery(window.location.search);
    if (!query.code) {
      this.$router.push('/');
      return;
    }
    let state = query.state || '/';

    let opts = {
      method: 'POST',
      url: `${this.$root.config.auth.base}/oauth2/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({
        grant_type: 'authorization_code',
        code: query.code,
        redirect_uri: this.$root.config.auth.redirectUri,
        client_id: this.$root.config.auth.clientId,
      }),
    };
    let self = this;
    this.$axios(opts)
      .then((resp) => {
        let data = resp.data;
        self.store.setTokens(data.access_token, data.refresh_token);
        selt.$emit('refreshtoken');
        self.$router.replace({ query: null });
        self.$router.push(state);
      })
      .catch((_err) => {
        self.$router.replace({ query: null });
        self.$router.push('/');
      });
  },

  setup() {
    const store = useStore();

    return {
      store,
    };
  },
});
</script>
