<template>
  <v-app>
    <v-main>
      <v-data-table
        v-model="selectedPref"
        :headers="headers"
        :items="prefList"
        :items-per-page="5"
        :single-select="true"
        item-key="prefCode"
        show-select
      ></v-data-table>
      <div v-for="code in chartData" :key="code.index">
        {{ code }}
      </div>
      <chart :chart-data="chartData"></chart>
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
      chartData: {
        labels: [],
        datasets: {
          label: 'Line Dataset',
          data: [],
          borderColor: '#CFD8DC',
          fill: false,
          type: 'line',
          lineTension: 0.3,
        },
      },
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
    // 都道府県がチェックされると発火
    selectedPref: {
      deep: true,
      handler() {
        // 選択した都道府県の人口構成を取得
        this.getPopulation(this.selectedPref[0].prefCode)
          .then(result => {
            this.chartData.labels = [];
            this.chartData.datasets.data = [];
            // 取得した人口構成データをグラフ描画用変数に代入
            result.forEach(element => {
              this.chartData.labels.push(String(element.year));
              this.chartData.datasets.data.push(element.value);
            });
          })
          .catch(error => {
            console.log(error);
          });
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
        const {
          status,
          statusText
        } = error.response;
        console.log(`Error! HTTP Status: ${status} ${statusText}`);
      }
    },
  }
};
</script>
