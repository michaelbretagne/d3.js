// Bar chart

var margin = { top: 10, right: 20, bottom: 150, left: 100 };

var width = 600 - margin.left - margin.right;
var height = 400 - margin.left - margin.right;

var flag = true;

var t = d3.transition().duration(750);

var g = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var xAxisGroup = g
  .append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${height})`);

var yAxisGroup = g.append("g").attr("class", "y axis");

// X scale
var x = d3
  .scaleBand()
  .range([0, width])
  .paddingInner(0.3)
  .paddingOuter(0.3);

// Y scale
var y = d3.scaleLinear().range([height, 0]);

// x label
g.append("text")
  .attr("x", width / 2)
  .attr("y", height + 50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Month");

// y label
var yLabel = g
  .append("text")
  .attr("x", -(height / 2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Revenue");

// Get the data from json file
d3.json("data/revenues.json")
  .then(data => {
    data.forEach(d => {
      d.revenue = +d.revenue;
      d.profit = +d.profit;
    });

    d3.interval(() => {
      var newData = flag ? data : data.slice(1);

      update(newData);
      flag = !flag;
    }, 1000);

    // Run the visualization for the 1st time
    update(data);
  })
  .catch(error => {
    console.log(error);
  });

var update = data => {
  var value = flag ? "revenue" : "profit";

  // Domains
  x.domain(data.map(d => d.month));
  y.domain([0, d3.max(data, d => d[value])]);

  // X axis
  var xAxisCall = d3.axisBottom(x);
  xAxisGroup.transition(t).call(xAxisCall);

  // Y axis
  var yAxisCall = d3.axisLeft(y);
  yAxisGroup.transition(t).call(yAxisCall);

  // Join new data with old elements
  var rects = g.selectAll("rect").data(data, d => d.month);

  // Exit old elements not present in new data
  rects
    .exit()
    .attr("fill", "red")
    .transition(t)
    .attr("y", y(0))
    .attr("height", 0)
    .remove();

  // Enter new elements present in new data...
  rects
    .enter()
    .append("rect")
    .attr("fill", "grey")
    .attr("y", y(0))
    .attr("height", 0)
    .attr("x", d => x(d.month))
    .attr("width", x.bandwidth)
    // And update old elements present in new data
    .merge(rects)
    .transition(t)
    .attr("x", d => x(d.month))
    .attr("width", x.bandwidth)
    .attr("y", d => y(d[value]))
    .attr("height", d => height - y(d[value]));

  var label = flag ? "Revenue" : "Profit";
  yLabel.text(label);
};
