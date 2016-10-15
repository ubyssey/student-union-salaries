var DATA_URL = 'https://s3-us-west-1.amazonaws.com/ubyssey/media/data/student-union-salaries.csv'

var COLUMNS = ['School', 'Salary', 'Undergrad Population'];
var COLORS = ['#a6cee3','#1f78b4','#3814a0','#b2df8a','#27ca1e','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#bb9e2f','#b15928'];

function StudentUnionSalaries() {

  var chart = this;

  chart.sortBy = 'Salary';
  chart.sortDir = d3.descending;
  chart.data = null;
  chart.rows = null;
  chart.circles = null;

  function insertChart() {
    insertMap();
    insertTable();
  }

  function updateChart() {
    if (chart.sortBy !== 'School') {
      updateMap();
    }

    updateTable();
  }

  function updateSort(column) {
    if (chart.sortBy === column) {
      chart.sortDir = chart.sortDir === d3.ascending ? d3.descending : d3.ascending;
    } else {
      chart.sortBy = column;
      chart.sortDir = d3.descending;
    }
  }

  function insertTable() {
    var table = d3.select('.sus-salaries__container').append('table'),
        thead = table.append('thead'),
        tbody = table.append('tbody');

    thead.append('tr')
      .selectAll('th')
      .data(COLUMNS)
      .enter()
      .append('th')
      .text(function(column) { return column; })
      .on('click', function(column, i) {
        updateSort(column);
        updateChart();
      })

    chart.rows = tbody.selectAll('tr')
      .data(chart.data)
      .enter()
      .append('tr');

    var cells = chart.rows.selectAll('td')
      .data(function(row) {
        return COLUMNS.map(function(column) {
          return {value: row[column], color: row.Index};
        });
      })
      .enter()
      .append('td')
      .html(function(d, i) {
        if (i === 0) {
          return '<span class="sus-salaries__table__icon" style="background-color: ' + COLORS[d.color] + '"></span>' + d.value;
        } else {
          return d.value;
        }
      });

      return table;
  }

  function updateTable() {
    chart.rows.sort(function (a,b) {
      return chart.sortDir(a[chart.sortBy], b[chart.sortBy]);
    });
  }

  function getRadiusScale() {
    var values = chart.data.map(function(d) { return parseInt(d[chart.sortBy], 10); })

    return d3.scale.linear()
        .range([0, 25])
        .domain([0, d3.max(values)]);
  }

  function insertMap() {
    var svg = d3.select('.sus-salaries__map')
      .append('div')
      .classed('sus-salaries__schools-container', true)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '0 0 800 533')
      .classed('sus-salaries__schools', true);

    var r = getRadiusScale();

    chart.circles = svg.selectAll('circle')
      .data(chart.data.reverse())
      .enter()
      .append('circle')
      .attr('cy', function(d) { return d.y; })
      .attr('cx', function(d) { return d.x; })
      .attr('r', function(d) { return r(parseInt(d[chart.sortBy], 10)); })
      .style('fill', function(d) { return COLORS[d.Index]; });
  }

  function updateMap() {
    var r = getRadiusScale();

    chart.circles
      .data(chart.data)
      .transition()
      .attr('r', function(d) { return r(parseInt(d[chart.sortBy], 10)); });
  }

  // Initialize
  d3.csv(DATA_URL, function(error, results) {
    chart.data = results;
    insertChart();
  });
}

StudentUnionSalaries();
