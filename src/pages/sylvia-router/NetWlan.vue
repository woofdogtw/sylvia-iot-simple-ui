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
        </q-toolbar>
      </q-card-section>

      <q-separator />

      <q-card-section class="row items-center">
        <div class="col justify-center">{{ $t('router.status') }} :</div>

        <div class="col justify-center">
          {{
            data.settings.enable
              ? $t('router.statusEnabled')
              : $t('router.statusDisabled')
          }}
        </div>
      </q-card-section>

      <q-card-section class="row items-center" v-if="data.settings.enable">
        <div class="col justify-center">{{ $t('router.ssid') }} :</div>

        <div class="col justify-center">{{ data.settings.conf.ssid }}</div>
      </q-card-section>

      <q-card-section class="row items-center" v-if="data.settings.enable">
        <div class="col justify-center">{{ $t('router.channel') }} :</div>

        <div class="col justify-center">{{ data.settings.conf.channel }}</div>
      </q-card-section>

      <q-card-section class="row items-center" v-if="data.settings.enable">
        <div class="col justify-center">{{ $t('router.password') }} :</div>

        <div class="col justify-center">
          <div class="col justify-start">
            {{ showPassword ? data.settings.conf.password : '' }}
          </div>
          <q-toggle class="col justify-end" v-model="showPassword">{{
            $t('router.showPassword')
          }}</q-toggle>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <q-dialog v-model="showEdit" @hide="onHide">
    <q-card style="width: 50%">
      <q-card-section>{{ $t('router.titleEditWlan') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-checkbox
            v-model="input.enable"
            :label="$t('router.statusEnabled')"
            @update:model-value="checkInput"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.conf.ssid"
            v-if="input.enable"
            :error="inputError.ssid !== ''"
            :error-message="inputError.ssid"
            :label="$t('router.ssid')"
            @update:model-value="validateSsid"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.conf.channel"
            v-if="input.enable"
            type="number"
            :error="inputError.channel !== ''"
            :error-message="inputError.channel"
            :label="$t('router.channel')"
            @update:model-value="validateChannel"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.conf.password"
            v-if="input.enable"
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
import { useStore } from 'stores/system';

export default defineComponent({
  name: 'WlanPage',

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
          conf: {},
        },
      },
      input: {
        enable: true,
        conf: {
          ssid: '',
          channel: 1,
          password: '',
        },
      },
      inputError: {
        ssid: '',
        channel: '',
        password: '',
      },
      loading: false,
      isPassword: true,
      showPassword: false,
      showEdit: false,
      timer: null,
    };
  },

  methods: {
    onEditClick(settings) {
      this.isPassword = true;
      this.input.enable = false;
      this.input.conf.ssid = '';
      this.input.conf.channel = 1;
      this.input.conf.password = '';
      if (settings) {
        this.input.enable = settings.enable;
        if (settings.enable && settings.conf) {
          this.input.conf.ssid = settings.conf.ssid;
          this.input.conf.channel = settings.conf.channel;
          this.input.conf.password = settings.conf.password;
        }
        this.showEdit = true;
      }
      this.checkInput();
    },
    onEditOk() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let body = {
        data: {
          enable: this.input.enable,
        },
      };
      if (this.input.enable) {
        body.data.conf = {
          ssid: this.input.conf.ssid,
          channel: 1,
          password: this.input.conf.password,
        };
        if (parseInt(this.input.conf.channel) !== NaN) {
          body.data.conf.channel = parseInt(this.input.conf.channel);
        }
      }
      let opts = {
        method: 'PUT',
        url: `${this.$root.config.router.base}/api/v1/net/wlan`,
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
        ssid: '',
        channel: '',
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
        url: `${this.$root.config.router.base}/api/v1/net/wlan`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          self.data.settings = resp.data.data;
          self.timer = setTimeout(self.getSettings, 5000);
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getList);
        });
    },
    checkInput() {
      this.validateSsid(this.input.conf.ssid);
      this.validateChannel(this.input.conf.channel);
      this.validatePassword(this.input.conf.password);
    },
    validateInput() {
      return !(
        this.inputError.ssid ||
        this.inputError.channel ||
        this.inputError.password
      );
    },
    validateSsid(value) {
      let valid = this.input.enable ? !!value : true;
      this.inputError.ssid = valid ? '' : this.$t('inputError.empty');
    },
    validateChannel(value) {
      let valid = this.input.enable
        ? this.$root.isZeroPositiveInt(value)
        : true;
      if (this.input.enable && valid) {
        const intVal = parseInt(value);
        if (intVal === 0 || intVal > 11) {
          valid = false;
        }
      }
      this.inputError.channel = valid ? '' : this.$t('inputError.wifiChannel');
      return valid;
    },
    validatePassword(value) {
      let valid = this.input.enable ? value.length >= 8 : true;
      this.inputError.password = valid
        ? ''
        : this.$t('inputError.wifiPassword');
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
