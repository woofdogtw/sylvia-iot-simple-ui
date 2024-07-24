<template>
  <q-dialog @show="onShow">
    <q-card>
      <q-card-section>{{ $t('appDemo.titleSendData') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-input v-model="networkCode" :label="$t('appDemo.networkCode')" />

        <q-input v-model="networkAddr" :label="$t('appDemo.networkAddr')" />

        <q-select
          v-model="payloadType"
          emit-value
          :option-label="(item) => $t('types.' + item)"
          :options="payloadTypes"
          :label="$t('appDemo.sendPayloadType')"
        />

        <q-input v-model="payload" :label="$t('appDemo.sendPayload')" />

        <q-btn
          :disable="!networkCode || !networkAddr || !payload"
          @click="onSendClick"
        >
          {{ $t('buttons.send') }}
        </q-btn>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat color="primary" v-close-popup>
            {{ $t('buttons.ok') }}
          </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue';
import { useStore } from 'stores/system';

const TYPE_HEX = 'hex';
const TYPE_STR = 'string';

export default defineComponent({
  name: 'SendDataDialog',

  data() {
    return {
      data: {
        deviceList: [],
      },
      networkCode: '',
      networkAddr: '',
      payload: '',
      payloadType: TYPE_STR,
      payloadTypes: [TYPE_STR, TYPE_HEX],
    };
  },

  methods: {
    onShow() {
      this.getDeviceList();
    },
    onSendClick() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let body = {
        data: {
          networkCode: this.networkCode,
          networkAddr: this.networkAddr,
          payload:
            this.payloadType === TYPE_HEX
              ? this.payload
              : this.strToHex(this.payload),
        },
      };
      let opts = {
        method: 'POST',
        url: `${this.$root.config.appDemo.base}/api/v1/data/dldata`,
        data: body,
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((_resp) => {
          self.payload = '';
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.onSendClick);
        });
    },
    getDeviceList() {
      let opts = {
        method: 'GET',
        url: `${this.$root.config.appDemo.base}/api/v1/data/dldata`,
      };
      let self = this;
      this.$axios(opts)
        .then((resp) => {
          const list = resp.data.data;
          self.data.deviceList = list;
          self.deviceId =
            list.length > 0 ? self.data.deviceList[0].deviceId : '';
        })
        .catch((err) => {
          self.$root.errorHandler(err, self.getUnitList);
        });
    },
    strToHex(str) {
      let arr = [];
      for (let n = 0; n < str.length; n++) {
        var hex = Number(str.charCodeAt(n)).toString(16);
        arr.push(hex);
      }
      return arr.join('');
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
