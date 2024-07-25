<template>
  <q-toolbar>
    <q-space />

    <q-input v-model="search" :label="$t('user.filter')" />

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

  <div class="row items-center">
    <div class="col-xs-2 col-sm-2 col-md-2">{{ $t('user.account') }}</div>
    <div class="col-xs-4 col-sm-3 col-md-3">{{ $t('user.name') }}</div>
    <div class="col-xs-5 col-sm-4 col-md-4">{{ $t('user.roles') }}</div>
    <div class="col-xs-1 col-sm-3 col-md-3"></div>
  </div>

  <q-list class="padding-zero" highlight no-border separator>
    <q-item v-for="(item, i) in data.list" :key="i">
      <div class="col-xs-2 col-sm-2 col-md-2 wrap">{{ item.account }}</div>
      <div class="col-xs-4 col-sm-3 col-md-3 wrap">{{ item.name }}</div>
      <div class="col-xs-5 col-sm-4 col-md-4 wrap">
        {{ rolesToDisplay(item.roles) }}
      </div>
      <div class="col-xs-1 col-sm-3 col-md-3 row justify-end">
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
          v-if="
            store.getAccountInfo().roles && store.getAccountInfo().roles.admin
          "
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
      <q-card-section>{{ $t('user.titleAdd') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-input
            v-model="input.account"
            :error="inputError.account !== ''"
            :error-message="inputError.account"
            :label="$t('user.account')"
            @update:model-value="validateAccount"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.password"
            type="password"
            :error="inputError.password !== ''"
            :error-message="inputError.password"
            :label="$t('user.password')"
            @update:model-value="validatePassword"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('user.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            :error="inputError.info !== ''"
            :error-message="inputError.info"
            :label="$t('user.info')"
            @update:model-value="validateInfo"
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
      <q-card-section>{{ $t('user.titleEdit') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-input
            v-model="input.account"
            readonly
            :label="$t('user.account')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.password"
            type="password"
            :label="$t('user.password')"
          />
        </q-card-section>
        <q-card-section>
          <q-checkbox v-model="input.roles.admin" :label="$t('roles.admin')" />
          <q-checkbox
            v-model="input.roles.manager"
            :label="$t('roles.manager')"
          />
          <q-checkbox v-model="input.roles.dev" :label="$t('roles.dev')" />
          <q-checkbox v-model="input.roles.user" :label="$t('roles.user')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('user.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            type="textarea"
            :error="inputError.info !== ''"
            :error-message="inputError.info"
            :label="$t('user.info')"
            @update:model-value="validateInfo"
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
      <q-card-section>{{ $t('user.titleDelete') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          {{ $t('user.deleteText') }}
        </q-card-section>
        <q-card-section>
          <b>{{ input.account }}</b>
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
      <q-card-section>{{ $t('user.titleDetail') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-input v-model="input.userId" readonly :label="$t('user.userId')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.account"
            readonly
            :label="$t('user.account')"
          />
        </q-card-section>
        <q-card-section>
          <q-checkbox
            v-model="input.roles.admin"
            disable
            :label="$t('roles.admin')"
          />
          <q-checkbox
            v-model="input.roles.manager"
            disable
            :label="$t('roles.manager')"
          />
          <q-checkbox
            v-model="input.roles.dev"
            disable
            :label="$t('roles.dev')"
          />
          <q-checkbox
            v-model="input.roles.user"
            disable
            :label="$t('roles.user')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" readonly :label="$t('user.name')" />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.info"
            readonly
            type="textarea"
            :label="$t('user.info')"
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
  name: 'UserPage',

  created() {
    this.userInfo = this.store.getAccountInfo();
    this.getCount();
  },

  data() {
    return {
      userInfo: {},
      data: {
        list: [],
        count: 0,
        totalPages: 0,
      },
      input: {
        userId: '',
        account: '',
        password: '',
        roles: {
          admin: false,
          manager: false,
          dev: false,
          user: false,
        },
        name: '',
        info: '',
      },
      inputError: {
        account: '',
        password: '',
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
          account: this.input.account,
          password: this.input.password,
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
      let opts = {
        method: 'POST',
        url: `${this.$root.config.coremgr.base}/api/v1/user`,
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
          roles: {
            admin: this.input.roles.admin,
            manager: this.input.roles.manager,
            dev: this.input.roles.dev,
            user: this.input.roles.user,
          },
          name: this.input.name,
        },
      };
      if (this.input.password) {
        body.data.password = this.input.password;
      }
      if (this.$root.isJsonObject(this.input.info)) {
        try {
          let info = JSON.parse(this.input.info);
          body.data.info = info;
        } catch (_e) {}
      } else if (!this.input.info) {
        body.data.info = '{}';
      }
      let opts = {
        method: 'PATCH',
        url: `${this.$root.config.coremgr.base}/api/v1/user/${this.input.userId}`,
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
        url: `${this.$root.config.coremgr.base}/api/v1/user/${this.input.userId}`,
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
    onHide() {
      this.inputError = {
        account: '',
        info: '',
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
      let opts = {
        method: 'GET',
        url: `${
          this.$root.config.coremgr.base
        }/api/v1/user/count?${qs.stringify(query)}`,
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
      let opts = {
        method: 'GET',
        url: `${this.$root.config.coremgr.base}/api/v1/user/list?${qs.stringify(
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
          self.userInfo = self.store.getAccountInfo();
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getList);
        });
    },
    prepareInput(data) {
      const input = {
        userId: data ? data.userId : '',
        account: data ? data.account : '',
        password: '',
        roles: {
          admin: data && data.roles && data.roles.admin ? true : false,
          manager: data && data.roles && data.roles.manager ? true : false,
          dev: data && data.roles && data.roles.dev ? true : false,
          user: data && data.roles && data.roles.user ? true : false,
        },
        name: data && data.name ? data.name : '',
        info: data && data.info ? JSON.stringify(data.info, null, '  ') : '{}',
      };
      this.validateAccount(input.account);
      this.validatePassword(input.password);
      this.validateInfo(input.info);
      return input;
    },
    rolesToDisplay(roles) {
      if (!roles) {
        return '';
      }
      let list = [];
      for (const i in roles) {
        if (roles[i]) {
          list.push(this.$t('roles.' + i));
        }
      }
      return list.join(', ');
    },
    validateInput() {
      return !(
        this.inputError.account ||
        this.inputError.password ||
        this.inputError.info
      );
    },
    validateAccount(value) {
      const v = value && value.toLowerCase();
      const emailRegEx =
        /^([a-z0-9_+]([a-z0-9_+.]*[a-z0-9_+])?)@([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6})$/;
      const valid = emailRegEx.test(v) || /^[a-z0-9]{1}[a-z0-9-_]*$/.test(v);
      this.inputError.account = valid ? '' : this.$t('inputError.userAccount');
      return valid;
    },
    validatePassword(value) {
      const valid = !(!this.input.userId && !value);
      this.inputError.password = valid ? '' : this.$t('inputError.empty');
    },
    validateInfo(value) {
      const valid = this.$root.isJsonObject(value);
      this.inputError.info = valid ? '' : this.$t('inputError.info');
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
