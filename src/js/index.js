var WIDTH = 800;
var HEIGHT = 533;
var DATA_URL = 'https://ubyssey.s3.amazonaws.com/media/data/sus-salaries/data.csv';
var MAP_URL = 'https://ubyssey.s3.amazonaws.com/media/data/sus-salaries/images/canada-map.svg';

var COLUMNS = [
  'School',
  'Salary',
  'Undergrad Population',
  'Executives'
];

var SORTABLE_COLUMNS = [
  'Salary',
  'Undergrad Population',
  'Executives'
];

var COLORS = ['#a6cee3','#1f78b4','#3814a0','#b2df8a','#27ca1e','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#bb9e2f','#b15928', '#4ad0a3'];

var STYLE_STR = 'GULP_REPLACE_STYLES';

function StudentUnionSalaries() {

  var chart = this;

  chart.sortBy = 'Salary';
  chart.sortDir = d3.descending;
  chart.mapSortBy = 'Salary';
  chart.data = null;
  chart.rows = null;
  chart.circles = null;

  function insertChart() {
    insertMap();
    insertTable();
  }

  function updateChart() {
    if (chart.sortBy !== 'School') {
      chart.mapSortBy = chart.sortBy;
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

  function insertContainer() {
    var root = d3.select('#sus-salaries-root');
    chart.container = root
      .append('div')
      .classed('sus-salaries__container', true);

    root.append('style').text(STYLE_STR);
  }

  function renderHeader(column) {
    var className = 'sus-salaries__table__sort';

    if (chart.sortBy === column) {
      var direction = chart.sortDir === d3.descending ? 'desc' : 'asc';
      className += ' sus-salaries__table__sort--' + direction;
    }

    return '<span>' + column + '</span><span class="' + className + '"></span>';
  }

  function sortRows(a, b) {
    return chart.sortDir(a[chart.sortBy], b[chart.sortBy]);
  }

  function insertTable() {
    var table = chart.container
      .append('table')
      .classed('sus-salaries__table', true);

    var thead = table.append('thead'),
        tbody = table.append('tbody');

    chart.headers = thead.append('tr')
      .selectAll('th')
      .data(COLUMNS)
      .enter()
      .append('th')
      .html(renderHeader)
      .on('click', function(column, i) {
        updateSort(column);
        updateChart();
      })

    chart.rows = tbody.selectAll('tr')
      .data(chart.data)
      .enter()
      .append('tr')
      .sort(sortRows);

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
          return '<div class="sus-salaries__table__flex"><div class="sus-salaries__table__icon"><span style="background-color: ' + COLORS[d.color] + '"></span></div><div class="sus-salaries__table__school">' + d.value + '</div></div>';
        } else {
          return d.value;
        }
      });

      return table;
  }

  function updateTable() {
    chart.headers.html(renderHeader);
    chart.rows.sort(sortRows);
  }

  function getInteger(raw) {
    return parseInt(raw.replace(/\$|\,/g, ''), 10);
  }

  function getRadiusScale() {
    var values = chart.data.map(function(d) { return getInteger(d[chart.mapSortBy]); })

    return d3.scale.linear()
      .range([0, 25])
      .domain([0, d3.max(values)]);
  }

  function insertMap() {
    var salariesMap = chart.container
      .append('div')
      .classed('sus-salaries__map', true);

    salariesMap.append('img')
      .classed('sus-salaries__map__canada', true)
      .attr('src', MAP_URL);

    var svg = salariesMap
      .append('div')
      .classed('sus-salaries__schools-container', true)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '0 0 ' + WIDTH + ' ' + HEIGHT)
      .classed('sus-salaries__schools', true);

    var legend = salariesMap
      .append('div')
      .classed('sus-salaries__map__legend', true)
      .append('div');

    var legendTitle = legend.append('h2')
      .text('Sort by:');

    chart.legendOptions = legend.append('ul')
      .selectAll('li')
      .data(SORTABLE_COLUMNS)
      .enter()
      .append('li')
      .classed('active', function(column) { return chart.mapSortBy === column; })
      .text(function(column) { return column; })
      .on('click', function(column, i) {
        if (chart.mapSortBy !== column) {
          updateSort(column);
          updateChart();
        }
      });

    var tooltip = salariesMap
      .append('div')
      .classed('sus-salaries__schools__tooltip', true)
      .style('display', 'none');

    var r = getRadiusScale();

    chart.circles = svg.selectAll('circle')
      .data(chart.data.reverse())
      .enter()
      .append('circle')
      .attr('cy', function(d) { return d.y; })
      .attr('cx', function(d) { return d.x; })
      .attr('r', function(d) { return r(getInteger(d[chart.mapSortBy])); })
      .style('fill', function(d) { return COLORS[d.Index]; })
      .on('mouseover', function(d) {
        var r = getRadiusScale(),
            radius = r(getInteger(d[chart.mapSortBy])),
            left = parseInt(d.x, 10) + radius + 5,
            top = parseInt(d.y, 10) - 14;

        tooltip
          .style('display', 'block')
          .style('top', (top / HEIGHT * 100) + '%')
          .style('left', (left / WIDTH * 100) + '%')
          .html(d.School);
      })
      .on('mouseout', function(d) { tooltip.style('display', 'none'); });
  }

  function updateMap() {
    var r = getRadiusScale();

    chart.circles
      .data(chart.data)
      .transition()
      .attr('r', function(d) { return r(getInteger(d[chart.mapSortBy])); });

    chart.legendOptions
      .classed('active', function(column) { return chart.mapSortBy === column; });
  }

  // Initialize
  d3.csv(DATA_URL, function(error, results) {
    chart.data = results;
    insertContainer();
    insertChart();
  });
}

StudentUnionSalaries();
