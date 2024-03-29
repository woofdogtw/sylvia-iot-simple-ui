<template>
  <q-toolbar>
    <q-select
      v-model="selectUnit"
      emit-value
      map-options
      option-value="unitId"
      option-label="code"
      :options="data.unitList"
      :label="$t('network.unit')"
      @update:model-value="getCount"
    />

    <q-space />

    <q-input v-model="search" :label="$t('network.filter')" />

    <q-pagination
      v-model="curPage"
      :max="data.totalPages"
      input
      @update:model-value="onPageUpdate"
    />

    <q-btn flat icon="refresh" round :disable="loading" @click="onRefreshClick">
      <q-tooltip>{{ $t('buttons.refresh') }}</q-tooltip>
    </q-btn>

    <q-btn flat icon="add" round :disable="loading" @click="onAddClick">
      <q-tooltip>{{ $t('buttons.add') }}</q-tooltip>
    </q-btn>
  </q-toolbar>

  <q-separator />

  <div class="row items-center">
    <div class="col-xs-2 col-sm-2 col-md-2">{{ $t('network.code') }}</div>
    <div class="col-xs-4 col-sm-3 col-md-3">{{ $t('network.name') }}</div>
    <div class="col-xs-2 col-sm-2 col-md-2">
      {{ $t('network.protocol') }}
    </div>
    <div class="col-xs-4 col-sm-5 col-md-5"></div>
  </div>

  <q-list class="padding-zero" no-border highlight separator>
    <q-item v-for="(item, i) in data.list" :key="i">
      <div class="col-xs-2 col-sm-2 col-md-2 wrap">{{ item.code }}</div>
      <div class="col-xs-4 col-sm-3 col-md-3 wrap">{{ item.name }}</div>
      <div class="col-xs-2 col-sm-2 col-md-2 wrap">
        {{ hostToProtocol(item.hostUri) }}
      </div>
      <div class="col-xs-4 col-sm-5 col-md-5 row justify-end">
        <q-btn
          flat
          icon="call_received"
          round
          :disable="loading || !selectUnit"
          @click="onSendDataClick(item)"
        >
          <q-tooltip>{{ $t('buttons.sendData') }}</q-tooltip>
        </q-btn>
        <q-btn
          flat
          icon="query_stats"
          round
          :disable="loading"
          @click="onStatsClick(item)"
        >
          <q-tooltip>{{ $t('buttons.stats') }}</q-tooltip>
        </q-btn>
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
      <q-card-section>{{ $t('network.titleAdd') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-card-section>
          <q-input v-model="input.code" :label="$t('network.code')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.hostUri" :label="$t('network.host')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('network.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            :label="$t('network.info')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.ttl"
            type="number"
            :label="$t('network.ttl')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.length"
            type="number"
            :label="$t('network.length')"
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
      <q-card-section>{{ $t('network.titleEdit') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-card-section>
          <q-input
            v-model="input.unitCode"
            v-if="
              store.getAccountInfo().roles &&
              (store.getAccountInfo().roles.admin ||
                store.getAccountInfo().roles.manager)
            "
            disable
            :label="$t('network.unit')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.code" disable :label="$t('network.code')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.hostUri" :label="$t('network.host')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('network.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            :label="$t('network.info')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.ttl"
            type="number"
            :label="$t('network.ttl')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.length"
            type="number"
            :label="$t('network.length')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.password" :label="$t('network.password')" />
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
      <q-card-section>{{ $t('network.titleDelete') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-card-section>
          {{ $t('network.deleteText') }}
        </q-card-section>
        <q-card-section>
          <b>{{ input.code }}</b>
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
      <q-card-section>{{ $t('network.titleDetail') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-card-section>
          <q-input
            v-model="input.unitCode"
            v-if="
              store.getAccountInfo().roles &&
              (store.getAccountInfo().roles.admin ||
                store.getAccountInfo().roles.manager)
            "
            disable
            :label="$t('network.unit')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.networkId"
            disable
            :label="$t('network.networkId')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.code" disable :label="$t('network.code')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.hostUri"
            disable
            :label="$t('network.host')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" disable :label="$t('network.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            disable
            :label="$t('network.info')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.ttl"
            type="number"
            disable
            :label="$t('network.ttl')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.length"
            type="number"
            disable
            :label="$t('network.length')"
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

  <NetworkSendData
    v-model="showSendData"
    :unitId="input.unitId"
    :networkId="input.networkId"
  />

  <NetworkStats v-model="showStats" :networkId="input.networkId" />
</template>

<script>
import { defineComponent } from 'vue';
import qs from 'qs';
import { useStore } from 'stores/system';
import NetworkSendData from './dialogs/NetworkSendData';
import NetworkStats from './dialogs/NetworkStats';

export default defineComponent({
  name: 'NetworkPage',

  components: {
    NetworkSendData,
    NetworkStats,
  },

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
      },
      input: {
        networkId: '',
        code: '',
        unitId: '',
        unitCode: '',
        hostUri: '',
        name: '',
        info: '',
        ttl: 0,
        length: 0,
        password: '',
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
      showStats: false,
      showSendData: false,
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
          code: this.input.code,
          unitId: this.selectUnit || null,
          hostUri: this.input.hostUri,
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
      if (parseInt(this.input.ttl) !== NaN) {
        body.data.ttl = parseInt(this.input.ttl);
      }
      if (parseInt(this.input.length) !== NaN) {
        body.data.length = parseInt(this.input.length);
      }
      let opts = {
        method: 'POST',
        url: `${this.$root.config.coremgr.base}/api/v1/network`,
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
      const self = this;
      this.getNetwork(data.networkId, (ret) => {
        self.input = ret;
        self.showEdit = true;
      });
    },
    onEditOk() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let body = {
        data: {
          hostUri: this.input.hostUri,
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
      if (parseInt(this.input.ttl) !== NaN) {
        body.data.ttl = parseInt(this.input.ttl);
      }
      if (parseInt(this.input.length) !== NaN) {
        body.data.length = parseInt(this.input.length);
      }
      if (this.input.password) {
        body.data.password = this.input.password;
      }
      let opts = {
        method: 'PATCH',
        url: `${this.$root.config.coremgr.base}/api/v1/network/${this.input.networkId}`,
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
        url: `${this.$root.config.coremgr.base}/api/v1/network/${this.input.networkId}`,
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
      const self = this;
      this.getNetwork(data.networkId, (ret) => {
        self.input = ret;
        self.showDetail = true;
      });
    },
    onStatsClick(data) {
      this.input = this.prepareInput(data);
      this.showStats = true;
    },
    onSendDataClick(data) {
      this.input = this.prepareInput(data);
      this.showSendData = true;
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
        url: `${
          this.$root.config.coremgr.base
        }/api/v1/network/count?${qs.stringify(query)}`,
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
        url: `${
          this.$root.config.coremgr.base
        }/api/v1/network/list?${qs.stringify(query)}`,
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
              code: self.$t('network.selectAllUnits'),
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
    getNetwork(id, cb) {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.coremgr.base}/api/v1/network/${id}`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.$axios(opts)
        .then((resp) => {
          cb(self.prepareInput(resp.data.data));
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, () => {
            self.getNetwork(id, cb);
          });
        });
    },
    hostToProtocol(hostUri) {
      if (hostUri.startsWith('amqp')) {
        return 'AMQP';
      } else if (hostUri.startsWith('mqtt')) {
        return 'MQTT';
      }
      return '';
    },
    prepareInput(data) {
      return {
        networkId: data ? data.networkId : '',
        code: data ? data.code : '',
        unitId: data ? data.unitId : '',
        unitCode: data ? data.unitCode : '',
        hostUri: data && data.hostUri ? data.hostUri : '',
        name: data && data.name ? data.name : '',
        info: data && data.info ? JSON.stringify(data.info, null, '  ') : '',
        ttl: (data && data.ttl) || 0,
        length: (data && data.length) || 0,
        password: '',
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
