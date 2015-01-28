function HeatMap(options, matrix)
{
	/**
	 * Default visual options.
	 */
	var _defaultOpts = {
		el: "#heatmap",         // id of the container
		cellWidth: 8,           // width of a single data cell
		cellHeight: 8,          // height of a single data cell
		colorScaleRange: ["#0000FF", "#FDFDFD", "#FF0000"], // [min, mid, max] values for color scale range
		//colorScaleRange: colorbrewer.RdBu[3].reverse(),
		colorScaleDomain: [-1, 0, 1], // [min, mid, max] values for color scale domain
		animationDuration: 1000, // transition duration (in ms) used for animations
		threshold: {neg: 0, pos: 0}, // threshold to ignore tooltips
		/**
		 * Default data point tooltip function.
		 *
		 * @param selection target selection (assuming data rectangles)
		 */
		dataTooltipFn: function(selection) {
			var options = ViewUtil.defaultTooltipOptions();

			var display = {
				score: "Score", // TODO W_ij
				rowHeader: "Perturbation",
				colHeader: "Protein"
			};

			options.content = {
				text: function(event, api) {
					var model = {
						datum: d3.selectAll(this).datum(),
						display: display
					};

					var tooltipView = new HeatMapTipView({model: model});
					return tooltipView.compileTemplate();
				}
			};

			$(selection).qtip(options);
		}
	};

	var _svg = null;

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	function init()
	{
		// selecting using jQuery node to support both string and jQuery selector values
		var node = $(_options.el)[0];
		var container = d3.select(node);

		var heatMapData = HeatMapDataUtil.processData(matrix);

		// create svg element & update its reference
		var svg = createSvg(container,
		                    calculateInitialWidth(_options, matrix.data),
		                    calculateInitialHeight(_options, matrix.data));
		_svg = svg;

		drawHeatMap(svg, _options, heatMapData);

		// add default listeners
		addDefaultListeners();

		// add default tooltips
		addDefaultTooltips(_options);
	}

	function drawHeatMap(svg, options, data)
	{
		var colorScaleFn = colorScale(options);

		var heatMap = svg.selectAll(".heatmap")
			.data(data)
			.enter().append("rect")
			.attr("class", function(d) {
				var value = "heatmap-data-rect";

				// this is to ignore rectangles with values below threshold
				// when adding tooltip
				if (d.score <= options.threshold.neg ||
				    d.score >= options.threshold.pos)
				{
					value += " heatmap-tooltip";
				}

				return value;
			})
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

	function addDefaultTooltips(options)
	{
		var dataTipFn = options.dataTooltipFn;

		if (_.isFunction(dataTipFn))
		{
			dataTipFn($(options.el).find(".heatmap-tooltip"));
		}
	}

	this.init = init;
}
