<template>
  <q-dialog @show="onShow">
    <q-card>
      <q-card-section>{{ $t('network.titleSendData') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-select
          v-model="deviceId"
          emit-value
          option-value="deviceId"
          option-label="networkAddr"
          :options="data.deviceList"
          :label="$t('network.sendDevice')"
        />

        <q-select
          v-model="payloadType"
          emit-value
          :option-label="(item) => $t('types.' + item)"
          :options="payloadTypes"
          :label="$t('network.sendPayloadType')"
        />

        <q-input v-model="payload" :label="$t('network.sendPayload')" />

        <q-btn :disable="!deviceId || !payload" @click="onSendClick">
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
import { Buffer } from 'buffer';
import qs from 'qs';
import { useStore } from 'stores/system';

const TYPE_HEX = 'hex';
const TYPE_STR = 'string';

export default defineComponent({
  name: 'NetworkStatsDialog',

  props: {
    unitId: String,
    networkId: String,
  },

  data() {
    return {
      data: {
        deviceList: [],
      },
      deviceId: '',
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
          deviceId: this.deviceId,
          payload:
            this.payloadType === TYPE_HEX
              ? this.payload
              : Buffer.from(this.payload).toString('hex'),
        },
      };
      let opts = {
        method: 'POST',
        url: `${this.$root.config.coremgr.base}/api/v1/network/${this.networkId}/uldata`,
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
          self.payload = '';
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.onSendClick);
        });
    },
    getDeviceList() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let query = {
        unit: this.unitId,
        limit: 0,
      };
      let opts = {
        method: 'GET',
        url: `${
          this.$root.config.coremgr.base
        }/api/v1/device/list?${qs.stringify(query)}`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
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
  },

  setup() {
    const store = useStore();

    return {
      store,
    };
  },
});
</script>
