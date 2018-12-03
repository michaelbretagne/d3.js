// Main file of the line graph - Crypto currency chart

let filteredData = {};
let lineChart;
let donutChart1;
let donutChart2;
let timeline;
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
  timeline.wrangleData();
});

// Add jQuery UI slider
$("#date-slider").slider({
  range: true,
  max: parseTime("31/10/2017").getTime(),
  min: parseTime("12/5/2013").getTime(),
  step: 86400000, // One day
  values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
  slide: (event, ui) => {
    dates = ui.values.map(val => new Date(val));
    xVals = dates.map(date => timeline.x(date));

    timeline.brushComponent.call(timeline.brush.move, xVals);
  },
});

const arcClicked = arc => {
  $("#coin-select").val(arc.data.coin);
  coinChanged();
};

const coinChanged = () => {
  donutChart1.wrangleData();
  donutChart2.wrangleData();
  lineChart.wrangleData();
  timeline.wrangleData();
};

const brushed = () => {
  var selection = d3.event.selection || timeline.x.range();
  var newValues = selection.map(timeline.x.invert);

  $("#date-slider")
    .slider("values", 0, newValues[0])
    .slider("values", 1, newValues[1]);
  $("#dateLabel1").text(formatTime(newValues[0]));
  $("#dateLabel2").text(formatTime(newValues[1]));
  lineChart.wrangleData();
};

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

  timeline = new Timeline("#timeline-area");
});
