// Brushes

class Timeline {
  constructor(_parentElement) {
    this.parentElement = _parentElement;

    this.initVis();
  }

  initVis() {
    var self = this;

    self.margin = { top: 0, right: 100, bottom: 30, left: 80 };
    self.width = 800 - self.margin.left - self.margin.right;
    self.height = 130 - self.margin.top - self.margin.bottom;

    self.svg = d3
      .select(self.parentElement)
      .append("svg")
      .attr("width", self.width + self.margin.left + self.margin.right)
      .attr("height", self.height + self.margin.top + self.margin.bottom);

    self.t = () => d3.transition().duration(1000);

    self.g = self.svg
      .append("g")
      .attr(
        "transform",
        "translate(" + self.margin.left + "," + self.margin.top + ")",
      );

    self.x = d3.scaleTime().range([0, self.width]);

    self.y = d3.scaleLinear().range([self.height, 0]);

    self.xAxisCall = d3.axisBottom().ticks(4);

    self.xAxis = self.g
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + self.height + ")");

    self.areaPath = self.g.append("path").attr("fill", "#ccc");

    // Initialize brush component
    self.brush = d3
      .brushX()
      .handleSize(10)
      .extent([[0, 0], [self.width, self.height]])
      .on("brush", brushed);

    // Append brush component
    self.brushComponent = self.g
      .append("g")
      .attr("class", "brush")
      .call(self.brush);

    self.wrangleData();
  }

  wrangleData() {
    var self = this;

    self.coin = $("#coin-select").val();
    self.yVariable = $("#var-select").val();

    self.data = filteredData[self.coin];

    self.updateVis();
  }

  updateVis() {
    var self = this;

    self.x.domain(d3.extent(self.data, d => d.date));
    self.y.domain([0, d3.max(self.data, d => d[self.yVariable])]);

    self.xAxisCall.scale(self.x);

    self.xAxis.transition(self.t()).call(self.xAxisCall);

    self.area = d3
      .area()
      .x(d => self.x(d.date))
      .y0(self.height)
      .y1(d => self.y(d[self.yVariable]));

    self.areaPath.data([self.data]).attr("d", self.area);
  }
}
