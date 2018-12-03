// Line chart - Crypto currency chart

class LineChart {
  constructor(_parentElement) {
    this.parentElement = _parentElement;
    this.initVis();
  }

  initVis() {
    var self = this;
    self.margin = { left: 80, right: 100, top: 30, bottom: 30 };
    self.height = 350 - self.margin.top - self.margin.bottom;
    self.width = 800 - self.margin.left - self.margin.right;

    self.svg = d3
      .select(self.parentElement)
      .append("svg")
      .attr("width", self.width + self.margin.left + self.margin.right)
      .attr("height", self.height + self.margin.top + self.margin.bottom);

    self.g = self.svg
      .append("g")
      .attr(
        "transform",
        "translate(" + self.margin.left + ", " + self.margin.top + ")",
      );

    self.t = () => d3.transition().duration(1000);

    self.bisectDate = d3.bisector(d => {
      return d.date;
    }).left;

    // Add the line for the first time
    self.linePath = self.g
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke-width", "3px");

    // Scales
    self.x = d3.scaleTime().range([0, self.width]);
    self.y = d3.scaleLinear().range([self.height, 0]);

    // Axis generators
    self.xAxisCall = d3.axisBottom().ticks(4);
    self.yAxisCall = d3.axisLeft();

    // Axis groups
    self.xAxis = self.g
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + self.height + ")");

    self.yAxis = self.g.append("g").attr("class", "y axis");

    // Labels
    self.xLabel = self.g
      .append("text")
      .attr("class", "x axisLabel")
      .attr("y", self.height + 50)
      .attr("x", self.width / 2)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Time");

    self.yLabel = self.g
      .append("text")
      .attr("class", "y axisLabel")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -170)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Price (USD)");

    self.wrangleData();
  }

  // Select/Filter the data
  wrangleData() {
    var self = this;
    // Filter data based on selections
    self.coin = $("#coin-select").val();
    self.selectedOption = $("#var-select").val();
    self.sliderValues = $("#date-slider").slider("values");
    self.dataTimeFiltered = filteredData[self.coin].filter(
      d => d.date >= self.sliderValues[0] && d.date <= self.sliderValues[1],
    );

    self.updateVis();
  }

  // Update elements to match the new data
  updateVis() {
    var self = this;

    // Update scales
    self.x.domain(d3.extent(self.dataTimeFiltered, d => d.date));
    self.y.domain([
      d3.min(self.dataTimeFiltered, d => d[self.selectedOption] / 1.005),
      d3.max(self.dataTimeFiltered, d => d[self.selectedOption] * 1.005),
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
    self.xAxisCall.scale(self.x);
    self.xAxis.transition(self.t()).call(self.xAxisCall);
    self.yAxisCall.scale(self.y);
    self.yAxis
      .transition(self.t())
      .call(self.yAxisCall.tickFormat(formatAbbreviation));

    // Clear old tooltips
    d3.select(".focus").remove();
    d3.select(".overlay").remove();

    // Tooltip code
    const focus = self.g
      .append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus
      .append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", self.height);

    focus
      .append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("x1", 0)
      .attr("x2", self.width);

    focus.append("circle").attr("r", 5);

    focus
      .append("text")
      .attr("x", 15)
      .attr("dy", ".31em");

    self.svg
      .append("rect")
      .attr(
        "transform",
        "translate(" + self.margin.left + "," + self.margin.top + ")",
      )
      .attr("class", "overlay")
      .attr("width", self.width)
      .attr("height", self.height)
      .on("mouseover", () => {
        focus.style("display", null);
      })
      .on("mouseout", () => {
        focus.style("display", "none");
      })
      .on("mousemove", mousemove);

    function mousemove() {
      const x0 = self.x.invert(d3.mouse(this)[0]);
      const i = self.bisectDate(self.dataTimeFiltered, x0, 1);
      const d0 = self.dataTimeFiltered[i - 1];
      const d1 = self.dataTimeFiltered[i];
      const d = d1 && d0 ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;

      focus.attr(
        "transform",
        "translate(" +
          self.x(d.date) +
          "," +
          self.y(d[self.selectedOption]) +
          ")",
      );

      focus
        .select("text")
        .text(() => d3.format("$,")(d[self.selectedOption].toFixed(2)));

      focus
        .select(".x-hover-line")
        .attr("y2", self.height - self.y(d[self.selectedOption]));
      focus.select(".y-hover-line").attr("x2", -self.x(d.date));
    }

    // Line path generator
    const line = d3
      .line()
      .x(d => self.x(d.date))
      .y(d => self.y(d[self.selectedOption]));

    // Add line to chart
    self.g
      .select(".line")
      .attr("stroke", color(self.coin))
      .transition(self.t)
      .attr("d", line(self.dataTimeFiltered));

    // Update y-axis label
    var newText =
      self.selectedOption == "price_usd"
        ? "Price (USD)"
        : self.selectedOption == "market_cap"
        ? "Market Capitalization (USD)"
        : "24 Hour Trading Volume (USD)";
    self.yLabel.text(newText);
  }
}
