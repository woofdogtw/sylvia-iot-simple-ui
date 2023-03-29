<template>
  <q-dialog @show="onShow" @hide="onHide">
    <q-card>
      <q-card-section>{{ $t('application.titleStats') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-markup-table flat dense>
          <thead>
            <tr>
              <th>{{ $t('application.statsQueue') }}</th>
              <th>{{ $t('application.statsConsumers') }}</th>
              <th>{{ $t('application.statsMessages') }}</th>
              <th>{{ $t('application.statsPublishRate') }}</th>
              <th>{{ $t('application.statsDeliverRate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, queue) in data.stats" :key="queue">
              <th>{{ queueKeyToName(queue) }}</th>
              <th>{{ item.consumers }}</th>
              <th>{{ item.messages }}</th>
              <th>{{ item.publishRate }}</th>
              <th>{{ item.deliverRate }}</th>
            </tr>
          </tbody>
        </q-markup-table>

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

export default defineComponent({
  name: 'ApplicationStatsDialog',

  props: {
    applicationId: String,
  },

  data() {
    return {
      data: {
        stats: {},
      },
      timer: null,
      interval: 1000,
    };
  },

  methods: {
    onHide() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },
    onShow() {
      this.timer = setTimeout(this.onTimer, 0);
    },
    onTimer() {
      if (!this.timer) {
        return;
      }
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let query = {};
      if (this.search) {
        query.contains = this.search;
      }
      if (this.selectUnit) {
        query.unit = this.selectUnit;
      }
      let opts = {
        method: 'GET',
        url: `${this.$root.config.coremgr.base}/api/v1/application/${this.applicationId}/stats`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.$axios(opts)
        .then((resp) => {
          self.data.stats = resp.data.data;
          if (self.timer) {
            self.timer = setTimeout(self.onTimer, self.interval);
          }
        })
        .catch((err) => {
          self.$root.errorHandler(err, self.getCount);
        });
    },
    queueKeyToName(queue) {
      switch (queue) {
        case 'uldata':
          return 'uldata';
        case 'dldataResp':
          return 'dldata-resp';
        case 'dldataResult':
          return 'dldata-result';
      }
      return '';
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
