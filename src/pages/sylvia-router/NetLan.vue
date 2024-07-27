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

  <q-dialog v-model="showEdit" @hide="onHide">
    <q-card style="width: 50%">
      <q-card-section>{{ $t('router.titleEditLan') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-input
            v-model="input.conf4.address"
            :error="inputError.address !== ''"
            :error-message="inputError.address"
            :label="$t('router.ip4addr')"
            @update:model-value="validateAddress"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.conf4.dhcpStart"
            :error="inputError.dhcpStart !== ''"
            :error-message="inputError.dhcpStart"
            :label="$t('router.dhcpStart')"
            @update:model-value="validateDhcpStart"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.conf4.dhcpEnd"
            :error="inputError.dhcpEnd !== ''"
            :error-message="inputError.dhcpEnd"
            :label="$t('router.dhcpEnd')"
            @update:model-value="validateDhcpEnd"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.conf4.leaseTime"
            type="number"
            :error="inputError.leaseTime !== ''"
            :error-message="inputError.leaseTime"
            :label="$t('router.leaseTime')"
            @update:model-value="validateLeaseTime"
          />
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

  <NetLanLeases v-model="showLeases" />
</template>

<script>
import { defineComponent } from 'vue';
import { IPv4 } from 'ip-num/IPNumber';
import { IPv4CidrRange } from 'ip-num/IPRange';
import { IPv4Prefix } from 'ip-num/Prefix';
import { Validator } from 'ip-num/Validator';
import { useStore } from 'stores/system';
import NetLanLeases from './dialogs/NetLanLeases.vue';

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
      inputError: {
        address: '',
        dhcpStart: '',
        dhcpEnd: '',
        leaseTime: '',
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
      this.checkInput();
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
        url: `${this.$root.config.router.base}/api/v1/net/lan`,
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
    onHide() {
      this.inputError = {
        address: '',
        dhcpStart: '',
        dhcpEnd: '',
        leaseTime: '',
      };
    },
    getSettings() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.router.base}/api/v1/net/lan`,
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
    checkInput() {
      this.validateAddresses(
        this.input.conf4.address,
        this.input.conf4.dhcpStart,
        this.input.conf4.dhcpEnd
      );
      this.validateLeaseTime(this.input.conf4.leaseTime);
    },
    validateInput() {
      return !(
        this.inputError.address ||
        this.inputError.dhcpStart ||
        this.inputError.dhcpEnd ||
        this.inputError.leaseTime
      );
    },
    validateAddresses(address, start, end) {
      this.inputError.address = Validator.isValidIPv4CidrNotation(address)[0]
        ? ''
        : this.$t('inputError.addressCidr4');
      this.inputError.dhcpStart = Validator.isValidIPv4String(start)[0]
        ? ''
        : this.$t('inputError.addressV4');
      this.inputError.dhcpEnd = Validator.isValidIPv4String(end)[0]
        ? ''
        : this.$t('inputError.addressV4');
      if (
        this.inputError.address ||
        this.inputError.dhcpStart ||
        this.inputError.dhcpEnd
      ) {
        return;
      }

      const addrIp = IPv4.fromString(
        address.substring(0, address.indexOf('/'))
      );
      const startIp = IPv4.fromString(start);
      const endIp = IPv4.fromString(end);
      const addrCidr = IPv4CidrRange.fromCidr(address);
      const startCidr = IPv4CidrRange.fromCidr(
        `${start}/${addrCidr.cidrPrefix.toString()}`
      );
      const endCidr = IPv4CidrRange.fromCidr(
        `${end}/${addrCidr.cidrPrefix.toString()}`
      );

      if (startIp.isGreaterThan(endIp)) {
        this.inputError.dhcpStart = this.$t('inputError.dhcpStartEnd');
        this.inputError.dhcpEnd = this.$t('inputError.dhcpStartEnd');
        return;
      }
      if (!startCidr.inside(addrCidr)) {
        this.inputError.dhcpStart = this.$t('inputError.dhcpStartEndInMask');
        return;
      }
      if (!endCidr.inside(addrCidr)) {
        this.inputError.dhcpEnd = this.$t('inputError.dhcpStartEndInMask');
        return;
      }
      if (
        addrIp.isGreaterThanOrEquals(startIp) &&
        addrIp.isLessThanOrEquals(endIp)
      ) {
        this.inputError.dhcpStart = this.$t('inputError.dhcpHostInRange');
        this.inputError.dhcpEnd = this.$t('inputError.dhcpHostInRange');
        return;
      }
    },
    validateAddress(value) {
      this.validateAddresses(
        value,
        this.input.conf4.dhcpStart,
        this.input.conf4.dhcpEnd
      );
    },
    validateDhcpStart(value) {
      this.validateAddresses(
        this.input.conf4.address,
        value,
        this.input.conf4.dhcpEnd
      );
    },
    validateDhcpEnd(value) {
      this.validateAddresses(
        this.input.conf4.address,
        this.input.conf4.dhcpStart,
        value
      );
    },
    validateLeaseTime(value) {
      let valid = this.$root.isZeroPositiveInt(value);
      if (valid) {
        const intVal = parseInt(value);
        if (value < 60 || value > 604800) {
          valid = false;
        }
      }
      this.inputError.leaseTime = valid ? '' : this.$t('inputError.dhcpLease');
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
