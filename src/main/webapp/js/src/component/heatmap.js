function HeatMap(options, data)
{
	/**
	 * Default visual options.
	 */
	var _defaultOpts = {
		el: "#heatmap",         // id of the container
		cellWidth: 4,           // width of a single data cell
		cellHeight: 4,          // height of a single data cell
		colorScaleRange: ["#0000FF", "#FFFFFF", "#FF0000"], // [min, mid, max] values for color scale range
		colorScaleDomain: [-1, 0, 1], // [min, mid, max] values for color scale domain
		animationDuration: 1000 // transition duration (in ms) used for animations
	};

	var _svg = null;

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	function init()
	{
		// selecting using jQuery node to support both string and jQuery selector values
		var node = $(_options.el)[0];
		var container = d3.select(node);

		var heatMapData = HeatMapDataUtil.processData(data);

		// create svg element & update its reference
		var svg = createSvg(container,
		                    calculateInitialWidth(_options, data),
		                    calculateInitialHeight(_options, data));
		_svg = svg;

		drawHeatMap(svg, _options, heatMapData);

		// add default listeners
		addDefaultListeners();
	}

	function drawHeatMap(svg, options, data)
	{
		var colorScaleFn = colorScale(options);

		var heatMap = svg.selectAll(".heatmap")
			.data(data, function(d) {
				return d.col + ':' + d.row;
			})
			.enter().append("rect")
			.attr("x", function(d) {
				return d.col * options.cellWidth;
			})
			.attr("y", function(d) {
				return d.row * options.cellHeight;
			})
			.attr("width", options.cellWidth)
			.attr("height", options.cellHeight)
			.attr("fill", function(d) {
				return colorScaleFn(d.score);
			});
	}

	/**
	 * Creates the main svg (graphical) component.
	 *
	 * @param container main container (div, etc.)
	 * @param width     width of the svg area
	 * @param height    height of the svg area
	 * @return {object} svg component
	 */
	function createSvg(container, width, height)
	{
		var svg = container.append("svg");

		svg.attr('width', width);
		svg.attr('height', height);

		return svg;
	}

	function calculateInitialWidth(options, data)
	{
		var width = 0;

		// assuming that data.matrix is a 2D array
		if (data != null &&
			data.length > 0)
		{
			// length of a row is the number of columns
			width = options.cellWidth * data[0].length;
		}

		return width;
	}

	function calculateInitialHeight(options, data)
	{
		var height = 0;

		if (data != null)
		{
			// length of the matrix is the number of rows
			height = options.cellHeight * data.length;
		}

		return height;
	}

	function colorScale(options)
	{
		return d3.scale.linear()
			.domain(options.colorScaleDomain)
			.range(options.colorScaleRange);
	}

	function addDefaultListeners()
	{
		// TODO add listeners..
	}

	this.init = init;
}
