<template>
  <q-toolbar>
    <q-select
      v-model="selectUnit"
      emit-value
      map-options
      option-value="unitId"
      option-label="code"
      :options="data.unitList"
      :label="$t('device.unit')"
      @update:model-value="getNetworkList"
    />

    <q-space />

    <q-input v-model="search" :label="$t('device.filter')" />

    <q-pagination
      v-model="curPage"
      :max="data.totalPages"
      input
      @update:model-value="onPageUpdate"
    />

    <q-btn flat icon="refresh" round :disable="loading" @click="onRefreshClick">
      <q-tooltip>{{ $t('buttons.refresh') }}</q-tooltip>
    </q-btn>

    <q-btn
      flat
      icon="add"
      round
      :disable="
        loading ||
        (!(
          store.getAccountInfo().roles &&
          (store.getAccountInfo().roles.admin ||
            store.getAccountInfo().roles.manager)
        ) &&
          !selectUnit)
      "
      @click="onAddClick"
    >
      <q-tooltip>{{ $t('buttons.add') }}</q-tooltip>
    </q-btn>
  </q-toolbar>

  <q-separator />

  <div class="row items-center">
    <div class="col-xs-2 col-sm-2 col-md-2">{{ $t('device.networkCode') }}</div>
    <div class="col-xs-2 col-sm-2 col-md-2">{{ $t('device.networkAddr') }}</div>
    <div class="col-xs-4 col-sm-3 col-md-3">{{ $t('device.name') }}</div>
    <div class="col-xs-4 col-sm-5 col-md-5"></div>
  </div>

  <q-list class="padding-zero" no-border highlight separator>
    <q-item v-for="(item, i) in data.list" :key="i">
      <div class="col-xs-2 col-sm-2 col-md-2 wrap">{{ item.networkCode }}</div>
      <div class="col-xs-2 col-sm-2 col-md-2 wrap">{{ item.networkAddr }}</div>
      <div class="col-xs-4 col-sm-3 col-md-3 wrap">{{ item.name }}</div>
      <div class="col-xs-4 col-sm-5 col-md-5 row justify-end">
        <q-btn
          flat
          icon="edit"
          round
          :disable="loading"
          @click="onEditClick(item)"
        >
          <q-tooltip>{{ $t('buttons.edit') }}</q-tooltip>
        </q-btn>
        <q-btn
          flat
          icon="delete"
          round
          :disable="loading"
          @click="onDeleteClick(item)"
        >
          <q-tooltip>{{ $t('buttons.delete') }}</q-tooltip>
        </q-btn>
        <q-btn
          flat
          icon="more_vert"
          round
          :disable="loading"
          @click="onDetailClick(item)"
        >
          <q-tooltip>{{ $t('buttons.detail') }}</q-tooltip>
        </q-btn>
      </div>
    </q-item>
  </q-list>

  <q-dialog v-model="showAdd">
    <q-card>
      <q-card-section>{{ $t('device.titleAdd') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-select
          v-model="input.networkId"
          emit-value
          map-options
          option-value="networkId"
          option-label="code"
          :options="data.networkList"
          :label="$t('device.network')"
        />
        <q-card-section>
          <q-input
            v-model="input.networkAddr"
            :label="$t('device.networkAddr')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('device.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            :label="$t('device.info')"
          />
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat color="primary" v-close-popup @click="onAddOk">
          {{ $t('buttons.ok') }}
        </q-btn>
        <q-btn flat v-close-popup>{{ $t('buttons.cancel') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showEdit">
    <q-card>
      <q-card-section>{{ $t('device.titleEdit') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-select
          v-model="input.networkId"
          emit-value
          map-options
          disable
          option-value="networkId"
          option-label="code"
          :options="data.networkList"
          :label="$t('device.network')"
        />
        <q-card-section>
          <q-input
            v-model="input.networkAddr"
            disable
            :label="$t('device.networkAddr')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('device.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            :label="$t('device.info')"
          />
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat color="primary" v-close-popup @click="onEditOk">
          {{ $t('buttons.ok') }}
        </q-btn>
        <q-btn flat v-close-popup>{{ $t('buttons.cancel') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showDelete">
    <q-card>
      <q-card-section>{{ $t('device.titleDelete') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-card-section>
          {{ $t('device.deleteText') }}
        </q-card-section>
        <q-card-section>
          <b>{{ input.networkCode }} - {{ input.networkAddr }}</b>
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat color="primary" v-close-popup @click="onDeleteOk">
          {{ $t('buttons.ok') }}
        </q-btn>
        <q-btn flat v-close-popup>{{ $t('buttons.cancel') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showDetail">
    <q-card>
      <q-card-section>{{ $t('device.titleDetail') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-select
          v-model="input.networkId"
          emit-value
          map-options
          disable
          option-value="networkId"
          option-label="code"
          :options="data.networkList"
          :label="$t('device.network')"
        />
        <q-card-section>
          <q-input
            v-model="input.networkAddr"
            disable
            :label="$t('device.networkAddr')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" disable :label="$t('device.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            disable
            :label="$t('device.info')"
          />
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat color="primary" v-close-popup>
          {{ $t('buttons.ok') }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue';
import qs from 'qs';
import { useStore } from 'stores/system';
import config from '../../config.json';

export default defineComponent({
  name: 'DevicePage',

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
        networkList: [],
      },
      input: {
        deviceId: '',
        unitId: '',
        unitCode: '',
        networkId: '',
        networkCode: '',
        networkAddr: '',
        name: '',
        info: '',
      },
      selectUnit: '',
      search: '',
      curPage: 1,
      pageSize: 20,
      loading: false,
      showAdd: false,
      showEdit: false,
      showDelete: false,
      showDetail: false,
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
          unitId: this.selectUnit,
          networkId: this.input.networkId,
          networkAddr: this.input.networkAddr,
        },
      };
      if (this.input.name) {
        body.data.name = this.input.name;
      }
      if (
        this.input.info &&
        this.input.info.startsWith('{') &&
        this.input.info.endsWith('}')
      ) {
        try {
          let info = JSON.parse(this.input.info);
          body.data.info = info;
        } catch (_e) {}
      }
      let opts = {
        method: 'POST',
        url: `${config.coremgr.base}/api/v1/device`,
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
    onEditClick(data) {
      this.input = this.prepareInput(data);
      this.showEdit = true;
    },
    onEditOk() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let body = {
        data: {
          name: this.input.name,
        },
      };
      if (
        this.input.info &&
        this.input.info.startsWith('{') &&
        this.input.info.endsWith('}')
      ) {
        try {
          let info = JSON.parse(this.input.info);
          body.data.info = info;
        } catch (_e) {}
      } else if (!this.input.info) {
        body.data.info = '{}';
      }
      let opts = {
        method: 'PATCH',
        url: `${config.coremgr.base}/api/v1/device/${this.input.deviceId}`,
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
          self.$root.errorHandler(err, self.onEditOk);
        });
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
        url: `${config.coremgr.base}/api/v1/device/${this.input.deviceId}`,
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
    onDetailClick(data) {
      this.input = this.prepareInput(data);
      this.showDetail = true;
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
      if (this.search) {
        query.contains = this.search;
      }
      if (this.selectUnit) {
        query.unit = this.selectUnit;
      }
      let opts = {
        method: 'GET',
        url: `${config.coremgr.base}/api/v1/device/count?${qs.stringify(
          query
        )}`,
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
      if (this.search) {
        query.contains = this.search;
      }
      if (this.selectUnit) {
        query.unit = this.selectUnit;
      }
      let opts = {
        method: 'GET',
        url: `${config.coremgr.base}/api/v1/device/list?${qs.stringify(query)}`,
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
        url: `${config.coremgr.base}/api/v1/unit/list?limit=0`,
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
              code: self.$t('device.selectAllUnits'),
            });
          }
          self.data.unitList = unitList;
          if (unitList.length <= 0) {
            self.data.list = [];
            return;
          }
          for (let unit of unitList) {
            if (unit.unitId === self.selectUnit) {
              return void self.getNetworkList();
            }
          }
          if (self.selectUnit === '' && isAdminManager) {
            return void self.getNetworkList();
          }
          self.selectUnit = self.data.unitList[0].unitId;
          self.getNetworkList();
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getUnitList);
        });
    },
    getNetworkList() {
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
        url: `${config.coremgr.base}/api/v1/network/list?${qs.stringify(
          query
        )}`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          let networkList = resp.data.data;
          self.data.networkList = networkList;
          if (networkList.length <= 0) {
            self.data.list = [];
            return;
          }
          self.getCount();
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getNetworkList);
        });
    },
    prepareInput(data) {
      return {
        deviceId: data ? data.deviceId : '',
        unitId: data ? data.unitId : '',
        unitCode: data ? data.unitCode : '',
        networkId: data ? data.networkId : '',
        networkCode: data ? data.networkCode : '',
        networkAddr: data ? data.networkAddr : '',
        name: data && data.name ? data.name : '',
        info: data && data.info ? JSON.stringify(data.info, null, '  ') : '',
      };
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
