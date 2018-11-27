// Line graph - Crypto currency chart

const margin = { left: 80, right: 100, top: 50, bottom: 100 },
  height = 500 - margin.top - margin.bottom,
  width = 800 - margin.left - margin.right;

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const g = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

const t = () => {
  return d3.transition().duration(1000);
};

const parseTime = d3.timeParse("%d/%m/%Y");
const formatTime = d3.timeFormat("%d/%m/%Y");
const bisectDate = d3.bisector(d => {
  return d.date;
}).left;

// Add the line for the first time
g.append("path")
  .attr("class", "line")
  .attr("fill", "none")
  .attr("stroke", "grey")
  .attr("stroke-width", "3px");

// Scales
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Axis generators
const xAxisCall = d3.axisBottom().ticks(4);
const yAxisCall = d3.axisLeft();

// Axis groups
const xAxis = g
  .append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")");

const yAxis = g.append("g").attr("class", "y axis");

// Labels
const xLabel = g
  .append("text")
  .attr("class", "x axisLabel")
  .attr("y", height + 50)
  .attr("x", width / 2)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Time");

const yLabel = g
  .append("text")
  .attr("class", "y axisLabel")
  .attr("transform", "rotate(-90)")
  .attr("y", -60)
  .attr("x", -170)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Price (USD)");

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
    update();
  },
});

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
  const selectedOption = $("#var-select").val();

  const sliderValues = $("#date-slider").slider("values");
  const dataTimeFiltered = filteredData[coin].filter(
    d => d.date >= sliderValues[0] && d.date <= sliderValues[1],
  );

  // Line path generator
  const line = d3
    .line()
    .x(d => x(d.date))
    .y(d => y(d[selectedOption]));

  // Set scale domains
  x.domain(d3.extent(dataTimeFiltered, d => d.date));
  y.domain([
    d3.min(dataTimeFiltered, d => d[selectedOption] / 1.005),
    d3.max(dataTimeFiltered, d => d[selectedOption] * 1.005),
  ]);

  // Fix for format values
  const formatSi = d3.format(".2s");
  const formatAbbreviation = x => {
    let s = formatSi(x);
    switch (s[s.length - 1]) {
      case "G":
        return s.slice(0, -1) + "B";
      case "k":
        return s.slice(0, -1) + "K";
    }
    return s;
  };

  // Update axes
  xAxisCall.scale(x);
  xAxis.transition(t()).call(xAxisCall);
  yAxisCall.scale(y);
  yAxis.transition(t()).call(yAxisCall.tickFormat(formatAbbreviation));

  // Add line to chart
  g.select(".line")
    .transition(t)
    .attr("d", line(dataTimeFiltered));

  // Update y-axis label
  var newText =
    selectedOption == "price_usd"
      ? "Price (USD)"
      : selectedOption == "market_cap"
      ? "Market Capitalization (USD)"
      : "24 Hour Trading Volume (USD)";
  yLabel.text(newText);
};

// Event listeners
$("#coin-select").on("change", update);
$("#var-select").on("change", update);
