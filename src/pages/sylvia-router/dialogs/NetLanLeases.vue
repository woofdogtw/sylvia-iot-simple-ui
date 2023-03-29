<template>
  <q-dialog @show="onShow" @hide="onHide">
    <q-card>
      <q-card-section>{{ $t('router.titleLeases') }}</q-card-section>

      <q-separator />

      <q-card-section style="max-height: 50vh" class="scroll">
        <q-markup-table flat dense>
          <thead>
            <tr>
              <th>{{ $t('router.leaseIp') }}</th>
              <th>{{ $t('router.leaseStarts') }}</th>
              <th>{{ $t('router.leaseEnds') }}</th>
              <th>{{ $t('router.leaseMac') }}</th>
              <th>{{ $t('router.leaseClient') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in data.leases" :key="i">
              <th>{{ item.ip }}</th>
              <th>{{ $root.timeStr(item.starts) }}</th>
              <th>{{ $root.timeStr(item.ends) }}</th>
              <th>{{ item.macAddr }}</th>
              <th>{{ item.client }}</th>
            </tr>
          </tbody>
        </q-markup-table>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat color="primary" v-close-popup>
            {{ $t('buttons.ok') }}
          </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue';
import { useStore } from 'stores/system';

export default defineComponent({
  name: 'NetLanLeasesDialog',

  beforeUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },

  data() {
    return {
      userInfo: {},
      data: {
        leases: [],
      },
      loading: false,
      timer: null,
      interval: 5000,
    };
  },

  methods: {
    onHide() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },
    onShow() {
      this.userInfo = this.store.getAccountInfo();
      this.getLeases();
    },
    getLeases() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.router.base}/api/v1/net/lan/leases`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          self.data.leases = resp.data.data;
          self.timer = setTimeout(self.getLeases, 5000);
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getList);
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
