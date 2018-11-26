// Line graph - Crypto currency chart

var margin = { left: 80, right: 100, top: 50, bottom: 100 },
  height = 500 - margin.top - margin.bottom,
  width = 800 - margin.left - margin.right;

var svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

var g = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var t = () => {
  return d3.transition().duration(1000);
};

var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");
var bisectDate = d3.bisector(d => {
  return d.date;
}).left;

// Add the line for the first time
g.append("path")
  .attr("class", "line")
  .attr("fill", "none")
  .attr("stroke", "grey")
  .attr("stroke-width", "3px");

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Axis generators
var xAxisCall = d3.axisBottom();
var yAxisCall = d3.axisLeft();

// Axis groups
var xAxis = g
  .append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")");

var yAxis = g.append("g").attr("class", "y axis");

// Y-Axis label
yAxis
  .append("text")
  .attr("class", "axis-title")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .attr("fill", "#5D6971")
  .text("Population)");

// Get the data from JSON file
d3.json("data/coins.json").then(data => {
  filteredData = {};

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
  }
  // Run the visualization for the first time
  update();
});

// Function that update graph
const update = () => {
  const coin = $("#coin-select").val();
  // Line path generator
  var line = d3
    .line()
    .x(d => x(d.date))
    .y(d => y(d.price_usd));

  // Set scale domains
  x.domain(d3.extent(filteredData[coin], d => d.date));
  y.domain([
    d3.min(filteredData[coin], d => d.price_usd / 1.005),
    d3.max(filteredData[coin], d => d.price_usd * 1.005),
  ]);

  // Generate axes once scales have been set
  xAxis.call(xAxisCall.scale(x));
  yAxis.call(yAxisCall.scale(y));

  // Add line to chart
  g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-with", "3px")
    .attr("d", line(filteredData[coin]));
};

// Event listeners
$("#coin-select").on("change", update);
