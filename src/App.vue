<template>
  <v-app>
    <v-main>
      {{ prefList }}
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios"

export default {
  name: "App",
  data() {
    return {
      prefList: []
    }
  },
  mounted() {
    // ページを開いたと同時に都道府県名一覧を取得するため
    const prefUrl = 'https://opendata.resas-portal.go.jp/api/v1/prefectures';
    axios
      .get(prefUrl, { headers: { 'X-API-KEY': 's0hFWhIFWYdTDQfS8M71K2SJ982pE3xJpmXi0h0w'}})
      .then(response => this.prefList = response)
      .catch(error => console.log(error));
  }
};
</script>
