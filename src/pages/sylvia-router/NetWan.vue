<template>
  <div class="row items-center">
    <q-card
      v-for="(item, i) in data.list"
      :key="i"
      class="col-xs-12 col-sm-8 col-md-6"
    >
      <q-card-section class="row items-center">
        <q-toolbar>
          <q-toolbar-title>
            {{ item.wanId }} - {{ $t('router.curSettings') }}
          </q-toolbar-title>

          <q-space />

          <q-btn
            flat
            icon="edit"
            round
            :disable="loading"
            @click="onEditClick(item)"
          >
            <q-tooltip>{{ $t('buttons.edit') }}</q-tooltip>
          </q-btn>
        </q-toolbar>
      </q-card-section>

      <q-separator />

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.wanType') }} :</div>

        <div class="col justify-center">
          {{ $t('router.' + item.showType) }}
        </div>
      </q-card-section>

      <q-card-section
        class="row items-center"
        v-if="item.showType === 'typeStatic'"
      >
        <div class="col justify-center">{{ $t('router.ip4addr') }} :</div>

        <div class="col justify-center">{{ item.conf.static4.address }}</div>
      </q-card-section>

      <q-card-section
        class="row items-center"
        v-if="item.showType === 'typeStatic'"
      >
        <div class="col justify-center">{{ $t('router.ip4gw') }} :</div>

        <div class="col justify-center">{{ item.conf.static4.gateway }}</div>
      </q-card-section>

      <q-card-section
        class="row items-center"
        v-if="item.showType === 'typeStatic'"
      >
        <div class="col justify-center">{{ $t('router.ip4dns') }} :</div>

        <div class="col justify-center">
          {{ item.conf.static4.dns.join(',') }}
        </div>
      </q-card-section>

      <q-card-section
        class="row items-center"
        v-if="item.showType === 'typePppoe'"
      >
        <div class="col justify-center">{{ $t('router.username') }} :</div>

        <div class="col justify-center">{{ item.conf.pppoe.username }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="row items-center">
        <q-toolbar>
          <q-toolbar-title>{{ $t('router.curStatus') }}</q-toolbar-title>
        </q-toolbar>
      </q-card-section>

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.ip4addr') }} :</div>

        <div class="col justify-center">{{ item.conn4.address }}</div>
      </q-card-section>

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.ip4gw') }} :</div>

        <div class="col justify-center">{{ item.conn4.gateway }}</div>
      </q-card-section>

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.ip4dns') }} :</div>

        <div class="col justify-center">{{ item.conn4.dns.join(',') }}</div>
      </q-card-section>
    </q-card>
  </div>

  <q-dialog v-model="showEdit">
    <q-card>
      <q-card-section>{{ $t('router.titleEditWan') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-select
          v-model="input.showType"
          emit-value
          map-options
          option-value="value"
          option-label="label"
          :options="showTypes"
          :label="$t('router.wanType')"
        />
        <q-card-section>
          <q-input
            v-model="input.static4.address"
            v-if="input.showType === 'typeStatic'"
            :label="$t('router.ip4addr')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.static4.gateway"
            v-if="input.showType === 'typeStatic'"
            :label="$t('router.ip4gw')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.static4.dns"
            v-if="input.showType === 'typeStatic'"
            :label="$t('router.ip4dns')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.pppoe.username"
            v-if="input.showType === 'typePppoe'"
            :label="$t('router.username')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.pppoe.password"
            v-if="input.showType === 'typePppoe'"
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
</template>

<script>
import { defineComponent } from 'vue';
import { useStore } from 'stores/system';
import config from '../../config.json';

const TYPE_DISABLE = 'disable';
const TYPE_DHCP = 'dhcp';
const TYPE_ETH = 'ethernet';
const TYPE_PPPOE = 'pppoe';
const TYPE_STATIC = 'static';

export default defineComponent({
  name: 'WanPage',

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
        list: [], // additional "showType" field for displaying template
      },
      input: {
        wanId: '',
        show: 'typeDisable',
        static4: {
          address: '',
          gateway: '',
          dns: '',
        },
        pppoe: {
          username: '',
          password: '',
        },
      },
      loading: false,
      showEdit: false,
      timer: null,
      isPassword: true,
      showTypes: [
        {
          label: this.$t('router.typeDisable'),
          value: 'typeDisable',
        },
        {
          label: this.$t('router.typeStatic'),
          value: 'typeStatic',
        },
        {
          label: this.$t('router.typeDhcp'),
          value: 'typeDhcp',
        },
        {
          label: this.$t('router.typePppoe'),
          value: 'typePppoe',
        },
      ],
    };
  },

  methods: {
    onEditClick(data) {
      if (!data.conf) {
        return;
      }

      this.isPassword = true;
      this.input = {
        wanId: data.wanId,
        showType: data.showType,
        static4: {
          address: '',
          gateway: '',
          dns: '',
        },
        pppoe: {
          username: '',
          password: '',
        },
      };
      if (data.showType === 'typeStatic') {
        if (data.conf.static4) {
          this.input.static4 = {
            address: data.conf.static4.address,
            gateway: data.conf.static4.gateway,
            dns: data.conf.static4.dns.join(','),
          };
        }
      } else if (data.showType === 'typePppoe') {
        if (data.conf.pppoe) {
          this.input.pppoe = {
            username: data.conf.pppoe.username,
            password: data.conf.pppoe.password,
          };
        }
      }
      this.showEdit = true;
    },
    onEditOk() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let body = { data: { type: TYPE_DISABLE } };
      if (this.input.showType === 'typeDhcp') {
        body.data.type = TYPE_ETH;
        body.data.type4 = TYPE_DHCP;
      } else if (this.input.showType === 'typeStatic') {
        body.data.type = TYPE_ETH;
        body.data.type4 = TYPE_STATIC;
        body.data.static4 = {
          address: this.input.static4.address.trim(),
          gateway: this.input.static4.gateway.trim(),
          dns: [],
        };
        let inputDns = this.input.static4.dns.split(',');
        for (let i = 0; i < inputDns.length; i++) {
          const dns = inputDns[i].trim();
          if (dns.length > 0) {
            body.data.static4.dns.push(dns);
          }
        }
      } else if (this.input.showType === 'typePppoe') {
        body.data.type = TYPE_PPPOE;
        body.data.pppoe = {
          username: this.input.pppoe.username.toLowerCase(),
          password: this.input.pppoe.password,
        };
      }
      let opts = {
        method: 'PUT',
        url: `${config.router.base}/api/v1/net/wan/${this.input.wanId}`,
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
    getSettings() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${config.router.base}/api/v1/net/wan`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          let list = resp.data.data;
          for (let i = 0; i < list.length; i++) {
            list[i].showType = self.transShowType(list[i]);
          }
          self.data.list = list;
          self.timer = setTimeout(self.getSettings, 5000);
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getList);
        });
    },
    transShowType(data) {
      if (!data.conf || data.conf.type === TYPE_DISABLE) {
        return 'typeDisable';
      } else if (data.conf.type === TYPE_PPPOE) {
        return 'typePppoe';
      } else if (data.conf.type !== TYPE_ETH) {
        return 'typeDisable';
      }
      if (data.conf.type4 === TYPE_STATIC) {
        return 'typeStatic';
      } else if (data.conf.type4 === TYPE_DHCP) {
        return 'typeDhcp';
      }
      return 'typeDisable';
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
