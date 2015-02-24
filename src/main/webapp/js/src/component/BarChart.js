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
		elWidth: 800,
		padding: { // chart area padding values
			left : 80,
			right: 20,
			top: 10,
			bottom: 40
		},
		barFillColor: "#FFAA00",
		barHoverColor: "#FF4500",
		drawLine: [false, false], // indicates whether to draw line charts
		lineStrokeColor: ["#0000FF", "#00FF00"],
		lineStrokeWidth: 1.5,
		yAxisLabel: "Y Axis",
		yAxisLabelAnchor: "middle",
		yAxisLabelPadding: 20,
		xAxisLabel: "X Axis",
		xAxisLabelAnchor: "middle",
		xAxisLabelPadding: 5,
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
	var _combinedData = [];

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	function init()
	{
		// selecting using jQuery node to support both string and jQuery selector values
		var node = $(_options.el)[0];
		var container = d3.select(node);
		_visibleTicks = visibleTicks(histogramData.barChartData);
		_combinedData = _combinedData.concat(histogramData.barChartData);

		_.each(histogramData.lineChartData, function(data, idx) {
			if(_options.drawLine[idx] === true)
			{
				_combinedData = _combinedData.concat(data);
			}
		});

		_svg = initSvg(container);
		drawBarChart(_svg);
		drawLineCharts(_svg);
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

	function initSvg(container)
	{
		var margin = _options.padding;
		var	width = getWidth();
		var	height = getHeight();

		// init svg
		var svg = container.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		return svg;
	}

	function getWidth()
	{
		return _options.elWidth - _options.padding.left - _options.padding.right;
	}

	function getHeight()
	{
		return _options.elHeight - _options.padding.top - _options.padding.bottom;
	}

	function drawLineCharts(svg)
	{
		var	width = getWidth();
		var	height = getHeight();

		_.each(histogramData.lineChartData, function(data, idx) {
			if(_options.drawLine[idx] !== true)
			{
				return;
			}

			// generate scale functions
			var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], .1);

			var y = d3.scale.linear()
				.range([height, 0]);

			x.domain(data.map(function(d) { return d.average; }));
			//y.domain([0, d3.max(data, function(d) { return d.count; })]);
			y.domain([0, d3.max(_combinedData, function(d) { return d.count; })]);

			// generate line function
			var line = d3.svg.line()
				.x(function(d) { return x(d.average); })
				.y(function(d) { return y(d.count); })
				.interpolate("monotone");

			// append the line (path)
			svg.append("g")
				.append("path")
				.datum(data)
				.attr("d", line)
				.attr("class", "chart-line")
				.attr("stroke", _options.lineStrokeColor[idx])
				.attr("stroke-width", _options.lineStrokeWidth)
				.attr("fill", "none");
		})
	}

	function drawBarChart(svg)
	{
		var	width = getWidth();
		var	height = getHeight();

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
					return d.toFixed(3);
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

		// init tooltip
		var tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(_options.dataTooltipFn);

		svg.call(tip);

		var data = histogramData.barChartData;

		x.domain(data.map(function(d) { return d.average; }));
		//y.domain([0, d3.max(data, function(d) { return d.count; })]);
		y.domain([0, d3.max(_combinedData, function(d) { return d.count; })]);


		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
			.attr("y", _options.padding.bottom - _options.xAxisLabelPadding)
			.attr("x", width / 2)
			//.attr("dy", ".71em")
			.style("text-anchor", _options.xAxisLabelAnchor)
			.text(_options.xAxisLabel);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", _options.yAxisLabelPadding - _options.padding.left)
			//.attr("dy", ".71em")
			.attr("x", -(height / 2))
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
			.attr("fill", _options.barFillColor)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		// add hover effect to the histogram bars
		$(_options.el).find(".bar").hover(function() {
			$(this).css({fill: _options.barHoverColor});
		},
		function() {
			$(this).css({fill: _options.barFillColor});
		});
	}

	function getData()
	{
		return histogramData;
	}

	this.init = init;
	this.getData = getData;
}
