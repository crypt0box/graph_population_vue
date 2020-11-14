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
      <div v-for="code in selectedPref" :key="code.prefCode">
        {{ code.prefCode }}
      </div>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios"

export default {
  name: "App",
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
    }
  },
  mounted() {
    // ページを開いたと同時に都道府県名一覧を取得する
    const prefUrl = 'https://opendata.resas-portal.go.jp/api/v1/prefectures';
    axios
      .get(prefUrl, { headers: { 'X-API-KEY': 's0hFWhIFWYdTDQfS8M71K2SJ982pE3xJpmXi0h0w'}})
      .then(response => {
        this.prefList = response.data.result;
        console.log(response);
      })
      .catch(error => console.log(error));
  },
  watch: {
    // 選択した都道府県の人口構成をAPIで取得する
    selectedPref(items) {
      for (const item of items) {
        const populationUrl = `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?-&prefCode=${item.prefCode}`;
        axios
          .get(populationUrl, { headers: { 'X-API-KEY': 's0hFWhIFWYdTDQfS8M71K2SJ982pE3xJpmXi0h0w'}})
          .then(response => {
            console.log(response);
          })
          .catch(error => console.log(error));
          }
    }
  }
};
</script>
