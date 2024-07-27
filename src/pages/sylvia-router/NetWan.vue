<template>
  <div class="row items-center">
    <q-card
      class="col-xs-12 col-sm-8 col-md-6"
      v-for="(item, i) in data.list"
      :key="i"
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

  <q-dialog v-model="showEdit" @hide="onHide">
    <q-card style="width: 50%">
      <q-card-section>{{ $t('router.titleEditWan') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-select
          v-model="input.showType"
          emit-value
          map-options
          option-label="label"
          option-value="value"
          :label="$t('router.wanType')"
          :options="showTypes"
          @update:model-value="checkInput"
        />
        <q-card-section>
          <q-input
            v-model="input.static4.address"
            v-if="input.showType === 'typeStatic'"
            :error="inputError.address !== ''"
            :error-message="inputError.address"
            :label="$t('router.ip4addr')"
            @update:model-value="validateAddress"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.static4.gateway"
            v-if="input.showType === 'typeStatic'"
            :error="inputError.gateway !== ''"
            :error-message="inputError.gateway"
            :label="$t('router.ip4gw')"
            @update:model-value="validateGateway"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.static4.dns"
            v-if="input.showType === 'typeStatic'"
            :error="inputError.dns !== ''"
            :error-message="inputError.dns"
            :label="$t('router.ip4dns')"
            @update:model-value="validateDns"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.pppoe.username"
            v-if="input.showType === 'typePppoe'"
            :error="inputError.username !== ''"
            :error-message="inputError.username"
            :label="$t('router.username')"
            @update:model-value="validateUserName"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.pppoe.password"
            v-if="input.showType === 'typePppoe'"
            :error="inputError.password !== ''"
            :error-message="inputError.password"
            :label="$t('router.password')"
            :type="isPassword ? 'password' : 'text'"
            @update:model-value="validatePassword"
          >
            <template v-slot:append>
              <q-icon
                class="cursor-pointer"
                :name="isPassword ? 'visibility_off' : 'visibility'"
                @click="isPassword = !isPassword"
              />
            </template>
          </q-input>
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn
          color="primary"
          flat
          v-close-popup
          :disable="!validateInput()"
          @click="onEditOk"
        >
          {{ $t('buttons.ok') }}
        </q-btn>
        <q-btn flat v-close-popup>{{ $t('buttons.cancel') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue';
import { Validator } from 'ip-num/Validator';
import { useStore } from 'stores/system';

const TYPE_DISABLE = 'disable';
const TYPE_DHCP = 'dhcp';
const TYPE_ETH = 'ethernet';
const TYPE_PPPOE = 'pppoe';
const TYPE_STATIC = 'static';
const SHOW_TYPE_DISABLE = 'typeDisable';
const SHOW_TYPE_DHCP = 'typeDhcp';
const SHOW_TYPE_PPPOE = 'typePppoe';
const SHOW_TYPE_STATIC = 'typeStatic';

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
        showType: SHOW_TYPE_DISABLE,
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
      inputError: {
        address: '',
        gateway: '',
        dns: '',
        username: '',
        password: '',
      },
      loading: false,
      showEdit: false,
      timer: null,
      isPassword: true,
      showTypes: [
        {
          label: this.$t('router.typeDisable'),
          value: SHOW_TYPE_DISABLE,
        },
        {
          label: this.$t('router.typeStatic'),
          value: SHOW_TYPE_STATIC,
        },
        {
          label: this.$t('router.typeDhcp'),
          value: SHOW_TYPE_DHCP,
        },
        {
          label: this.$t('router.typePppoe'),
          value: SHOW_TYPE_PPPOE,
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
      if (data.showType === SHOW_TYPE_STATIC) {
        if (data.conf.static4) {
          this.input.static4 = {
            address: data.conf.static4.address,
            gateway: data.conf.static4.gateway,
            dns: data.conf.static4.dns.join(','),
          };
        }
      } else if (data.showType === SHOW_TYPE_PPPOE) {
        if (data.conf.pppoe) {
          this.input.pppoe = {
            username: data.conf.pppoe.username,
            password: data.conf.pppoe.password,
          };
        }
      }
      this.showEdit = true;
      this.checkInput();
    },
    onEditOk() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let body = { data: { type: TYPE_DISABLE } };
      if (this.input.showType === SHOW_TYPE_DHCP) {
        body.data.type = TYPE_ETH;
        body.data.type4 = TYPE_DHCP;
      } else if (this.input.showType === SHOW_TYPE_STATIC) {
        body.data.type = TYPE_ETH;
        body.data.type4 = TYPE_STATIC;
        body.data.static4 = {
          address: this.input.static4.address.trim(),
          gateway: this.input.static4.gateway.trim(),
          dns: this.$root.str2arr(this.input.static4.dns),
        };
      } else if (this.input.showType === SHOW_TYPE_PPPOE) {
        body.data.type = TYPE_PPPOE;
        body.data.pppoe = {
          username: this.input.pppoe.username.toLowerCase(),
          password: this.input.pppoe.password,
        };
      }
      let opts = {
        method: 'PUT',
        url: `${this.$root.config.router.base}/api/v1/net/wan/${this.input.wanId}`,
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
    onHide() {
      this.inputError = {
        address: '',
        gateway: '',
        dns: '',
        username: '',
        password: '',
      };
    },
    getSettings() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.router.base}/api/v1/net/wan`,
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
        return SHOW_TYPE_DISABLE;
      } else if (data.conf.type === TYPE_PPPOE) {
        return SHOW_TYPE_PPPOE;
      } else if (data.conf.type !== TYPE_ETH) {
        return SHOW_TYPE_DISABLE;
      }
      if (data.conf.type4 === TYPE_STATIC) {
        return SHOW_TYPE_STATIC;
      } else if (data.conf.type4 === TYPE_DHCP) {
        return SHOW_TYPE_DHCP;
      }
      return SHOW_TYPE_DISABLE;
    },
    checkInput() {
      this.validateAddress(this.input.static4.address);
      this.validateGateway(this.input.static4.gateway);
      this.validateDns(this.input.static4.dns);
      this.validateUserName(this.input.pppoe.username);
      this.validatePassword(this.input.pppoe.password);
    },
    validateInput() {
      return !(
        this.inputError.address ||
        this.inputError.gateway ||
        this.inputError.dns ||
        this.inputError.username ||
        this.inputError.password
      );
    },
    validateAddress(value) {
      let valid =
        this.input.showType === SHOW_TYPE_STATIC
          ? Validator.isValidIPv4CidrNotation(value)[0]
          : true;
      this.inputError.address = valid ? '' : this.$t('inputError.addressCidr4');
    },
    validateGateway(value) {
      let valid =
        this.input.showType === SHOW_TYPE_STATIC
          ? value === '' || Validator.isValidIPv4String(value)[0]
          : true;
      this.inputError.gateway = valid ? '' : this.$t('inputError.addressV4');
    },
    validateDns(value) {
      let valid = true;
      if (this.input.showType === SHOW_TYPE_STATIC) {
        const arr = this.$root.str2arr(value);
        for (const item of arr) {
          if (!Validator.isValidIPv4String(item)[0]) {
            valid = false;
            break;
          }
        }
      }
      this.inputError.dns = valid ? '' : this.$t('inputError.addressV4Many');
    },
    validateUserName(value) {
      let valid = this.input.showType === SHOW_TYPE_PPPOE ? !!value : true;
      this.inputError.username = valid ? '' : this.$t('inputError.empty');
    },
    validatePassword(value) {
      let valid = this.input.showType === SHOW_TYPE_PPPOE ? !!value : true;
      this.inputError.password = valid ? '' : this.$t('inputError.empty');
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
