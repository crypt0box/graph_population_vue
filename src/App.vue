<template>
  <v-app>
    <v-main>
      <v-data-table
        v-model="selectedPref"
        :headers="headers"
        :items="prefList"
        :items-per-page="5"
        item-key="prefCode"
        show-select
      ></v-data-table>
      <chart :chart-data="chartData" :options="options"></chart>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
import Chart from './components/Chart';

export default {
  name: "App",
  components: {
    Chart,
  },
  data() {
    return {
      headers: [
        {
          text: 'No.',
          align: 'start',
          sortable: false,
          value: 'prefCode',
        },
        { 
          text: '都道府県名',
          sortable: false,
          value: 'prefName'
        },
      ],
      prefList: [],
      selectedPref: [],
      chartDataTemplate: {
        labels: [],
        datasets: [],
      },
      chartData: null,
      options: {
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: '西暦'
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
            }
          }]
        }
      }
    }
  },
  mounted() {
    // ページを開いたと同時に都道府県名一覧を取得する
    const prefUrl = 'https://opendata.resas-portal.go.jp/api/v1/prefectures';
    axios
      .get(prefUrl, { headers: { 'X-API-KEY': 's0hFWhIFWYdTDQfS8M71K2SJ982pE3xJpmXi0h0w'}})
      .then(response => {
        this.prefList = response.data.result;
      })
      .catch(error => console.log(error));
  },
  watch: {
    // 都道府県のチェックが[入る/外れる]と発火
    selectedPref: {
      deep: true,
      handler(newPref, oldPref) {
        // 新しく選択した都道府県情報のみを抽出
        if (newPref.length >= oldPref.length) {
          const newItem = newPref.filter(item => 
            !oldPref.includes(item)
          );
          // グラフ描画用変数に抽出した都道府県情報のテンプレを追加
          this.chartDataTemplate.datasets.push({
            label: 'Line Dataset',
            data: [],
            borderColor: '#CFD8DC',
            fill: false,
            type: 'line',
            lineTension: 0.3,
          });
          // グラフ描画用変数に抽出した都道府県の人口構成情報を代入
          this.updateChartData(newItem[0].prefCode);
        } else {
          console.log('削除')
        }
      }
    },
  },
  methods: {
    // 指定した都道府県コードの人口構成をaxiosで取得
    async getPopulation(prefCode) {
      try {
        const populationUrl = `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?-&prefCode=${prefCode}`;
        const response = await axios.get(populationUrl, { headers: { 'X-API-KEY': 's0hFWhIFWYdTDQfS8M71K2SJ982pE3xJpmXi0h0w'}});
        const items = response.data.result.data[0].data;
        return items
      } catch (error) {
        console.log(error);
      }
    },
    updateChartData(prefCode) {
      // グラフをリアクティブにするため、値渡しを行う
      const chartData = JSON.parse(JSON.stringify(this.chartDataTemplate))
      // 選択した都道府県の人口構成を取得
      this.getPopulation(prefCode)
        .then(result => {
          // 取得した人口構成データをグラフ描画用変数に代入
          result.forEach(element => {
            chartData.labels.push(String(element.year));
            chartData.datasets[this.selectedPref.length - 1].data.push(element.value);
            this.chartDataTemplate.datasets[this.selectedPref.length - 1].data.push(element.value);
          });
          // 値渡しで代入
          this.chartData = chartData
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>
