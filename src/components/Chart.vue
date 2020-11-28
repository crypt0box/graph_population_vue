<script>
import { Line, mixins } from 'vue-chartjs';

export default {
  extends: Line,
  name: 'chart',
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options'],
  // グラフ表示
  mounted() {
    if (this.chartData) {
      this.renderChart(this.chartData, this.options);
    }
  }
}
</script>