<script>
import { Line, mixins } from 'vue-chartjs';

export default {
  extends: Line,
  name: 'chart',
  mixins: [mixins.reactiveProp],
  props: ['chartData'],
  data() {
    return {
      graphOptions: {
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Month'
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              stepSize: 100,
            }
          }]
        }
      }
    }
  },
  mounted() {
    this.renderChart(this.chartData, this.graphOptions);
  }
}
</script>