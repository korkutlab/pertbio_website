/**
 * D3 component to draw a heat map for the given matrix.
 *
 * @param options   gradient options (see _defaultOpts)
 *
 * @author Selcuk Onur Sumer
 */
function GradientLegend(options)
{
	/**
	 * Default visual options.
	 */
	var _defaultOpts = {
		el: "#gradient_legend",  // id of the container
		orientation: "horizontal", // "vertical" or "horizontal"
		padding: { // svg padding values
			left : 30,
			right: 30,
			top: 20,
			bottom: 20
		},
		barWidth: 300, // bar width
		barHeight: 8,  // bar height
		barStroke: "#666666",
		colorScaleRange: ["#0000FF", "#FDFDFD", "#FF0000"], // [min, mid, max] values for color scale range
		//colorScaleRange: colorbrewer.RdBu[3].reverse(),
		colorScaleDomain: [-1, 0, 1], // [min, mid, max] values for color scale domain
		axisTickCount: 5,
		axisTickSize: 0
	};

	var _svg = null;

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	function init()
	{
		// selecting using jQuery node to support both string and jQuery selector values
		var node = $(_options.el)[0];
		var container = d3.select(node);

		// create svg element & update its reference
		var svg = SvgUtil.createSvg(container,
			getWidth(_options) + _options.padding.left + _options.padding.right,
			getHeight(_options) + _options.padding.top + _options.padding.bottom);

		_svg = svg;

		drawGradient(svg, _options);
		drawAxis(svg, _options);
	}

	function drawGradient(svg, options)
	{
		var path = getGradientPath(options);

		var gradient = svg.append("svg:defs")
			.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", path.x1)
			.attr("y1", path.y1)
			.attr("x2", path.x2)
			.attr("y2", path.y2)
			.attr("spreadMethod", "pad");

		applyGradientColors(gradient, options.colorScaleRange);

		svg.append("svg:rect")
			.attr("width", getWidth(options))
			.attr("height", getHeight(options))
			.attr("x", options.padding.left)
			.attr("y", options.padding.top)
			.attr("stroke", options.barStroke)
			.style("fill", "url(#gradient)");
	}

	function getGradientPath(options)
	{
		if (options.orientation === "vertical")
		{
			return {
				"x1": "0%",
				"y1": "0%",
				"x2": "0%",
				"y2": "100%"
			};
		}
		else
		{
			return {
				"x1": "0%",
				"y1": "0%",
				"x2": "100%",
				"y2": "0%"
			};
		}
	}

	function applyGradientColors(gradient, colors)
	{
		var count = colors.length - 1;

		var percent = 100 / count;
		var offset = 0;

		_.each(colors, function(color, idx) {
			gradient.append("svg:stop")
				.attr("offset", offset + "%")
				.attr("stop-color", color)
				.attr("stop-opacity", 1);

			offset += percent;
		});

		return gradient;
	}

	function drawAxis(svg, options)
	{
		var orient = options.orientation === "vertical" ? "right" : "bottom";

		var axisFn = d3.svg.axis()
			.scale(getScale(options))
			.ticks(options.axisTickCount)
			//.tickValues(tickValues)
			//.tickSubdivide(true)
			//.tickSize(tickSize, tickSize/2, 0)
			.tickSize(options.barHeight + options.axisTickSize)
			.orient(orient)
			.tickFormat(function(d) {
				return d.toFixed(1);
			});

		// append axis
		var axis = svg.append("g")
			.attr("class", "legend-axis")
			.attr("transform",
		          "translate(" + options.padding.left + "," + options.padding.top + ")")
			.call(axisFn);

		return axis;
	}

	function getScale(options)
	{
		var domain = [
			_.min(options.colorScaleDomain),
			_.max(options.colorScaleDomain)
		];

		var range = [0, options.barWidth];

		return d3.scale.linear()
			.domain(domain)
			.range(range);
	}

	function getWidth(options)
	{
		if (options.orientation === "vertical")
		{
			return options.barHeight;
		}
		else
		{
			return options.barWidth;
		}
	}

	function getHeight(options)
	{
		if (options.orientation === "vertical")
		{
			return options.barWidth;
		}
		else
		{
			return options.barHeight;
		}
	}

	return {
		init: init
	};
}
