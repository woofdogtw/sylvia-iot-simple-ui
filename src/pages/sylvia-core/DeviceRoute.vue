<template>
  <q-toolbar>
    <q-select
      v-model="selectUnit"
      emit-value
      map-options
      option-label="code"
      option-value="unitId"
      :label="$t('deviceRoute.unit')"
      :options="data.unitList"
      @update:model-value="getApplicationList"
    />

    <q-space />

    <q-pagination
      v-model="curPage"
      input
      :max="data.totalPages"
      @update:model-value="onPageUpdate"
    />

    <q-btn flat icon="refresh" round :disable="loading" @click="onRefreshClick">
      <q-tooltip>{{ $t('buttons.refresh') }}</q-tooltip>
    </q-btn>

    <q-btn flat icon="download" round @click="onCsvClick">
      <q-tooltip>{{ $t('buttons.csv') }}</q-tooltip>
    </q-btn>

    <q-btn
      flat
      icon="add"
      round
      :disable="loading || !selectUnit"
      @click="onAddClick"
    >
      <q-tooltip>{{ $t('buttons.add') }}</q-tooltip>
    </q-btn>
  </q-toolbar>

  <q-separator />

  <div class="row items-center">
    <div class="col-xs-2 col-sm-2 col-md-2">
      {{ $t('deviceRoute.network') }}
    </div>
    <div class="col-xs-4 col-sm-3 col-md-3">
      {{ $t('deviceRoute.address') }}
    </div>
    <div class="col-xs-2 col-sm-2 col-md-2">
      {{ $t('deviceRoute.application') }}
    </div>
    <div class="col-xs-4 col-sm-5 col-md-5"></div>
  </div>

  <q-list class="padding-zero" highlight no-border separator>
    <q-item v-for="(item, i) in data.list" :key="i">
      <div class="col-xs-2 col-sm-2 col-md-2 wrap">{{ item.networkCode }}</div>
      <div class="col-xs-4 col-sm-3 col-md-3 wrap">{{ item.networkAddr }}</div>
      <div class="col-xs-2 col-sm-2 col-md-2 wrap">
        {{ item.applicationCode }}
      </div>
      <div class="col-xs-4 col-sm-5 col-md-5 row justify-end">
        <q-btn
          flat
          icon="delete"
          round
          :disable="loading"
          @click="onDeleteClick(item)"
        >
          <q-tooltip>{{ $t('buttons.delete') }}</q-tooltip>
        </q-btn>
      </div>
    </q-item>
  </q-list>

  <q-dialog v-model="showAdd" @hide="onHide">
    <q-card style="width: 50%">
      <q-card-section>{{ $t('deviceRoute.titleAdd') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-select
          v-model="input.deviceId"
          emit-value
          map-options
          option-value="deviceId"
          :error="inputError.deviceId !== ''"
          :error-message="inputError.deviceId"
          :label="$t('deviceRoute.device')"
          :option-label="
            (item) =>
              item.networkCode && item.networkAddr
                ? item.networkCode + '-' + item.networkAddr
                : ''
          "
          :options="data.deviceList"
          @update:model-value="validateDeviceId"
        />
        <q-select
          v-model="input.applicationId"
          emit-value
          map-options
          option-label="code"
          option-value="applicationId"
          :error="inputError.applicationId !== ''"
          :error-message="inputError.applicationId"
          :label="$t('deviceRoute.application')"
          :options="data.applicationList"
          @update:model-value="validateApplicationId"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn
          color="primary"
          flat
          v-close-popup
          :disable="!validateInput()"
          @click="onAddOk"
        >
          {{ $t('buttons.ok') }}
        </q-btn>
        <q-btn flat v-close-popup>{{ $t('buttons.cancel') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showDelete">
    <q-card style="width: 50%">
      <q-card-section>{{ $t('deviceRoute.titleDelete') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          {{ $t('deviceRoute.deleteText') }}
        </q-card-section>
        <q-card-section>
          <b>{{ input.networkCode }} - {{ input.networkAddr }}</b>
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn color="primary" flat v-close-popup @click="onDeleteOk">
          {{ $t('buttons.ok') }}
        </q-btn>
        <q-btn flat v-close-popup>{{ $t('buttons.cancel') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue';
import qs from 'qs';
import { useStore } from 'stores/system';

export default defineComponent({
  name: 'DeviceRoutePage',

  created() {
    this.getUnitList();
  },

  data() {
    return {
      data: {
        list: [],
        count: 0,
        totalPages: 0,
        unitList: [],
        applicationList: [],
        deviceList: [],
      },
      input: {
        routeId: '',
        unitId: '',
        applicationId: '',
        applicationCode: '',
        deviceId: '',
        networkId: '',
        networkCode: '',
        networkAddr: '',
      },
      inputError: {
        applicationId: '',
        deviceId: '',
      },
      selectUnit: '',
      curPage: 1,
      pageSize: 20,
      loading: false,
      showAdd: false,
      showDelete: false,
    };
  },

  methods: {
    onAddClick() {
      this.input = this.prepareInput();
      this.showAdd = true;
    },
    onAddOk() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let body = {
        data: {
          deviceId: this.input.deviceId,
          applicationId: this.input.applicationId,
        },
      };
      let opts = {
        method: 'POST',
        url: `${this.$root.config.coremgr.base}/api/v1/device-route`,
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
          self.getCount();
          self.loading = false;
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.onAddOk);
        });
    },
    onCsvClick() {
      const url = `${this.$root.config.coremgr.base}/api/v1/device-route/list?limit=0&format=csv`;
      const filename = `device-route-${this.$root.fileTimeStr(new Date())}.csv`;
      this.$root.downloadStream(url, filename, this.onCsvClick);
    },
    onDeleteClick(data) {
      this.input = this.prepareInput(data);
      this.showDelete = true;
    },
    onDeleteOk() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'DELETE',
        url: `${this.$root.config.coremgr.base}/api/v1/device-route/${this.input.routeId}`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((_resp) => {
          self.$q.notify(self.$t('messages.success'));
          self.getCount();
          self.loading = false;
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.onDeleteOk);
        });
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
    onHide() {
      this.inputError = {
        applicationId: '',
        deviceId: '',
      };
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
          this.$root.config.coremgr.base
        }/api/v1/device-route/count?${qs.stringify(query)}`,
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
            self.data.list = [];
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
          this.$root.config.coremgr.base
        }/api/v1/device-route/list?${qs.stringify(query)}`,
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
              code: self.$t('deviceRoute.selectAllUnits'),
            });
          }
          self.data.unitList = unitList;
          if (unitList.length <= 0) {
            self.data.list = [];
            return;
          }
          for (let unit of unitList) {
            if (unit.unitId === self.selectUnit) {
              return void self.getApplicationList();
            }
          }
          if (self.selectUnit === '' && isAdminManager) {
            return void self.getApplicationList();
          }
          self.selectUnit = self.data.unitList[0].unitId;
          self.getApplicationList();
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getUnitList);
        });
    },
    getApplicationList() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let query = {
        limit: 0,
      };
      if (this.selectUnit) {
        query.unit = this.selectUnit;
      }
      let opts = {
        method: 'GET',
        url: `${
          this.$root.config.coremgr.base
        }/api/v1/application/list?${qs.stringify(query)}`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          let applicationList = resp.data.data;
          self.data.applicationList = applicationList;
          if (applicationList.length <= 0) {
            self.data.list = [];
            return;
          }
          self.getDeviceList();
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getApplicationList);
        });
    },
    getDeviceList() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let query = {
        limit: 0,
      };
      if (this.selectUnit) {
        query.unit = this.selectUnit;
      }
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
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          let deviceList = resp.data.data;
          self.data.deviceList = deviceList;
          if (deviceList.length <= 0) {
            self.data.list = [];
            return;
          }
          self.getCount();
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getDeviceList);
        });
    },
    prepareInput(data) {
      const input = {
        routeId: data ? data.routeId : '',
        unitId: data ? data.unitId : '',
        applicationId: data ? data.applicationId : '',
        applicationCode: data ? data.applicationCode : '',
        deviceId: data ? data.deviceId : '',
        networkId: data ? data.networkId : '',
        networkCode: data ? data.networkCode : '',
        networkAddr: data ? data.networkAddr : '',
      };
      this.validateApplicationId(input.applicationId);
      this.validateDeviceId(input.deviceId);
      return input;
    },
    validateInput() {
      return !(this.inputError.applicationId || this.inputError.deviceId);
    },
    validateApplicationId(value) {
      const valid = !!value;
      this.inputError.applicationId = valid
        ? ''
        : this.$t('inputError.routeApplicationId');
      return valid;
    },
    validateDeviceId(value) {
      const valid = !!value;
      this.inputError.deviceId = valid
        ? ''
        : this.$t('inputError.routeDeviceId');
      return valid;
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
