<template>
  <v-app>
    <v-main>
      <v-data-table
        :headers="headers"
        :items="prefList"
        :items-per-page="5"
      ></v-data-table>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios"

export default {
  name: "App",
  data() {
    return {
      prefList: [],
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
    }
  },
  mounted() {
    // ページを開いたと同時に都道府県名一覧を取得するため
    const prefUrl = 'https://opendata.resas-portal.go.jp/api/v1/prefectures';
    axios
      .get(prefUrl, { headers: { 'X-API-KEY': 's0hFWhIFWYdTDQfS8M71K2SJ982pE3xJpmXi0h0w'}})
      .then(response => {
        this.prefList = response.data.result
        console.log(response)
      })
      .catch(error => console.log(error));
  }
};
</script>
