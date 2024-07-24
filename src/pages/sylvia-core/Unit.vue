<template>
  <q-toolbar>
    <q-space />

    <q-input v-model="search" :label="$t('unit.filter')" />

    <q-pagination
      v-model="curPage"
      input
      :max="data.totalPages"
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

  <div
    class="row items-center"
    v-if="
      store.getAccountInfo().roles &&
      (store.getAccountInfo().roles.admin ||
        store.getAccountInfo().roles.manager)
    "
  >
    <div class="col-xs-2 col-sm-2 col-md-2">{{ $t('unit.code') }}</div>
    <div class="col-xs-4 col-sm-3 col-md-3">{{ $t('unit.name') }}</div>
    <div class="col-xs-2 col-sm-2 col-md-2">{{ $t('unit.owner') }}</div>
    <div class="col-xs-4 col-sm-5 col-md-5"></div>
  </div>
  <div class="row items-center" v-else>
    <div class="col-xs-3 col-sm-3 col-md-3">{{ $t('unit.code') }}</div>
    <div class="col-xs-5 col-sm-4 col-md-4">{{ $t('unit.name') }}</div>
    <div class="col-xs-4 col-sm-5 col-md-5"></div>
  </div>

  <q-list
    class="padding-zero"
    v-if="
      store.getAccountInfo().roles &&
      (store.getAccountInfo().roles.admin ||
        store.getAccountInfo().roles.manager)
    "
    highlight
    no-border
    separator
  >
    <q-item v-for="(item, i) in data.list" :key="i">
      <div class="col-xs-2 col-sm-2 col-md-2 wrap">{{ item.code }}</div>
      <div class="col-xs-4 col-sm-3 col-md-3 wrap">{{ item.name }}</div>
      <div class="col-xs-2 col-sm-2 col-md-2 wrap">
        {{ ownerIdToAccount(item.ownerId) }}
      </div>
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
  <q-list class="padding-zero" v-else highlight no-border separator>
    <q-item v-for="(item, i) in data.list" :key="i">
      <div class="col-xs-3 col-sm-3 col-md-3 wrap">{{ item.code }}</div>
      <div class="col-xs-5 col-sm-4 col-md-4 wrap">{{ item.name }}</div>
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
    <q-card style="width: 50%">
      <q-card-section>{{ $t('unit.titleAdd') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-select
            v-model="input.ownerId"
            v-if="
              store.getAccountInfo().roles &&
              (store.getAccountInfo().roles.admin ||
                store.getAccountInfo().roles.manager)
            "
            emit-value
            option-label="account"
            option-value="userId"
            :label="$t('unit.owner')"
            :options="data.userList"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.code" :label="$t('unit.code')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('unit.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            :label="$t('unit.info')"
          />
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn color="primary" flat v-close-popup @click="onAddOk">
          {{ $t('buttons.ok') }}
        </q-btn>
        <q-btn flat v-close-popup>{{ $t('buttons.cancel') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showEdit">
    <q-card style="width: 50%">
      <q-card-section>{{ $t('unit.titleEdit') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-select
            v-model="input.ownerId"
            v-if="
              store.getAccountInfo().roles &&
              (store.getAccountInfo().roles.admin ||
                store.getAccountInfo().roles.manager)
            "
            emit-value
            option-label="account"
            option-value="userId"
            :label="$t('unit.owner')"
            :options="data.userList"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.code" readonly :label="$t('unit.code')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('unit.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            :label="$t('unit.info')"
          />
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn color="primary" flat v-close-popup @click="onEditOk">
          {{ $t('buttons.ok') }}
        </q-btn>
        <q-btn flat v-close-popup>{{ $t('buttons.cancel') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showDelete">
    <q-card style="width: 50%">
      <q-card-section>{{ $t('unit.titleDelete') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          {{ $t('unit.deleteText') }}
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
      <q-card-section>{{ $t('unit.titleDetail') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-select
            v-model="input.ownerId"
            v-if="
              store.getAccountInfo().roles &&
              (store.getAccountInfo().roles.admin ||
                store.getAccountInfo().roles.manager)
            "
            emit-value
            option-label="account"
            option-value="userId"
            readonly
            :label="$t('unit.owner')"
            :options="data.userList"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.unitId" readonly :label="$t('unit.unitId')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.code" readonly :label="$t('unit.code')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" readonly :label="$t('unit.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            readonly
            type="textarea"
            :label="$t('unit.info')"
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
</template>

<script>
import { defineComponent } from 'vue';
import qs from 'qs';
import { useStore } from 'stores/system';

export default defineComponent({
  name: 'UnitPage',

  created() {
    this.getCount();
  },

  data() {
    return {
      data: {
        list: [],
        count: 0,
        totalPages: 0,
        userList: [],
      },
      input: {
        unitId: '',
        code: '',
        ownerId: '',
        memberIds: '',
        name: '',
        info: '',
      },
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
          code: this.input.code,
        },
      };
      if (this.input.ownerId) {
        body.data.ownerId = this.input.ownerId;
      }
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
        url: `${this.$root.config.coremgr.base}/api/v1/unit`,
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
      if (this.input.ownerId) {
        body.data.ownerId = this.input.ownerId;
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
      } else if (!this.input.info) {
        body.data.info = '{}';
      }
      let opts = {
        method: 'PATCH',
        url: `${this.$root.config.coremgr.base}/api/v1/unit/${this.input.unitId}`,
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
        url: `${this.$root.config.coremgr.base}/api/v1/unit/${this.input.unitId}`,
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
      let opts = {
        method: 'GET',
        url: `${
          this.$root.config.coremgr.base
        }/api/v1/unit/count?${qs.stringify(query)}`,
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
      let opts = {
        method: 'GET',
        url: `${this.$root.config.coremgr.base}/api/v1/unit/list?${qs.stringify(
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
          self.data.list = resp.data.data;
          if (
            self.store.getAccountInfo().roles &&
            (self.store.getAccountInfo().roles.admin ||
              self.store.getAccountInfo().roles.manager)
          ) {
            self.getUserList();
          }
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getList);
        });
    },
    getUserList() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.coremgr.base}/api/v1/user/list?limit=0`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          self.data.userList = resp.data.data;
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getUserList);
        });
    },
    ownerIdToAccount(id) {
      for (let user of this.data.userList) {
        if (user.userId === id) {
          return user.account;
        }
      }
      return '';
    },
    prepareInput(data) {
      return {
        unitId: data ? data.unitId : '',
        code: data ? data.code : '',
        ownerId: data ? data.ownerId : '',
        memberIds: data ? data.memberIds.join(',') : '',
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
