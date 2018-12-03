// Main file of the line graph - Crypto currency chart

let filteredData = {};
let lineChart;
let donutChart1;
let donutChart2;
let donutData = [];
const parseTime = d3.timeParse("%d/%m/%Y");
const formatTime = d3.timeFormat("%d/%m/%Y");
const color = d3.scaleOrdinal(d3.schemeDark2);

// Event listeners
$("#coin-select").on("change", () => {
  coinChanged();
});
$("#var-select").on("change", () => {
  lineChart.wrangleData();
});

// Add jQuery UI slider
$("#date-slider").slider({
  range: true,
  max: parseTime("31/10/2017").getTime(),
  min: parseTime("12/5/2013").getTime(),
  step: 86400000, // One day
  values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
  slide: function(event, ui) {
    $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
    $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
    lineChart.wrangleData();
  },
});

function arcClicked(arc) {
  $("#coin-select").val(arc.data.coin);
  coinChanged();
}

function coinChanged() {
  donutChart1.wrangleData();
  donutChart2.wrangleData();
  lineChart.wrangleData();
}

// Get the data from JSON file
d3.json("data/coins.json").then(data => {
  // Clean data
  for (let coin in data) {
    if (!data.hasOwnProperty(coin)) {
      continue;
    }
    filteredData[coin] = data[coin].filter(d => !(d["price_usd"] == null));
    filteredData[coin].forEach(d => {
      d["price_usd"] = +d["price_usd"];
      d["24h_vol"] = +d["24h_vol"];
      d["market_cap"] = +d["market_cap"];
      d["date"] = parseTime(d["date"]);
    });
    donutData.push({
      coin: coin,
      data: filteredData[coin].slice(-1)[0],
    });
  }

  lineChart = new LineChart("#line-area");

  donutChart1 = new DonutChart("#donut-area1", "24h_vol");
  donutChart2 = new DonutChart("#donut-area2", "market_cap");
});
