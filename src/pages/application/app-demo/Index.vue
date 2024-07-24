<template>
  <q-card>
    <q-tabs v-model="tab" align="left">
      <q-tab name="gauge">{{ $t('appDemo.tabGauge') }}</q-tab>

      <q-tab name="uldata">{{ $t('appDemo.tabUldata') }}</q-tab>

      <q-tab name="dldata">{{ $t('appDemo.tabDldata') }}</q-tab>
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <GaugePage name="gauge"></GaugePage>

      <UlDataPage name="uldata"></UlDataPage>

      <DlDataPage name="dldata"></DlDataPage>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue';
import GaugePage from './Gauge.vue';
import UlDataPage from './UlData.vue';
import DlDataPage from './DlData.vue';

export default defineComponent({
  name: 'IndexPage',

  components: {
    GaugePage,
    UlDataPage,
    DlDataPage,
  },

  data() {
    return {
      tab: 'gauge',
    };
  },
});
</script>
