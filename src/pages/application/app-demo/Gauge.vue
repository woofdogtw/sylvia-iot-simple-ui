<template>
  <v-chart class="chart" :option="rssi2" autoresize="true"></v-chart>
  <v-chart class="chart" :option="temperature" autoresize="true"></v-chart>
  <v-chart class="chart" :option="humidity" autoresize="true"></v-chart>
</template>

<script>
import { defineComponent } from 'vue';
import { use } from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import config from '../../../config';

use([CanvasRenderer, GaugeChart]);

export default defineComponent({
  name: 'GaugePage',

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
    this.timer = setTimeout(this.onTimer, 0);
  },

  data() {
    return {
      data: {
        list: [],
      },
      timer: null,
      interval: 1000,
      humidity: {
        series: [
          {
            type: 'gauge',
            axisLine: {
              lineStyle: {
                color: [
                  [0.25, 'blue'],
                  [0.625, 'green'],
                  [1, 'red'],
                ],
              },
            },
            axisLabel: {
              color: 'auto',
              distance: 20,
              fontSize: 20,
            },
            data: [{ value: 75 }],
            detail: {
              color: 'auto',
              formatter: '{value} %',
            },
            max: 100,
            min: 20,
            pointer: {
              itemStyle: {
                color: 'auto',
              },
            },
          },
        ],
      },
      rssi: {
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [],
            type: 'line',
          },
        ],
      },
      rssi2: {
        series: [
          {
            type: 'gauge',
            axisLine: {
              lineStyle: {
                color: [
                  [0.425, 'blue'],
                  [0.7, 'green'],
                  [1, 'red'],
                ],
              },
            },
            axisLabel: {
              color: 'auto',
              distance: 20,
              fontSize: 20,
            },
            data: [{ value: -160 }],
            detail: {
              color: 'auto',
              formatter: '{value} dBm',
            },
            max: 0,
            min: -160,
            pointer: {
              itemStyle: {
                color: 'auto',
              },
            },
          },
        ],
      },
      temperature: {
        series: [
          {
            type: 'gauge',
            axisLine: {
              lineStyle: {
                color: [
                  [0.425, 'blue'],
                  [0.7, 'green'],
                  [1, 'red'],
                ],
              },
            },
            axisLabel: {
              color: 'auto',
              distance: 20,
              fontSize: 20,
            },
            data: [{ value: 28.8 }],
            detail: {
              color: 'auto',
              formatter: '{value} ℃',
            },
            max: 40,
            min: 0,
            pointer: {
              itemStyle: {
                color: 'auto',
              },
            },
          },
        ],
      },
    };
  },

  methods: {
    onTimer() {
      if (!this.timer) {
        return;
      }

      let opts = {
        method: 'GET',
        url: `${config.appDemo.base}/api/v1/data/uldata`,
      };
      let self = this;
      this.loading = true;
      this.$axios(opts)
        .then((resp) => {
          self.data.list = resp.data.data;
          self.data.list.sort((a, b) => {
            const timeA = new Date(a.time).getTime();
            const timeB = new Date(b.time).getTime();
            if (timeA < timeB) {
              return -1;
            } else if (timeA > timeB) {
              return 1;
            }
            return 0;
          });
          let len = self.data.list.length;
          let index = len - 10;
          if (index < 0) {
            index = 0;
          }
          let xData = new Array(len - index);
          let values = new Array(len - index);
          for (let i = index; i < len; i++) {
            const d = self.data.list[i];
            let t = new Date(d.time);
            xData[i - index] = `${self.timePadding(
              t.getHours()
            )}:${self.timePadding(t.getMinutes())}:${self.timePadding(
              t.getSeconds()
            )}`;
            values[i - index] = d.rssi;
          }
          if (len > 0) {
            const d = self.data.list[len - 1];

            let temperature = parseInt(d.data.slice(0, 4), 16);
            let humidity = parseInt(d.data.slice(4, 8), 16);
            let pressure = parseInt(d.data.slice(8, 14), 16);
            temperature =
              Math.floor(((175 * temperature) / 65536 - 45) * 100) / 100;
            humidity = Math.floor(((100 * humidity) / 65536) * 100) / 100;
            pressure = Math.floor((pressure / 4096) * 100) / 100;

            self.rssi2.series[0].data = [{ value: d.rssi }];
            self.temperature.series[0].data = [{ value: temperature }];
            self.humidity.series[0].data = [{ value: humidity }];
          }
          self.rssi.xAxis.data = xData;
          self.rssi.series[0].data = values;
          if (self.timer) {
            self.timer = setTimeout(self.onTimer, self.interval);
          }
        })
        .catch((err) => {
          self.loading = false;
          self.$root.errorHandler(err, self.onTimer);
        });
    },

    timePadding(t) {
      if (t.length < 2) {
        return '0' + t;
      }
      return t;
    },
  },
});
</script>

<style scoped>
.chart {
  height: 100vh;
}
</style>
