<template>
  <q-toolbar>
    <q-space />

    <q-btn flat icon="refresh" round :disable="loading" @click="onRefreshClick">
      <q-tooltip>{{ $t('buttons.refresh') }}</q-tooltip>
    </q-btn>

    <q-btn flat icon="add" round :disable="loading" @click="onAddClick">
      <q-tooltip>{{ $t('buttons.add') }}</q-tooltip>
    </q-btn>
  </q-toolbar>

  <q-separator />

  <div class="row items-center">
    <div class="col-xs-2 col-sm-2 col-md-2">{{ $t('appDemo.time') }}</div>
    <div class="col-xs-2 col-sm-2 col-md-2">{{ $t('appDemo.pub') }}</div>
    <div class="col-xs-2 col-sm-1 col-md-1">
      {{ $t('appDemo.networkCode') }}
    </div>
    <div class="col-xs-2 col-sm-1 col-md-1">
      {{ $t('appDemo.networkAddr') }}
    </div>
    <div class="col-xs-2 col-sm-4 col-md-4">{{ $t('appDemo.data') }}</div>
    <div class="col-xs-1 col-sm-1 col-md-1">{{ $t('appDemo.error') }}</div>
    <div class="col-xs-1 col-sm-1 col-md-1">{{ $t('appDemo.message') }}</div>
  </div>

  <q-list class="padding-zero" no-border highlight separator>
    <q-item v-for="(item, i) in data.list" :key="i">
      <div class="col-xs-2 col-sm-2 col-md-2">{{ item.time }}</div>
      <div class="col-xs-2 col-sm-2 col-md-2">{{ item.pub }}</div>
      <div class="col-xs-2 col-sm-1 col-md-1">{{ item.networkCode }}</div>
      <div class="col-xs-2 col-sm-1 col-md-1">{{ item.networkAddr }}</div>
      <div class="col-xs-2 col-sm-4 col-md-4">{{ item.data }}</div>
      <div class="col-xs-1 col-sm-1 col-md-1">{{ item.error }}</div>
      <div class="col-xs-1 col-sm-1 col-md-1">{{ item.message }}</div>
    </q-item>
  </q-list>

  <SendData v-model="showSendData" />
</template>

<script>
import { defineComponent } from 'vue';
import SendData from './dialogs/SendData.vue';

export default defineComponent({
  name: 'DlDataPage',

  components: {
    SendData,
  },

  created() {
    this.getList();
  },

  data() {
    return {
      data: {
        list: [],
      },
      loading: false,
      showSendData: false,
    };
  },

  methods: {
    onAddClick() {
      this.showSendData = true;
    },
    onRefreshClick() {
      this.getList();
    },
    getList() {
      let opts = {
        method: 'GET',
        url: `${this.$root.config.appDemo.base}/api/v1/data/dldata`,
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
