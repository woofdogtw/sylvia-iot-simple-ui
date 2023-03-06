<template>
  <q-card>
    <q-tabs v-model="tab" align="left">
      <q-tab name="uldata">{{ $t('loraIfroglab.tabUldata') }}</q-tab>

      <q-tab name="dldata">{{ $t('loraIfroglab.tabDldata') }}</q-tab>

      <q-tab name="queue">{{ $t('loraIfroglab.tabQueue') }}</q-tab>
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <UlDataPage name="uldata"></UlDataPage>

      <DlDataPage name="dldata"></DlDataPage>

      <QueuePage name="queue"></QueuePage>
    </q-tab-panels>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue';
import UlDataPage from './UlData';
import DlDataPage from './DlData';
import QueuePage from './Queue';

export default defineComponent({
  name: 'IndexPage',

  components: {
    UlDataPage,
    DlDataPage,
    QueuePage,
  },

  data() {
    return {
      tab: 'uldata',
    };
  },
});
</script>
