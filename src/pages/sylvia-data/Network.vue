<template>
  <q-card>
    <q-tabs v-model="tab" align="left">
      <q-tab name="uldata">{{ $t('data.tabUldata') }}</q-tab>
      <q-tab name="dldata">{{ $t('data.tabDldata') }}</q-tab>
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <DlDataPage name="dldata"></DlDataPage>
    </q-tab-panels>

    <q-tab-panels v-model="tab" animated>
      <UlDataPage name="uldata"></UlDataPage>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue';
import DlDataPage from './NetworkDlData.vue';
import UlDataPage from './NetworkUlData.vue';

export default defineComponent({
  name: 'NetworkPage',

  components: {
    DlDataPage,
    UlDataPage,
  },

  data() {
    return {
      tab: 'uldata',
    };
  },
});
</script>
