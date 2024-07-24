<template>
  <h4>{{ $t('router.systemUsage') }}</h4>

  <div class="row items-center">
    <v-chart class="chart" v-if="cpuUseBar" :option="cpuBar" />
    <v-chart class="chart" v-if="!cpuUseBar" :option="cpuGauge" />
    <v-chart class="chart" :option="memoryGauge" />
    <v-chart class="chart" :option="diskGauge" />
  </div>

  <div class="row">
    <q-toggle v-model="cpuUseBar">{{ $t('router.showLogicalCpu') }}</q-toggle>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { use } from 'echarts/core';
import { BarChart, GaugeChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { useStore } from 'stores/system';

use([BarChart, CanvasRenderer, GaugeChart, GridComponent]);

export default defineComponent({
  name: 'SysInfoPage',

  components: {
    VChart,
  },

  beforeUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },

  created() {
    this.userInfo = this.store.getAccountInfo();
    this.getSysUsage();
  },

  data() {
    return {
      data: {
        cpu: [],
        mem: {
          total: 0,
          used: 0,
        },
        disk: {
          total: 0,
          used: 0,
        },
      },
      timer: null,
      cpuUseBar: false,
      cpuBar: {
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
        },
        series: [
          {
            type: 'bar',
            animation: false,
            data: [],
          },
        ],
      },
      cpuGauge: {
        series: [
          {
            type: 'gauge',
            animation: false,
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            axisLabel: {
              formatter: (_value) => {
                return '';
              },
            },
            detail: {
              formatter: '{value} %',
            },
            data: [
              {
                value: 0,
                name: this.$t('router.cpu'),
              },
            ],
          },
        ],
      },
      memoryGauge: {
        series: [
          {
            type: 'gauge',
            animation: false,
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            axisLabel: {
              formatter: (_value) => {
                return '';
              },
            },
            detail: {
              formatter: '{value} %',
            },
            data: [
              {
                value: 0,
                name: this.$t('router.memory') + ' (MB)',
              },
            ],
          },
        ],
      },
      diskGauge: {
        series: [
          {
            type: 'gauge',
            animation: false,
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            axisLabel: {
              formatter: (_value) => {
                return '';
              },
            },
            detail: {
              formatter: '{value} %',
            },
            data: [
              {
                value: 0,
                name: this.$t('router.disk') + ' (GB)',
              },
            ],
          },
        ],
      },
    };
  },

  methods: {
    getSysUsage() {
      let tokens = this.store.getTokens();
      if (!tokens.accessToken) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${this.$root.config.router.base}/api/v1/sys/usage`,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.loading = false;
          self.data = resp.data.data;
          self.timer = setTimeout(self.getSysUsage, 5000);

          // Calculate CPU values.
          let categories = new Array(self.data.cpu.length);
          for (let i = 0; i < self.data.cpu.length; i++) {
            categories[i] = i + 1;
          }
          self.cpuBar.xAxis.data = categories;
          self.cpuBar.series[0].data = self.data.cpu;
          let sum = 0;
          for (let i = 0; i < self.data.cpu.length; i++) {
            sum += self.data.cpu[i];
          }
          let avg = Math.round(sum / self.data.cpu.length);
          self.cpuGauge.series[0].data[0].value = avg;

          // Calculate memory values.
          let used = Math.round(self.data.mem.used / 1024 / 1024);
          let total = Math.round(self.data.mem.total / 1024 / 1024);
          avg = Math.round((self.data.mem.used * 100) / self.data.mem.total);
          self.memoryGauge.series[0].data[0].value = Math.round(avg);
          self.memoryGauge.series[0].data[0].name =
            self.$t('router.memory') + ` (${used}/${total} MB)`;

          // Calculate disk values.
          used = Math.round(self.data.disk.used / 1024 / 1024 / 1024);
          total = Math.round(self.data.disk.total / 1024 / 1024 / 1024);
          avg = Math.round((self.data.disk.used * 100) / self.data.disk.total);
          self.diskGauge.series[0].data[0].value = Math.round(avg);
          self.diskGauge.series[0].data[0].name =
            self.$t('router.disk') + ` (${used}/${total} GB)`;
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.getSysUsage);
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

<style scoped>
.chart {
  height: 320px;
  width: 320px;
}
</style>
