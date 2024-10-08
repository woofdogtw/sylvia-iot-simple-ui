<template>
  <q-toolbar>
    <q-select
      v-model="selectUnit"
      emit-value
      map-options
      option-value="unitId"
      option-label="code"
      :options="data.unitList"
      :label="$t('data.unit')"
      @update:model-value="getCount"
    />

    <q-space />

    <q-pagination
      v-model="curPage"
      :max="data.totalPages"
      input
      @update:model-value="onPageUpdate"
    />

    <q-btn flat icon="refresh" round :disable="loading" @click="onRefreshClick">
      <q-tooltip>{{ $t('buttons.refresh') }}</q-tooltip>
    </q-btn>

    <q-btn flat icon="download" round @click="onCsvClick">
      <q-tooltip>{{ $t('buttons.csv') }}</q-tooltip>
    </q-btn>
  </q-toolbar>

  <q-separator />

  <div class="row items-center">
    <div class="col-xs-2 col-sm-2 col-md-2">{{ $t('data.reqTime') }}</div>
    <div class="col-xs-1 col-sm-1 col-md-1">{{ $t('data.latency') }}</div>
    <div class="col-xs-1 col-sm-1 col-md-1">{{ $t('data.status') }}</div>
    <div class="col-xs-1 col-sm-1 col-md-1">{{ $t('data.method') }}</div>
    <div class="col-xs-7 col-sm-7 col-md-7">{{ $t('data.path') }}</div>
  </div>

  <q-list class="padding-zero" no-border highlight separator>
    <q-item v-for="(item, i) in data.list" :key="i">
      <div class="col-xs-2 col-sm-2 col-md-2">
        {{ $root.timeStr(item.reqTime) }}
      </div>
      <div class="col-xs-1 col-sm-1 col-md-1">
        {{ item.latencyMs }}
      </div>
      <div class="col-xs-1 col-sm-1 col-md-1">
        {{ item.status }}
      </div>
      <div class="col-xs-1 col-sm-1 col-md-1">
        {{ item.method }}
      </div>
      <div class="col-xs-7 col-sm-7 col-md-7">{{ item.path }}</div>
    </q-item>
  </q-list>
</template>

<script>
import { defineComponent } from 'vue';
import qs from 'qs';
import { useStore } from 'stores/system';

export default defineComponent({
  name: 'OperationPage',

  created() {
    this.userInfo = this.store.getAccountInfo();
    this.getUnitList();
  },

  data() {
    return {
      userInfo: {},
      data: {
        list: [],
        count: 0,
        totalPages: 0,
        unitList: [],
      },
      selectUnit: '',
      curPage: 1,
      pageSize: 20,
      loading: false,
    };
  },

  methods: {
    onCsvClick() {
      const url = `${this.$root.config.data.base}/api/v1/coremgr-opdata/list?limit=0&format=csv`;
      const filename = `coremgr-opdata-${this.$root.fileTimeStr(
        new Date()
      )}.csv`;
      this.$root.downloadStream(url, filename, this.onCsvClick);
    },
    onRefreshClick() {
      this.getCount();
    },
    onPageUpdate(page) {
      if (page < 1) {
        page = 1;
      }
      if (page > this.data.totalPages) {
        page = this.data.totalPages;
      }
      this.curPage = page;
      this.getCount();
    },
    getCount() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let query = {};
      if (this.selectUnit) {
        query.unit = this.selectUnit;
      }
      let opts = {
        method: 'GET',
        url: `${
          this.$root.config.data.base
        }/api/v1/coremgr-opdata/count?${qs.stringify(query)}`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          self.data.count = resp.data.data.count;
          self.data.totalPages = Math.floor(
            (self.data.count - 1 + self.pageSize) / self.pageSize
          );
          if (self.curPage > self.data.totalPages) {
            self.curPage = self.data.totalPages;
          }
          if (self.data.count === 0) {
            return;
          }
          self.getList();
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getCount);
        });
    },
    getList() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let query = {
        offset: (this.curPage - 1) * this.pageSize,
        limit: this.pageSize,
      };
      if (query.offset < 0) {
        query.offset = 0;
      }
      if (this.selectUnit) {
        query.unit = this.selectUnit;
      }
      let opts = {
        method: 'GET',
        url: `${
          this.$root.config.data.base
        }/api/v1/coremgr-opdata/list?${qs.stringify(query)}`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          self.data.list = resp.data.data;
          self.userInfo = self.store.getAccountInfo();
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getList);
        });
    },
    getUnitList() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.coremgr.base}/api/v1/unit/list?limit=0`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          const isAdminManager =
            self.store.getAccountInfo().roles &&
            (self.store.getAccountInfo().roles.admin ||
              self.store.getAccountInfo().roles.manager);
          let unitList = resp.data.data;
          if (isAdminManager) {
            unitList.unshift({
              unitId: '',
              code: self.$t('data.selectAllUnits'),
            });
          }
          self.data.unitList = unitList;
          if (unitList.length <= 0) {
            self.data.list = [];
            return;
          }
          for (let unit of unitList) {
            if (unit.unitId === self.selectUnit) {
              return void self.getCount();
            }
          }
          if (self.selectUnit === '' && isAdminManager) {
            return void self.getCount();
          }
          self.selectUnit = self.data.unitList[0].unitId;
          self.getCount();
        })
        .catch((err) => {
          self.loading = false;
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
