<template>
  <q-toolbar>
    <q-space />

    <q-btn flat icon="refresh" round :disable="loading" @click="onRefreshClick">
      <q-tooltip>{{ $t('buttons.refresh') }}</q-tooltip>
    </q-btn>
  </q-toolbar>

  <q-separator />

  <div class="row items-center">
    <div class="col-xs-3 col-sm-3 col-md-3">{{ $t('loraIfroglab.time') }}</div>
    <div class="col-xs-3 col-sm-2 col-md-2">
      {{ $t('loraIfroglab.nodeId') }}
    </div>
    <div class="col-xs-5 col-sm-6 col-md-6">{{ $t('loraIfroglab.data') }}</div>
    <div class="col-xs-1 col-sm-1 col-md-1">{{ $t('loraIfroglab.rssi') }}</div>
  </div>

  <q-list class="padding-zero" no-border highlight separator>
    <q-item v-for="(item, i) in data.list" :key="i">
      <div class="col-xs-3 col-sm-3 col-md-3">{{ item.time }}</div>
      <div class="col-xs-3 col-sm-2 col-md-2">{{ item.networkAddr }}</div>
      <div class="col-xs-5 col-sm-6 col-md-6">{{ item.data }}</div>
      <div class="col-xs-1 col-sm-1 col-md-1">{{ item.extension.rssi }}</div>
    </q-item>
  </q-list>
</template>

<script>
import { defineComponent } from 'vue';
import config from '../../../config';

export default defineComponent({
  name: 'UlDataPage',

  created() {
    this.getList();
  },

  data() {
    return {
      data: {
        list: [],
      },
      loading: false,
    };
  },

  methods: {
    onRefreshClick() {
      this.getList();
    },
    getList() {
      let opts = {
        method: 'GET',
        url: `${config.loraIfroglab.base}/api/v1/data/uldata`,
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          self.data.list = resp.data.data;
          self.data.list.sort((a, b) => {
            const timeA = new Date(a.time).getTime();
            const timeB = new Date(b.time).getTime();
            if (timeA < timeB) {
              return 1;
            } else if (timeA > timeB) {
              return -1;
            }
            return 0;
          });
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getList);
        });
    },
  },
});
</script>
