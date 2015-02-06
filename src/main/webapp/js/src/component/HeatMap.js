/**
 * D3 component to draw a heat map for the given matrix.
 *
 * @param options   heat map options (see _defaultOpts)
 * @param matrix    data matrix
 *
 * @author Selcuk Onur Sumer
 */
function HeatMap(options, matrix)
{
	/**
	 * Default visual options.
	 */
	var _defaultOpts = {
		el: "#heatmap",         // id of the container
		cellWidth: 8,           // width of a single data cell
		cellHeight: 8,          // height of a single data cell
		padding: { // svg padding values
			left : 2,
			right: 2,
			top: 2,
			bottom: 2
		},
		colorScaleRange: ["#0000FF", "#FDFDFD", "#FF0000"], // [min, mid, max] values for color scale range
		//colorScaleRange: colorbrewer.RdBu[3].reverse(),
		colorScaleDomain: [-1, 0, 1], // [min, mid, max] values for color scale domain
		animationDuration: 1000, // transition duration (in ms) used for animations
		threshold: {neg: 0, pos: 0}, // threshold to ignore tooltips
		showRowHeaders: true,
		showColHeaders: true,
		labelFontFamily: "sans-serif", // font type of the top label
		labelFillColor: "#2E3436",     // font color of the header labels
		labelFontWeight: "normal",     // font weight of the header labels
		leftPanelPadding: 5,           // padding between left panel labels and heatmap
		topPanelPadding: 5,            // padding between top panel labels and heatmap
		/**
		 * Default data point tooltip function.
		 *
		 * @param selection target selection (assuming data rectangles)
		 */
		dataTooltipFn: function(selection) {
			var options = ViewUtil.defaultTooltipOptions();

			var display = {
				rowHeader: "Perturbation(u)",
				colHeader: "Protein(i)"
			};

			options.content = {
				text: function(event, api) {
					var model = {
						datum: d3.selectAll(this).datum(),
						display: display,
						tipTemplate: "#pert_heatmap_tip_template"
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

	// max label length for the left panel (calculated dynamically)
	var _leftPanelLabelLength = 0;

	// max label length for the top panel (calculated dynamically)
	var _topPanelLabelLength = 0;

	function init()
	{
		// selecting using jQuery node to support both string and jQuery selector values
		var node = $(_options.el)[0];
		var container = d3.select(node);

		var heatMapData = HeatMapDataUtil.processData(matrix);

		// create svg element & update its reference
		// (passing initial width and height as 0, cause those will be dynamically calculated
		// wrt variable length of the label panels)
		var svg = SvgUtil.createSvg(container, 0, 0);
		_svg = svg;
		var rowHeaderGroup;
		var colHeaderGroup;

		if (_options.showRowHeaders)
		{
			rowHeaderGroup = drawRowHeaders(svg, _options, matrix.rowHeaders);
		}

		if (_options.showColHeaders)
		{
			colHeaderGroup = drawColHeaders(svg, _options, matrix.columnHeaders);

			// adjust row header position wrt dynamically calculated col header length
			rowHeaderGroup.selectAll(".heatmap-row-header")
				.attr("y", function(d) {
					return parseFloat(d3.select(this).attr("y")) +
					       _topPanelLabelLength +
					       _options.padding.top +
					       _options.topPanelPadding;
				});
		}

		// adjust svg width & height after drawing headers
		svg.attr("width", calculateInitialWidth(_options, matrix.data));
		svg.attr("height", calculateInitialHeight(_options, matrix.data));

		drawHeatMap(svg, _options, heatMapData);

		// add default listeners
		addDefaultListeners();

		// add default tooltips
		addDefaultTooltips(_options);
	}

	function drawRowHeaders(svg, options, rowHeaders)
	{
		var rowHeaderIndex = HeatMapDataUtil.getIndexMap(rowHeaders);

		var rowHeaderGroup = svg.append("g").attr("class", "heatmap-row-headers-group");

		rowHeaderGroup.selectAll(".heatmap-row-headers")
			.data(rowHeaders)
			.enter().append("text")
			.text(function(d) {
				return d;
			})
			.style("font-family", options.labelFontFamily)
			.style("font-size", options.cellHeight + "px") // label font size depends on the cell height
			.style("font-weight", options.labelFontWeight)
			.attr("class", "heatmap-row-header")
			.attr("x", 0)// this is the initial value, will be adjusted later...
			.attr("y", function(d) { // this is not the final y value in case of column headers
				return rowHeaderIndex[d] * options.cellHeight +
				       options.cellHeight;
			})
			.attr("text-anchor", "end")
			.attr("fill", options.labelFillColor);

		// adjust actual x position
		// TODO if dynamic calculation fails use a constant value!!
		_leftPanelLabelLength = calculatePanelWidth(rowHeaderGroup, "heatmap-row-header");

		rowHeaderGroup.selectAll(".heatmap-row-header")
			.attr("x", _leftPanelLabelLength + options.padding.left);

		return rowHeaderGroup;
	}

	function drawColHeaders(svg, options, colHeaders)
	{
		var colHeaderIndex = HeatMapDataUtil.getIndexMap(colHeaders);
		var colHeaderGroup = svg.append("g").attr("class", "heatmap-col-headers-group");

		var x = function(d)
		{
			return colHeaderIndex[d] * options.cellWidth +
				options.cellWidth +
				options.leftPanelPadding +
				options.padding.left +
				_leftPanelLabelLength;
		};

		var y = function(d)
		{
			return _topPanelLabelLength + options.padding.top;
		};

		colHeaderGroup.selectAll(".heatmap-col-headers")
			.data(colHeaders)
			.enter().append("text")
			.text(function(d) {
				return d;
			})
			.style("font-family", options.labelFontFamily)
			.style("font-size", options.cellWidth + "px") // label font size depends on the cell height
			.style("font-weight", options.labelFontWeight)
			.attr("class", "heatmap-col-header")
			.attr("y", 0)// this is the initial value, will be adjusted later...
			.attr("x", function(d) {
				return x(d);
			})
			.attr("text-anchor", "start")
			.attr("fill", options.labelFillColor);

		// adjust actual x position
		// TODO if dynamic calculation fails use a constant value!!
		_topPanelLabelLength = calculatePanelWidth(colHeaderGroup, "heatmap-col-header");

		colHeaderGroup.selectAll(".heatmap-col-header")
			.attr("y", y());

		// rotate column headers to vertical position
		colHeaderGroup.selectAll(".heatmap-col-header")
			.transition()
			.attr("transform", function(d) {
				return "rotate(-90, " + x(d) + "," + y(d) + ")";
			});

		return colHeaderGroup;
	}

	function drawHeatMap(svg, options, data)
	{
		var colorScaleFn = colorScale(options);
		var dataGroup = svg.append("g").attr("class", "heatmap-data-group");

		dataGroup.selectAll(".heatmap")
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
				return d.col * options.cellWidth +
				       options.leftPanelPadding +
				       options.padding.left +
				       _leftPanelLabelLength;
			})
			.attr("y", function(d) {
				return d.row * options.cellHeight +
				       options.topPanelPadding +
				       options.padding.top +
				       _topPanelLabelLength;
			})
			.attr("width", options.cellWidth)
			.attr("height", options.cellHeight)
			.attr("fill", function(d) {
				return colorScaleFn(d.score);
			});

		return dataGroup;
	}

	function calculatePanelWidth(rowHeaderGroup, headerClass)
	{
		var max = 0;

		rowHeaderGroup.selectAll("." + headerClass).each(function(d, i){
			var width = this.getComputedTextLength();

			if (width > max)
			{
				max = width;
			}
		});

		// returning the ceiling int value for the sake of performance
		return Math.ceil(max);
	}

	function calculateInitialWidth(options, data)
	{
		var width = 0;

		// assuming that data.matrix is a 2D array
		if (data != null &&
			data.length > 0)
		{
			// length of a row is the number of columns + padding
			width = options.cellWidth * data[0].length +
			        options.leftPanelPadding +
			        options.padding.left +
			        options.padding.right +
			        _leftPanelLabelLength;
		}

		return width;
	}

	function calculateInitialHeight(options, data)
	{
		var height = 0;

		if (data != null)
		{
			// length of the matrix is the number of rows
			height = options.cellHeight * data.length +
			         options.topPanelPadding +
			         options.padding.top +
			         options.padding.bottom +
			         _topPanelLabelLength;
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
