// Line chart - Crypto currency chart

class DonutChart {
  constructor(_parentElement, _variable) {
    this.parentElement = _parentElement;
    this.variable = _variable;
    this.initVis();
  }

  initVis() {
    var self = this;
    self.margin = { left: 0, right: 0, top: 40, bottom: 0 };
    self.height = 250 - self.margin.top - self.margin.bottom;
    self.width = 250 - self.margin.left - self.margin.right;
    self.radius = Math.min(self.width, self.height) / 2;

    self.pie = d3
      .pie()
      .padAngle(0.03)
      .value(d => d.data[self.variable])
      .sort(null);

    self.arc = d3
      .arc()
      .innerRadius(self.radius - 60)
      .outerRadius(self.radius - 30);

    self.svg = d3
      .select(self.parentElement)
      .append("svg")
      .attr("width", self.width + self.margin.left + self.margin.right)
      .attr("height", self.height + self.margin.top + self.margin.bottom);

    self.g = self.svg
      .append("g")
      .attr(
        "transform",
        "translate(" +
          (self.margin.left + self.width / 2) +
          ", " +
          (self.margin.top + self.height / 2) +
          ")",
      );

    self.g
      .append("text")
      .attr("y", -self.height / 2)
      .attr("x", -self.width / 2)
      .attr("font-size", "15px")
      .attr("text-anchor", "start")
      .text(
        self.variable == "market_cap"
          ? "Market Capitalization"
          : "24 Hour Trading Volume",
      );

    self.wrangleData();
  }

  // Select/Filter the data
  wrangleData() {
    var self = this;
    // Get selected coin
    self.activeCoin = $("#coin-select").val();
    self.updateVis();
  }

  // Update elements to match the new data
  updateVis() {
    var vis = this;

    vis.path = vis.g.selectAll("path");

    vis.data0 = vis.path.data();
    vis.data1 = vis.pie(donutData);

    // JOIN elements with new data.
    vis.path = vis.path.data(vis.data1, key);

    // EXIT old elements from the screen.
    vis.path
      .exit()
      .datum(function(d, i) {
        return findNeighborArc(i, vis.data1, vis.data0, key) || d;
      })
      .transition()
      .duration(750)
      .attrTween("d", arcTween)
      .remove();

    // UPDATE elements still on the screen.
    vis.path
      .transition()
      .duration(750)
      .attrTween("d", arcTween)
      .attr("fill-opacity", d => (d.data.coin == vis.activeCoin ? 1 : 0.3));

    // ENTER new elements in the array.
    vis.path
      .enter()
      .append("path")
      .each((d, i) => {
        this._current = findNeighborArc(i, vis.data0, vis.data1, key) || d;
      })
      .attr("fill", d => color(d.data.coin))
      .attr("fill-opacity", d => (d.data.coin == vis.activeCoin ? 1 : 0.3))
      .on("click", arcClicked)
      .transition()
      .duration(750)
      .attrTween("d", arcTween);

    function key(d) {
      return d.data.coin;
    }

    function findNeighborArc(i, data0, data1, key) {
      var d;
      return (d = findPreceding(i, vis.data0, vis.data1, key))
        ? { startAngle: d.endAngle, endAngle: d.endAngle }
        : (d = findFollowing(i, vis.data0, vis.data1, key))
        ? { startAngle: d.startAngle, endAngle: d.startAngle }
        : null;
    }

    // Find the element in data0 that joins the highest preceding element in data1.
    function findPreceding(i, data0, data1, key) {
      var m = vis.data0.length;
      while (--i >= 0) {
        var k = key(vis.data1[i]);
        for (var j = 0; j < m; ++j) {
          if (key(vis.data0[j]) === k) return vis.data0[j];
        }
      }
    }

    // Find the element in data0 that joins the lowest following element in data1.
    function findFollowing(i, data0, data1, key) {
      var n = vis.data1.length,
        m = vis.data0.length;
      while (++i < n) {
        var k = key(vis.data1[i]);
        for (var j = 0; j < m; ++j) {
          if (key(vis.data0[j]) === k) return vis.data0[j];
        }
      }
    }

    function arcTween(d) {
      var i = d3.interpolate(this._current, d);
      this._current = i(1);
      return t => vis.arc(i(t));
    }
  }
}
