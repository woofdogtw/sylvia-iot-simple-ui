<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          aria-label="Menu"
          dense
          flat
          icon="menu"
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          {{ $t('progName') + ` v${version}` }}
        </q-toolbar-title>

        <div class="q-ma-xs">
          <div>{{ serviceInfo.name }}</div>

          <div>{{ serviceInfo.version ? `v${serviceInfo.version}` : '' }}</div>
        </div>

        <div></div>

        <div class="q-ma-xs">
          <div>{{ dateStr(time) }}</div>

          <div>{{ timeStr(time) }}</div>
        </div>

        <q-btn
          v-if="store.getTokens().accessToken"
          flat
          icon="account_circle"
          no-cap
          :label="accountInfo.name"
        >
          <q-popup-proxy>
            <q-card>
              <q-card-section>
                <q-item-label>
                  {{ accountInfo.name }}
                </q-item-label>
                <q-icon name="account_circle" />
              </q-card-section>

              <q-card-section>
                <q-btn flat no-caps @click="$root.signout">
                  {{ $t('signout') }}
                </q-btn>
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>

        <q-btn v-else flat no-caps @click="$root.signin">
          {{ $t('signin') }}
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered show-if-above>
      <q-list>
        <q-toolbar>
          <q-toolbar-title>
            {{ $t('menu.title') }}
          </q-toolbar-title>
        </q-toolbar>

        <q-item clickable to="/">
          <q-item-section avatar>
            <q-avatar icon="home" />
          </q-item-section>

          <q-item-section>{{ $t('menu.home') }}</q-item-section>
        </q-item>

        <q-item clickable to="/settings">
          <q-item-section avatar>
            <q-avatar icon="settings" />
          </q-item-section>

          <q-item-section>{{ $t('menu.settings') }}</q-item-section>
        </q-item>

        <q-item clickable to="/about">
          <q-item-section avatar>
            <q-avatar icon="info" />
          </q-item-section>

          <q-item-section>{{ $t('menu.about') }}</q-item-section>
        </q-item>

        <q-expansion-item
          v-if="store.getAccountInfo().account"
          :label="$t('menu.sylviaRouter')"
        >
          <q-item clickable to="/sylvia-router/wan">
            <q-item-section avatar>
              <q-avatar icon="language" />
            </q-item-section>

            <q-item-section>{{ $t('menu.router.wan') }}</q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-router/lan">
            <q-item-section avatar>
              <q-avatar icon="home_work" />
            </q-item-section>

            <q-item-section>{{ $t('menu.router.lan') }}</q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-router/wlan">
            <q-item-section avatar>
              <q-avatar icon="cell_wifi" />
            </q-item-section>

            <q-item-section>{{ $t('menu.router.wlan') }}</q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-router/wwan">
            <q-item-section avatar>
              <q-avatar icon="cell_tower" />
            </q-item-section>

            <q-item-section>{{ $t('menu.router.wwan') }}</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          v-if="store.getAccountInfo().account"
          :label="$t('menu.sylviaCore')"
        >
          <q-item
            v-if="
              store.getAccountInfo().roles &&
              (store.getAccountInfo().roles.admin ||
                store.getAccountInfo().roles.manager)
            "
            clickable
            to="/sylvia-core/user"
          >
            <q-item-section avatar>
              <q-avatar icon="person" />
            </q-item-section>

            <q-item-section>{{ $t('menu.sylvia.user') }}</q-item-section>
          </q-item>

          <q-item
            v-if="
              store.getAccountInfo().roles &&
              (store.getAccountInfo().roles.admin ||
                store.getAccountInfo().roles.dev)
            "
            clickable
            to="/sylvia-core/client"
          >
            <q-item-section avatar>
              <q-avatar icon="terminal" />
            </q-item-section>

            <q-item-section>{{ $t('menu.sylvia.client') }}</q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-core/unit">
            <q-item-section avatar>
              <q-avatar icon="groups" />
            </q-item-section>

            <q-item-section>{{ $t('menu.sylvia.unit') }}</q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-core/application">
            <q-item-section avatar>
              <q-avatar icon="apps" />
            </q-item-section>

            <q-item-section>{{ $t('menu.sylvia.application') }}</q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-core/network">
            <q-item-section avatar>
              <q-avatar icon="hub" />
            </q-item-section>

            <q-item-section>{{ $t('menu.sylvia.network') }}</q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-core/device">
            <q-item-section avatar>
              <q-avatar icon="settings_remote" />
            </q-item-section>

            <q-item-section>{{ $t('menu.sylvia.device') }}</q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-core/device-route">
            <q-item-section avatar>
              <q-avatar icon="share" />
            </q-item-section>

            <q-item-section>{{ $t('menu.sylvia.deviceRoute') }}</q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-core/network-route">
            <q-item-section avatar>
              <q-avatar icon="share" />
            </q-item-section>

            <q-item-section>
              {{ $t('menu.sylvia.networkRoute') }}
            </q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-core/dldata-buffer">
            <q-item-section avatar>
              <q-avatar icon="cloud_download" />
            </q-item-section>

            <q-item-section>
              {{ $t('menu.sylvia.dlDataBuffer') }}
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          v-if="store.getAccountInfo().account"
          :label="$t('menu.sylviaData')"
        >
          <q-item clickable to="/sylvia-data/application">
            <q-item-section avatar>
              <q-avatar icon="apps" />
            </q-item-section>

            <q-item-section>{{ $t('menu.data.application') }}</q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-data/network">
            <q-item-section avatar>
              <q-avatar icon="hub" />
            </q-item-section>

            <q-item-section>{{ $t('menu.data.network') }}</q-item-section>
          </q-item>

          <q-item clickable to="/sylvia-data/opdata">
            <q-item-section avatar>
              <q-avatar icon="event_note" />
            </q-item-section>

            <q-item-section>{{ $t('menu.data.operation') }}</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          v-if="store.getAccountInfo().account"
          :label="$t('menu.networkManagement')"
        >
          <q-item clickable to="/network/lora-ifroglab">
            <q-item-section avatar> </q-item-section>

            <q-item-section>
              {{ $t('menu.network.loraIfroglab') }}
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          v-if="store.getAccountInfo().account"
          :label="$t('menu.applicationManagement')"
        >
          <q-item clickable to="/application/app-demo">
            <q-item-section avatar> </q-item-section>

            <q-item-section>
              {{ $t('menu.application.appDemo') }}
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container @refreshtoken="getTokenInfo">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { createI18n } from 'vue-i18n';
import strftime from 'strftime';
import { useStore } from 'stores/system';
import { version } from '../../package.json';

const DEFAULT_LANGUAGE = 'en-us';
const DEFAULT_THEME = 'auto';

export default defineComponent({
  name: 'MainLayout',

  created() {
    const language = this.store.getLanguage() || DEFAULT_LANGUAGE;
    this.store.setLanguage(language);
    this.$i18n.locale = language;

    const theme = this.store.getTheme() || DEFAULT_THEME;
    switch (theme) {
      case 'dark':
        this.store.setTheme(theme);
        this.$q.dark.set(true);
        break;
      case 'light':
        this.store.setTheme(theme);
        this.$q.dark.set(false);
        break;
      default:
        this.store.setTheme('auto');
        this.$q.dark.set('auto');
        break;
    }

    if (this.$route.path === '/sylvia-core/redirect') {
      return;
    }

    this.accountInfo = this.store.getAccountInfo();
    this.getVersion();
    this.getTokenInfo();
    this.getSysTime();
  },

  data() {
    return {
      accountInfo: {},
      serviceInfo: {
        name: '',
        version: '',
      },
      time: new Date('invalid'),
      version,
    };
  },

  methods: {
    getVersion() {
      let opts = {
        method: 'GET',
        url: `${this.$root.config.coremgr.base}/../version`,
      };
      let self = this;
      this.$axios(opts)
        .then((resp) => {
          self.serviceInfo = resp.data.data;
        })
        .catch((err) => {
          self.$root.errorHandler(err, self.getTokenInfo);
        });
    },
    getTokenInfo() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.coremgr.base}/api/v1/auth/tokeninfo`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.$axios(opts)
        .then((resp) => {
          const info = resp.data.data;
          self.store.setAccountInfo(info);
          self.accountInfo = info;
        })
        .catch((err) => {
          self.$root.errorHandler(err, self.getTokenInfo);
        });
    },
    getSysTime() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.router.base}/api/v1/sys/time`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          self.time = new Date(resp.data.data.time);
          if (isNaN(self.time)) {
            return;
          }

          // Set a timer to get time information at the next minute.
          setTimeout(() => {
            self.getSysTime();
          }, 60000 - (self.time.getTime() % 60000));
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getSysTime);
        });
    },
    dateStr(apiTime) {
      const t = new Date(apiTime);
      return isNaN(t) ? '' : strftime('%Y/%m/%d', t);
    },
    timeStr(apiTime) {
      const t = new Date(apiTime);
      return isNaN(t) ? '' : strftime('%H:%M', t);
    },
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const { locale } = createI18n({ useScope: 'global' });
    const store = useStore();

    return {
      leftDrawerOpen,
      locale,
      store,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
