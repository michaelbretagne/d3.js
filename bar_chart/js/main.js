// Bar chart

var margin = { top: 10, right: 20, bottom: 150, left: 100 };
var width = 600 - margin.left - margin.right;
var height = 400 - margin.left - margin.right;

var g = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// x label
g.append("text")
  .attr("x", width / 2)
  .attr("y", height + 50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Month");

// y label
g.append("text")
  .attr("x", -(height / 2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Revenue");

d3.json("data/revenues.json")
  .then(data => {
    data.forEach(d => {
      d.revenue = +d.revenue;
      d.profit = +d.profit;
    });
    console.table(data);

    var x = d3
      .scaleBand()
      .domain(data.map(d => d.month))
      .range([0, width])
      .paddingInner(0.3)
      .paddingOuter(0.3);

    var y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.revenue)])
      .range([height, 0]);

    // x axis
    var xAxisCall = d3.axisBottom(x);

    g.append("g")
      .attr("class", "bottom axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxisCall);

    // y axis
    var yAxisCall = d3.axisLeft(y);

    g.append("g")
      .attr("class", "left axis")
      .call(yAxisCall);

    var rects = g.selectAll("rect").data(data);

    rects
      .enter()
      .append("rect")
      .attr("width", x.bandwidth)
      .attr("height", d => height - y(d.revenue))
      .attr("x", d => x(d.month))
      .attr("y", d => y(d.revenue))
      .attr("fill", "grey");
  })
  .catch(error => {
    console.log(error);
  });
