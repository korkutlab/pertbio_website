/**
 * D3 component to draw a heat map for the given matrix.
 *
 * Idea and basic code taken from http://bl.ocks.org/Caged/6476579
 *
 * @param options       bar chart options (see _defaultOpts)
 * @param histogramData histogram data
 *
 * @author Selcuk Onur Sumer
 */
function BarChart(options, histogramData)
{
	/**
	 * Default visual options.
	 */
	var _defaultOpts = {
		el: "#barchart", // id of the container
		elHeight: 500,
		elWidth: 960,
		padding: { // chart area padding values
			left : 60,
			right: 20,
			top: 40,
			bottom: 30
		},
		yAxisLabel: "Y Axis",
		yAxisLabelAnchor: "end",
		xAxisLabel: "X Axis",
		xAxisLabelAnchor: "middle",
		xAxisTickInterval: 10,
		dataTooltipFn: function(d)
		{
			// TODO histogram tooltip template
			return "<strong>Average:</strong> <span style='color:red'>" +
			       d.average.toFixed(5) +
			       "</span>";
		}
	};

	var _svg = null;
	var _visibleTicks = null;

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	function init()
	{
		// selecting using jQuery node to support both string and jQuery selector values
		var node = $(_options.el)[0];
		var container = d3.select(node);
		_visibleTicks = visibleTicks(histogramData);

		drawBarChart(container);
	}

	function visibleTicks(data)
	{
		var ticks = [];

		for (var i = 0; i < data.length; i++)
		{
			if (i % _options.xAxisTickInterval == 0)
			{
				ticks.push(data[i].average);
			}
		}

		return ticks;
	}

	function drawBarChart(container)
	{
		var margin = _options.padding;
		var	width = _options.elWidth - margin.left - margin.right;
		var	height = _options.elHeight - margin.top - margin.bottom;

		//var formatPercent = d3.format(".0%");

		var x = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);

		var y = d3.scale.linear()
			.range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickFormat(function(d) {
				if (_.contains(_visibleTicks, d))
				{
					return d.toFixed(5);
				}
				else
				{
					return "";
				}
			});

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");
			//.tickFormat(formatPercent);

		var tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(_options.dataTooltipFn);

		var svg = container.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		svg.call(tip);

		var data = histogramData;

		x.domain(data.map(function(d) { return d.average; }));
		y.domain([0, d3.max(data, function(d) { return d.count; })]);

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
//			.append("text")
//			.style("text-anchor", _options.xAxisLabelAnchor)
//			.text(_options.xAxisLabel);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", _options.yAxisLabelAnchor)
			.text(_options.yAxisLabel);

		svg.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { return x(d.average); })
			.attr("width", x.rangeBand())
			.attr("y", function(d) { return y(d.count); })
			.attr("height", function(d) { return height - y(d.count); })
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);
	}

	this.init = init;
}
