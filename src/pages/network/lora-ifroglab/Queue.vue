<template>
  <q-toolbar>
    <q-space />

    <q-input v-model="search" :label="$t('loraIfroglab.nodeId')" />

    <q-btn
      flat
      icon="refresh"
      round
      :disable="loading || !search"
      @click="onRefreshClick"
    >
      <q-tooltip>{{ $t('buttons.refresh') }}</q-tooltip>
    </q-btn>
  </q-toolbar>

  <q-separator />

  <div class="row items-center">
    <div class="col-xs-3 col-sm-3 col-md-3">{{ $t('loraIfroglab.time') }}</div>
    <div class="col-xs-3 col-sm-3 col-md-3">{{ $t('loraIfroglab.pub') }}</div>
    <div class="col-xs-2 col-sm-1 col-md-1">
      {{ $t('loraIfroglab.nodeId') }}
    </div>
    <div class="col-xs-4 col-sm-5 col-md-5">{{ $t('loraIfroglab.data') }}</div>
  </div>

  <q-list class="padding-zero" no-border highlight separator>
    <q-item v-for="(item, i) in data.list" :key="i">
      <div class="col-xs-3 col-sm-3 col-md-3">{{ item.time }}</div>
      <div class="col-xs-3 col-sm-3 col-md-3">{{ item.pub }}</div>
      <div class="col-xs-2 col-sm-1 col-md-1">{{ item.networkAddr }}</div>
      <div class="col-xs-4 col-sm-5 col-md-5">{{ item.data }}</div>
    </q-item>
  </q-list>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'QueuePage',

  data() {
    return {
      data: {
        list: [],
      },
      search: '',
      loading: false,
    };
  },

  methods: {
    onRefreshClick() {
      this.getList();
    },
    getList() {
      if (!this.search) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.loraIfroglab.base}/api/v1/data/queue/${this.search}`,
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          self.data.list = resp.data.data;
          self.data.list.sort((a, b) => {
            const timeA = new Date(a.pub).getTime();
            const timeB = new Date(b.pub).getTime();
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
