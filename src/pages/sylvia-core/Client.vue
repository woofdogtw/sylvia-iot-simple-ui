<template>
  <q-toolbar>
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

    <q-btn flat icon="add" round :disable="loading" @click="onAddClick">
      <q-tooltip>{{ $t('buttons.add') }}</q-tooltip>
    </q-btn>
  </q-toolbar>

  <q-separator />

  <div class="row items-center">
    <div class="col-xs-2 col-sm-2 col-md-2">{{ $t('client.clientId') }}</div>
    <div class="col-xs-2 col-sm-1 col-md-1">
      {{ $t('client.public') }} / {{ $t('client.private') }}
    </div>
    <div class="col-xs-4 col-sm-3 col-md-3">{{ $t('client.name') }}</div>
    <div class="col-xs-4 col-sm-6 col-md-6"></div>
  </div>

  <q-list class="padding-zero" highlight no-border separator>
    <q-item v-for="(item, i) in data.list" :key="i">
      <div class="col-xs-2 col-sm-2 col-md-2 wrap">{{ item.clientId }}</div>
      <div class="col-xs-2 col-sm-1 col-md-1 wrap">
        {{ item.clientSecret ? $t('client.private') : $t('client.public') }}
      </div>
      <div class="col-xs-4 col-sm-3 col-md-3 wrap">{{ item.name }}</div>
      <div class="col-xs-4 col-sm-6 col-md-6 row justify-end">
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
      <q-card-section>{{ $t('client.titleAdd') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-select
            v-model="input.userId"
            v-if="
              store.getAccountInfo().roles && store.getAccountInfo().roles.admin
            "
            emit-value
            option-label="name"
            option-value="userId"
            :label="$t('client.user')"
            :options="data.userList"
          />
        </q-card-section>
        <q-card-section>
          <q-checkbox
            v-model="input.genSecret"
            :label="$t('client.createSecret')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.redirectUris"
            :error="inputError.redirectUris !== ''"
            :error-message="inputError.redirectUris"
            :label="$t('client.redirectUris')"
            @update:model-value="validateRedirectUris"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.scopes"
            :error="inputError.scopes !== ''"
            :error-message="inputError.scopes"
            :label="$t('client.scopes')"
            @update:model-value="validateScopes"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('client.name')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.image" :label="$t('client.image')" />
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
      <q-card-section>{{ $t('client.titleEdit') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section v-if="input.clientSecret">
          <q-checkbox
            v-model="input.genSecret"
            :label="$t('client.regenSecret')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.redirectUris"
            :error="inputError.redirectUris !== ''"
            :error-message="inputError.redirectUris"
            :label="$t('client.redirectUris')"
            @update:model-value="validateRedirectUris"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.scopes"
            :error="inputError.scopes !== ''"
            :error-message="inputError.scopes"
            :label="$t('client.scopes')"
            @update:model-value="validateScopes"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" :label="$t('client.name')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.image" :label="$t('client.image')" />
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
      <q-card-section>{{ $t('client.titleDelete') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          {{ $t('client.deleteText') }}
        </q-card-section>
        <q-card-section>
          <b>{{ input.name }}</b>
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
      <q-card-section>{{ $t('client.titleDetail') }}</q-card-section>

      <q-separator />

      <q-card-section class="scroll" style="max-height: 50vh">
        <q-card-section>
          <q-select
            v-model="input.userId"
            v-if="
              store.getAccountInfo().roles && store.getAccountInfo().roles.admin
            "
            option-label="name"
            option-value="userId"
            readonly
            :label="$t('client.user')"
            :options="data.userList"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.clientId"
            readonly
            :label="$t('client.clientId')"
          />
        </q-card-section>
        <q-card-section v-if="input.clientSecret">
          <q-input
            v-model="input.clientSecret"
            readonly
            :label="$t('client.clientSecret')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.redirectUris"
            readonly
            :label="$t('client.redirectUris')"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="input.scopes"
            readonly
            :label="$t('client.scopes')"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.name" readonly :label="$t('client.name')" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="input.image" readonly :label="$t('client.image')" />
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
  name: 'ClientPage',

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
        clientId: '',
        clientSecret: null,
        redirectUris: '',
        scopes: '',
        userId: '',
        name: '',
        image: null,
        genSecret: false,
      },
      inputError: {
        redirectUris: '',
        scopes: '',
      },
      userId: '',
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
          redirectUris: this.$root.str2arr(this.input.redirectUris),
          scopes: this.$root.str2arr(this.input.scopes),
        },
        credentials: this.input.genSecret,
      };
      if (this.input.userId) {
        body.data.userId = this.input.userId;
      }
      if (this.input.name) {
        body.data.name = this.input.name;
      }
      if (this.input.image) {
        body.data.image = this.input.image;
      }
      let opts = {
        method: 'POST',
        url: `${this.$root.config.coremgr.base}/api/v1/client`,
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
          redirectUris: this.$root.str2arr(this.input.redirectUris),
          scopes: this.$root.str2arr(this.input.scopes),
          name: this.input.name,
          image: this.input.image || null,
        },
        regenSecret: this.input.genSecret,
      };
      let opts = {
        method: 'PATCH',
        url: `${this.$root.config.coremgr.base}/api/v1/client/${this.input.clientId}`,
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
        url: `${this.$root.config.coremgr.base}/api/v1/client/${this.input.clientId}`,
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
        redirectUris: '',
        scopes: '',
      };
    },
    getCount() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let query = {};
      if (this.userId) {
        query.user = this.userId;
      }
      let opts = {
        method: 'GET',
        url: `${
          this.$root.config.coremgr.base
        }/api/v1/client/count?${qs.stringify(query)}`,
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
      if (this.userId) {
        query.user = this.userId;
      }
      let opts = {
        method: 'GET',
        url: `${
          this.$root.config.coremgr.base
        }/api/v1/client/list?${qs.stringify(query)}`,
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
          const accountInfo = self.store.getAccountInfo();
          if (accountInfo.roles && accountInfo.roles.admin) {
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
    prepareInput(data) {
      const input = {
        clientId: data ? data.clientId : '',
        clientSecret: data ? data.clientSecret : null,
        redirectUris: data ? data.redirectUris.join(',') : '',
        scopes: data ? data.scopes.join(',') : '',
        userId: data ? data.userId : '',
        name: data && data.name ? data.name : '',
        image: data && data.image ? data.image : '',
        genSecret: false,
      };
      this.validateRedirectUris(input.redirectUris);
      this.validateScopes(input.scopes);
      return input;
    },
    validateInput() {
      return !(this.inputError.redirectUris || this.inputError.scopes);
    },
    validateRedirectUris(value) {
      const arr = this.$root.str2arr(value);
      let valid = arr.length > 0;
      for (const item of arr) {
        if (
          !this.$root.isURL(item) ||
          (!item.startsWith('http:') && !item.startsWith('https:'))
        ) {
          valid = false;
          break;
        }
      }
      this.inputError.redirectUris = valid
        ? ''
        : this.$t('inputError.clientRedirectUris');
      return valid;
    },
    validateScopes(value) {
      const arr = this.$root.str2arr(value);
      let valid = true;
      for (const item of arr) {
        if (!/^[a-z0-9]+([\.]{1}[a-z0-9])*$/.test(item)) {
          valid = false;
          break;
        }
      }
      this.inputError.scopes = valid ? '' : this.$t('inputError.clientScopes');
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
