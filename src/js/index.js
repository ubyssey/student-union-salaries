var width = 960,
    height = 1160;

// var svg = d3.select('body').append('svg')
//     .attr('width', width)
//     .attr('height', height);
//
// d3.json('canada.json', function(error, canada) {
//   if (error) return console.error(error);
//
//   var subunits = topojson.feature(canada, canada.objects.subunits);
//
//   var projection = d3.geo.mercator()
//       .scale(500)
//       .translate([1200, 1400]);
//   var path = d3.geo.path()
//     .projection(projection);
//
//   svg.append('path')
//     .datum(subunits)
//     .attr('d', path);
// });

var DATA_URL = 'https://s3-us-west-1.amazonaws.com/ubyssey/media/data/student-union-salaries.csv'

var COLORS = ['#a6cee3','#1f78b4','#3814a0','#b2df8a','#27ca1e','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#bb9e2f','#b15928'];

function StudentUnionSalaries() {

  var chart = this;

  chart.sortBy = 'Salary';
  chart.sortDir = d3.descending;
  chart.data = null;
  chart.rows = null;

  function insertChart() {
    chart.data = sortData(data);
    tabulateData(['School', 'Salary', 'Undergrad Population']);
  }

  function updateChart() {
    chart.data = sortData(data);
    chart.rows = sortData(chart.rows);
  }

  function sortData(data) {
    return data.sort(function (a,b) {
      return sortDir(a[chart.sortBy], b[chart.sortBy]);
    });
  }

  function updateSort(column) {
    if (chart.sortBy === column) {
      chart.sortDir = chart.sortDir === d3.ascending ? d3.descending : d3.ascending;
    } else {
      chart.sortBy = column;
      chart.sortDir = d3.descending;
    }
  }

  function tabulateData(columns) {
    var table = d3.select('body').append('table'),
        thead = table.append('thead'),
        tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(columns)
      .enter()
      .append('th')
      .text(function(column) { return column; })
      .on('click', function(column, i) {
        updateSort(column);
        updateChart();
      })

    // create a row for each object in the data
    chart.rows = tbody.selectAll('tr')
      .data(chart.data)
      .enter()
      .append('tr');

    // create a cell in each row for each column
    var cells = chart.rows.selectAll('td')
      .data(function(row) {
        return columns.map(function(column) {
          return {value: row[column], color: row.Index};
        });
      })
      .enter()
      .append('td')
      .html(function(d, i) {
        if (i === 0) {
          return '<span class="sus-table-icon" style="background-color: ' + COLORS[d.color] + '"></span>' + d.value;
        } else {
          return d.value;
        }
      });

      return table;
  }

  // Initialize
  d3.csv(DATA_URL, function(error, results) {
    chart.data = results;
    insertChart();
  });
}

StudentUnionSalaries();
