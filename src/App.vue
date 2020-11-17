<template>
  <v-app>
    <v-main>
      <div class="main-content">
        <v-row justify="center">
          <v-card>

              <div class="table-content">
                <v-card-title>
                  都道府県一覧
                  <v-spacer></v-spacer>
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="都道府県名で検索"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-card-title>
                <v-data-table
                  v-model="selectedPref"
                  :headers="headers"
                  :items="prefList"
                  :items-per-page="5"
                  :search="search"
                  item-key="prefCode"
                  show-select
                >
                <template v-slot:header.data-table-select> </template> 
                </v-data-table>
              </div>

              <div v-if="chartData" class="graph-content">
                <v-row justify="center">
                  <v-card-title>
                    都道府県の人口構成
                  </v-card-title>
                </v-row>
                <chart :chart-data="chartData" :options="options"></chart>
              </div>

          </v-card>
        </v-row>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
import Chart from './components/Chart';

const PREF_API_URL = 'https://opendata.resas-portal.go.jp/api/v1/prefectures';
const PREF_POPULATION_API_URL = 'https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?-&prefCode';
const API_KEY = 's0hFWhIFWYdTDQfS8M71K2SJ982pE3xJpmXi0h0w';

export default {
  name: 'App',
  components: {
    Chart,
  },
  data() {
    return {
      search: '',
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
        labels: ['1960', '1965', '1970', '1975', '1980', '1985', '1990', '1995', '2000',
                  '2005', '2010', '2015', '2020', '2025', '2030', '2035', '2040', '2045'],
        datasets: [],
      },
      chartData: null,
      options: {
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: '年度'
            }
          }],
          yAxes: [{
            ticks: {
              stepSize: 500000,
            },
            scaleLabel: {
              display: true,
              labelString: '人口数'
            }
          }]
        }
      }
    }
  },
  created() {
    // ページを開いたと同時に都道府県名一覧を取得する
    const prefUrl = PREF_API_URL;
    axios
      .get(prefUrl, { headers: { 'X-API-KEY': API_KEY}})
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
        const checked = newPref.length >= oldPref.length;
        if (checked) {
          // チェックをいれた都道府県のみを抽出
          const addedItem = newPref.filter(item => 
            !oldPref.includes(item)
          );
          // グラフ描画用変数に抽出した都道府県情報のテンプレを追加
          this.addTemplate(addedItem[0].prefName);
          // グラフ描画用変数に抽出した都道府県の人口構成情報を代入
          this.addChartData(addedItem[0].prefCode);
          return
        }
        // チェックを外した都道府県のみを抽出
        const removedItem = oldPref.filter(item => 
          !newPref.includes(item)
        );
        // グラフ描画用変数からチェックを外した都道府県情報を削除
        this.removeChartData(removedItem[0].prefName);
      }
    },
  },
  computed: {
    getChartData() {
      return JSON.parse(JSON.stringify(this.chartDataTemplate));
    },
  },
  methods: {
    // 指定した都道府県コードの人口構成をaxiosで取得
    async getPopulation(prefCode) {
      try {
        const populationUrl = PREF_POPULATION_API_URL + '=' + prefCode;
        const response = await axios.get(populationUrl, { headers: { 'X-API-KEY': API_KEY}});
        const items = response.data.result.data[0].data;
        return items;
      } catch (error) {
        console.log(error);
      }
    },
    addTemplate(prefName) {
      this.chartDataTemplate.datasets.push({
        label: prefName,
        data: [],
        borderColor: this.getRandomColor(),
        fill: false,
        type: 'line',
        lineTension: 0.3,
      });
    },
    setChartData(population) {
      // グラフをリアクティブにするため、値渡しを行う
      const chartData = this.getChartData;
      // axiosで取得した人口構成情報をグラフ描画用変数に代入
      population.forEach(element => {
        const index = this.selectedPref.length - 1;
        chartData.datasets[index].data.push(element.value);
        this.chartDataTemplate.datasets[index].data.push(element.value);
      });
      // 値渡しで代入
      this.chartData = chartData;
    },
    addChartData(prefCode) {
      // 選択した都道府県の人口構成を取得
      this.getPopulation(prefCode)
        .then(result => {
          // 取得した人口構成データをグラフ描画用変数に代入
          this.setChartData(result);
        })
        .catch(error => {
          console.log(error);
        });
    },
    removeChartData(prefName) {
      // 選択を外した都道府県人口情報を削除
      const removedPrefIndex = this.chartDataTemplate.datasets.findIndex(({label}) => label === prefName);
      this.chartDataTemplate.datasets.splice(removedPrefIndex, 1);
      // 値渡しで代入
      const chartData = this.getChartData;
      this.chartData = chartData;
    },
    getRandomColor() {
      const color = (Math.random() * 0xFFFFFF | 0).toString(16);
      const randomColor = '#' + ('000000' + color).slice(-6);
      return randomColor;
    }
  }
};
</script>

<style scoped>
.main-content {
  padding: 2%;
}
.graph-content {
  padding: 5%;
}
</style>
