<template>
  <div class="row items-center">
    <q-card class="col-xs-12 col-sm-8 col-md-6">
      <q-card-section class="row items-center">
        <q-toolbar>
          <q-toolbar-title>{{ $t('router.curSettings') }}</q-toolbar-title>

          <q-space />

          <q-btn
            flat
            icon="edit"
            round
            :disable="loading"
            @click="onEditClick(data.settings)"
          >
            <q-tooltip>{{ $t('buttons.edit') }}</q-tooltip>
          </q-btn>

          <q-btn
            flat
            icon="checklist"
            round
            :disable="loading"
            @click="onLeasesClick(data.settings)"
          >
            <q-tooltip>{{ $t('router.titleLeases') }}</q-tooltip>
          </q-btn>
        </q-toolbar>
      </q-card-section>

      <q-separator />

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.ip4addr') }} :</div>

        <div class="col justify-center">{{ data.settings.conf4.address }}</div>
      </q-card-section>

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.dhcpStart') }} :</div>

        <div class="col justify-center">
          {{ data.settings.conf4.dhcpStart }}
        </div>
      </q-card-section>

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.dhcpEnd') }} :</div>

        <div class="col justify-center">{{ data.settings.conf4.dhcpEnd }}</div>
      </q-card-section>

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.leaseTime') }} :</div>

        <div class="col justify-center">
          {{ data.settings.conf4.leaseTime }}
        </div>
      </q-card-section>
    </q-card>
  </div>

  <q-dialog v-model="showEdit">
    <q-card>
      <q-card-section>{{ $t('router.titleEditLan') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-card-section>
          <q-input
            v-model="input.conf4.address"
            :label="$t('router.ip4addr')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.conf4.dhcpStart"
            :label="$t('router.dhcpStart')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.conf4.dhcpEnd"
            :label="$t('router.dhcpEnd')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.conf4.leaseTime"
            type="number"
            :label="$t('router.leaseTime')"
          />
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat color="primary" v-close-popup @click="onEditOk">
          {{ $t('buttons.ok') }}
        </q-btn>
        <q-btn flat v-close-popup>{{ $t('buttons.cancel') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <NetLanLeases v-model="showLeases" />
</template>

<script>
import { defineComponent } from 'vue';
import { useStore } from 'stores/system';
import config from '../../config.json';
import NetLanLeases from './dialogs/NetLanLeases';

export default defineComponent({
  name: 'LanPage',

  components: {
    NetLanLeases,
  },

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
          conf4: {},
        },
      },
      input: {
        conf4: {
          address: '',
          dhcpStart: '',
          dhcpEnd: '',
          leaseTime: 0,
        },
      },
      loading: false,
      showEdit: false,
      showLeases: false,
      timer: null,
    };
  },

  methods: {
    onEditClick(settings) {
      this.input.conf4 = {
        address: '',
        dhcpStart: '',
        dhcpEnd: '',
        leaseTime: 0,
      };
      if (settings && settings.conf4) {
        this.input.conf4 = {
          address: settings.conf4.address,
          dhcpStart: settings.conf4.dhcpStart,
          dhcpEnd: settings.conf4.dhcpEnd,
          leaseTime: settings.conf4.leaseTime,
        };
        this.showEdit = true;
      }
    },
    onEditOk() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let body = {
        data: {
          conf4: {
            address: this.input.conf4.address.trim(),
            dhcpStart: this.input.conf4.dhcpStart.trim(),
            dhcpEnd: this.input.conf4.dhcpEnd.trim(),
            leaseTime: this.input.conf4.leaseTime,
          },
        },
      };
      if (parseInt(this.input.conf4.leaseTime) !== NaN) {
        body.data.conf4.leaseTime = parseInt(this.input.conf4.leaseTime);
      }
      let opts = {
        method: 'PUT',
        url: `${config.router.base}/api/v1/net/lan`,
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
    onLeasesClick() {
      this.showLeases = true;
    },
    getSettings() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${config.router.base}/api/v1/net/lan`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          self.data.settings.conf4 = resp.data.data.conf4;
          self.timer = setTimeout(self.getSettings, 5000);
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getList);
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
