<template>
  <div class="row items-center">
    <q-card class="col-xs-12 col-sm-8 col-md-6">
      <q-card-section class="row items-center">
        <q-toolbar>
          <q-toolbar-title>{{ $t('router.curStatus') }}</q-toolbar-title>

          <q-space />

          <q-btn
            flat
            color="primary"
            v-if="data.settings.enable"
            :disable="loading"
            @click="onDisconnectClick"
          >
            {{ $t('buttons.disconnect') }}
          </q-btn>
        </q-toolbar>
      </q-card-section>

      <q-separator />

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.ssid') }} :</div>

        <div class="col justify-center">
          {{ data.settings.conf ? data.settings.conf.ssid : '' }}
        </div>
      </q-card-section>

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.ip4addr') }} :</div>

        <div class="col justify-center">
          {{ data.settings.conn4 ? data.settings.conn4.address : '' }}
        </div>
      </q-card-section>

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.ip4gw') }} :</div>

        <div class="col justify-center">
          {{ data.settings.conn4 ? data.settings.conn4.gateway : '' }}
        </div>
      </q-card-section>

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.ip4dns') }} :</div>

        <div class="col justify-center">
          {{ data.settings.conn4 ? data.settings.conn4.dns.join(',') : '' }}
        </div>
      </q-card-section>
    </q-card>
  </div>

  <div class="row items-center">
    <q-card class="col-xs-12 col-sm-8 col-md-6">
      <q-card-section class="row items-center">
        <q-toolbar>
          <q-toolbar-title>{{ $t('router.apList') }}</q-toolbar-title>

          <q-space />

          <q-btn
            flat
            icon="refresh"
            round
            :disable="loading"
            @click="onRefreshClick"
          >
            <q-tooltip>{{ $t('buttons.refresh') }}</q-tooltip>
          </q-btn>
        </q-toolbar>
      </q-card-section>

      <q-card-section
        v-for="(item, i) in data.list"
        :key="i"
        class="row items-center"
      >
        <q-separator />

        <div class="col-3">{{ item.ssid }}</div>

        <div class="col-3">{{ item.security.join(',') }}</div>

        <div class="col-2">{{ item.channel }}</div>

        <div class="col-2">{{ item.signal }}</div>

        <q-btn
          flat
          color="primary"
          v-if="!data.settings.enable"
          :disable="loading"
          @click="onConnectClick(item)"
        >
          {{ $t('buttons.connect') }}
        </q-btn>
      </q-card-section>
    </q-card>
  </div>

  <q-dialog v-model="showConnect">
    <q-card>
      <q-card-section
        >{{ $t('router.titleConnect') }} {{ data.input.ssid }}</q-card-section
      >

      <q-separator />

      <q-card-section>
        <q-input
          v-model="input.password"
          :type="isPassword ? 'password' : 'text'"
          :label="$t('router.password')"
        >
          <template v-slot:append>
            <q-icon
              :name="isPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPassword = !isPassword"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat color="primary" v-close-popup @click="onConnectOk">
          {{ $t('buttons.ok') }}
        </q-btn>
        <q-btn flat v-close-popup>{{ $t('buttons.cancel') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue';
import { useStore } from 'stores/system';

export default defineComponent({
  name: 'WwanPage',

  beforeUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },

  created() {
    this.userInfo = this.store.getAccountInfo();
    this.getSettings();
  },

  data() {
    return {
      userInfo: {},
      data: {
        settings: {
          enable: false,
        },
        list: [], // AP list
      },
      input: {
        ssid: '',
        password: '',
      },
      loading: false,
      isPassword: true,
      showConnect: false,
      timer: null,
    };
  },

  methods: {
    onConnectClick(data) {
      this.input.ssid = data.ssid;
      this.input.password = '';
      this.isPassword = true;

      if (!data.security || data.security.length <= 0) {
        return void this.onConnectOk();
      }
      this.showConnect = true;
    },
    onConnectOk() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let body = {
        data: {
          enable: true,
          conf: {
            ssid: this.input.ssid,
          },
        },
      };
      if (this.input.password) {
        body.data.conf.password = this.input.password;
      }
      let opts = {
        method: 'PUT',
        url: `${this.$root.config.router.base}/api/v1/net/wwan`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        data: body,
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((_resp) => {
          self.$q.notify(self.$t('messages.success'));
          clearTimeout(self.timer);
          self.getSettings();
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.onConnectOk);
        });
    },
    onDisconnectClick() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let body = { data: { enable: false } };
      let opts = {
        method: 'PUT',
        url: `${this.$root.config.router.base}/api/v1/net/wwan`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        data: body,
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((_resp) => {
          self.$q.notify(self.$t('messages.success'));
          clearTimeout(self.timer);
          self.getSettings();
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.onEditOk);
        });
    },
    onRefreshClick() {
      clearTimeout(self.timer);
      this.getApList(true);
    },
    getSettings() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.router.base}/api/v1/net/wwan`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          clearTimeout(self.timer);
          self.data.settings = resp.data.data;
          self.timer = setTimeout(() => {
            self.getApList(false);
          }, 0);
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getSettings);
        });
    },
    getApList(rescan) {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.router.base}/api/v1/net/wwan/list`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      if (rescan) {
        opts.url += '?=rescan=true';
      }
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          clearTimeout(self.timer);
          let list = [];
          for (const d of resp.data.data) {
            if (
              self.data.settings &&
              self.data.settings.enable &&
              self.data.settings.conf &&
              self.data.settings.conf.ssid === d.ssid
            ) {
              continue;
            }
            list.push(d);
          }
          self.data.list = list;
          self.timer = setTimeout(self.getSettings, 5000);
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, () => {
            self.getApList(rescan);
          });
        });
    },
  },

  setup() {
    const store = useStore();

    return {
      store,
    };
  },
});
</script>
