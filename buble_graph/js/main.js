// Bubble graph (Gapminder)

const margin = { left: 80, right: 20, top: 50, bottom: 100 };
const height = 500 - margin.top - margin.bottom,
  width = 800 - margin.left - margin.right;

const g = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

let time = 0;

// Scales
const x = d3
  .scaleLog()
  .base(10)
  .range([0, width])
  .domain([142, 150000]);

const y = d3
  .scaleLinear()
  .range([height, 0])
  .domain([0, 90]);

const area = d3
  .scaleLinear()
  .range([25 * Math.PI, 1500 * Math.PI])
  .domain([2000, 1400000000]);

const continentColor = d3
  .scaleOrdinal()
  .domain(["europe", "americas", "asia", "africa"])
  .range(["blue", "orange", "green", "purple"]);

// Labels
const xLabel = g
  .append("text")
  .attr("y", height + 50)
  .attr("x", width / 2)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("GDP Per Capita ($)");

const yLabel = g
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -40)
  .attr("x", -170)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Life Expectancy (Years)");

const timeLabel = g
  .append("text")
  .attr("y", height - 10)
  .attr("x", width - 40)
  .attr("font-size", "40px")
  .attr("opacity", "0.4")
  .attr("text-anchor", "middle")
  .text("1800");

// X Axis
const xAxisCall = d3
  .axisBottom(x)
  .tickValues([400, 4000, 40000])
  .tickFormat(d3.format("$"));
g.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxisCall);

// Y Axis
const yAxisCall = d3.axisLeft(y).tickFormat(function(d) {
  return +d;
});
g.append("g")
  .attr("class", "y axis")
  .call(yAxisCall);

// Get the data from json file
d3.json("data/data.json").then(data => {
  // Clean/Filter data
  const formattedData = data.map(year => {
    return year["countries"]
      .filter(country => (dataExists = country.income && country.life_exp))
      .map(country => {
        country.income = +country.income;
        country.life_exp = +country.life_exp;
        return country;
      });
  });

  // Run the code every 0.1 second
  d3.interval(() => {
    // Loop back when loop through all the data
    time = time < 214 ? time + 1 : 0;
    update(formattedData[time]);
  }, 100);

  // First run of the visualization
  update(formattedData[0]);
});

// Function update
const update = data => {
  // Transition time for the visualization
  const t = d3.transition().duration(100);

  // Join new data with old elements
  const circles = g.selectAll("circle").data(data, d => d.country);

  // Exit old elements not present in new data
  circles
    .exit()
    .attr("class", "exit")
    .remove();

  // Enter new elements present in new data
  circles
    .enter()
    .append("circle")
    .attr("class", "enter")
    .attr("fill", d => continentColor(d.continent))
    .merge(circles)
    .transition(t)
    .attr("cy", d => y(d.life_exp))
    .attr("cx", d => x(d.income))
    .attr("r", d => Math.sqrt(area(d.population) / Math.PI));

  // Update the time label
  timeLabel.text(+(time + 1800));
};
