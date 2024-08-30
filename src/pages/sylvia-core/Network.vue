<template>
  <q-toolbar>
    <q-select
      v-model="selectUnit"
      emit-value
      map-options
      option-label="code"
      option-value="unitId"
      :label="$t('network.unit')"
      :options="data.unitList"
      @update:model-value="getCount"
    />

    <q-space />

    <q-input v-model="search" :label="$t('network.filter')" />

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

  <q-list class="padding-zero" highlight no-border separator>
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

  <q-dialog v-model="showAdd" @hide="onHide">
    <q-card style="width: 50%">
      <q-card-section>{{ $t('network.titleAdd') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-input
            v-model="input.code"
            :error="inputError.code !== ''"
            :error-message="inputError.code"
            :label="$t('network.code')"
            @update:model-value="validateCode"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.hostUri"
            :error="inputError.hostUri !== ''"
            :error-message="inputError.hostUri"
            :label="$t('network.host')"
            @update:model-value="validateHostUri"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('network.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            :error="inputError.info !== ''"
            :error-message="inputError.info"
            :label="$t('network.info')"
            @update:model-value="validateInfo"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.ttl"
            type="number"
            :error="inputError.ttl !== ''"
            :error-message="inputError.ttl"
            :label="$t('network.ttl')"
            @update:model-value="validateTtl"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.length"
            type="number"
            :error="inputError.length !== ''"
            :error-message="inputError.length"
            :label="$t('network.length')"
            @update:model-value="validateLength"
          />
        </q-card-section>
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

  <q-dialog v-model="showEdit" @hide="onHide">
    <q-card style="width: 50%">
      <q-card-section>{{ $t('network.titleEdit') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-input
            v-model="input.unitCode"
            v-if="
              store.getAccountInfo().roles &&
              (store.getAccountInfo().roles.admin ||
                store.getAccountInfo().roles.manager)
            "
            readonly
            :label="$t('network.unit')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.code" readonly :label="$t('network.code')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.hostUri"
            :error="inputError.hostUri !== ''"
            :error-message="inputError.hostUri"
            :label="$t('network.host')"
            @update:model-value="validateHostUri"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('network.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            :error="inputError.info !== ''"
            :error-message="inputError.info"
            :label="$t('network.info')"
            @update:model-value="validateInfo"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.ttl"
            type="number"
            :error="inputError.ttl !== ''"
            :error-message="inputError.ttl"
            :label="$t('network.ttl')"
            @update:model-value="validateTtl"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.length"
            type="number"
            :error="inputError.length !== ''"
            :error-message="inputError.length"
            :label="$t('network.length')"
            @update:model-value="validateLength"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.password"
            type="password"
            :label="$t('network.password')"
          />
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn
          color="primary"
          flat
          v-close-popup
          :disable="!validateInput()"
          @click="onEditOk"
        >
          {{ $t('buttons.ok') }}
        </q-btn>
        <q-btn flat v-close-popup>{{ $t('buttons.cancel') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showDelete">
    <q-card style="width: 50%">
      <q-card-section>{{ $t('network.titleDelete') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          {{ $t('network.deleteText') }}
        </q-card-section>
        <q-card-section>
          <b>{{ input.code }}</b>
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

  <q-dialog v-model="showDetail">
    <q-card style="width: 50%">
      <q-card-section>{{ $t('network.titleDetail') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-input
            v-model="input.unitCode"
            v-if="
              store.getAccountInfo().roles &&
              (store.getAccountInfo().roles.admin ||
                store.getAccountInfo().roles.manager)
            "
            readonly
            :label="$t('network.unit')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.networkId"
            readonly
            :label="$t('network.networkId')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.code" readonly :label="$t('network.code')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.hostUri"
            readonly
            :label="$t('network.host')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" readonly :label="$t('network.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            readonly
            type="textarea"
            :label="$t('network.info')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.ttl"
            readonly
            type="number"
            :label="$t('network.ttl')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.length"
            readonly
            type="number"
            :label="$t('network.length')"
          />
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn color="primary" flat v-close-popup>
          {{ $t('buttons.ok') }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <NetworkSendData
    v-model="showSendData"
    :network-id="input.networkId"
    :unit-id="input.unitId"
  />

  <NetworkStats v-model="showStats" :network-id="input.networkId" />
</template>

<script>
import { defineComponent } from 'vue';
import qs from 'qs';
import { useStore } from 'stores/system';
import NetworkSendData from './dialogs/NetworkSendData.vue';
import NetworkStats from './dialogs/NetworkStats.vue';

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
      inputError: {
        code: '',
        hostUri: '',
        info: '',
        ttl: '',
        length: '',
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
      if (this.$root.isJsonObject(this.input.info)) {
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
    onCsvClick() {
      const url = `${this.$root.config.coremgr.base}/api/v1/network/list?limit=0&format=csv`;
      const filename = `network-${this.$root.fileTimeStr(new Date())}.csv`;
      this.$root.downloadStream(url, filename, this.onCsvClick);
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
      if (this.$root.isJsonObject(this.input.info)) {
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
    onHide() {
      this.inputError = {
        code: '',
        hostUri: '',
        info: '',
        ttl: '',
        length: '',
      };
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
      const input = {
        networkId: data ? data.networkId : '',
        code: data ? data.code : '',
        unitId: data ? data.unitId : '',
        unitCode: data ? data.unitCode : '',
        hostUri: data && data.hostUri ? data.hostUri : '',
        name: data && data.name ? data.name : '',
        info: data && data.info ? JSON.stringify(data.info, null, '  ') : '{}',
        ttl: (data && data.ttl) || 0,
        length: (data && data.length) || 0,
        password: '',
      };
      this.validateCode(input.code);
      this.validateHostUri(input.hostUri);
      this.validateInfo(input.info);
      this.validateTtl(input.ttl);
      this.validateLength(input.length);
      return input;
    },
    validateInput() {
      return !(
        this.inputError.code ||
        this.inputError.hostUri ||
        this.inputError.info ||
        this.inputError.ttl ||
        this.inputError.length
      );
    },
    validateCode(value) {
      const valid = this.$root.isCode(value);
      this.inputError.code = valid ? '' : this.$t('inputError.code');
      return valid;
    },
    validateHostUri(value) {
      let valid =
        this.$root.isURL(value) &&
        (value.startsWith('amqp:') ||
          value.startsWith('amqps:') ||
          value.startsWith('mqtt:') ||
          value.startsWith('mqtts:'));
      this.inputError.hostUri = valid ? '' : this.$t('inputError.queueUri');
      return valid;
    },
    validateInfo(value) {
      const valid = this.$root.isJsonObject(value);
      this.inputError.info = valid ? '' : this.$t('inputError.info');
      return valid;
    },
    validateTtl(value) {
      const valid = this.$root.isZeroPositiveInt(value);
      this.inputError.ttl = valid ? '' : this.$t('inputError.zeroPositiveInt');
      return valid;
    },
    validateLength(value) {
      const valid = this.$root.isZeroPositiveInt(value);
      this.inputError.length = valid
        ? ''
        : this.$t('inputError.zeroPositiveInt');
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
