var SimulationView = Backbone.View.extend({
	render: function()
	{
		var self = this;
		var names = new MatrixList({directory: self.model.directory});
		self.currentBarChart = null;

		self.phenotypeMapping = {
			"cellviability": "cell viability",
			"g1arrest": "g1 arrest",
			"g2arrest": "g2 arrest",
			"g2m": "g2m",
			"sarrest": "s arrest"
		};

		names.fetch({
			success: function(collection, response, options)
			{
				var simulationOptions = [];
				var simulationList = response.sort();

				_.each(simulationList, function(name) {
					var templateFn = _.template($("#select_item_template").html());
					simulationOptions.push(templateFn(
						{selectId: name, selectName: self.phenotypeMapping[name]}));
				});

				var variables = {selectOptions: simulationOptions.join("")};

				// compile the template using underscore
				var templateFn = _.template($("#simulation_visualizer_template").html());

				// load the compiled HTML into the Backbone "el"
				self.$el.html(templateFn(variables));

				self.format();
			}
		});
	},
	format: function()
	{
		var self = this;
		var simulationBox = self.$el.find(".simulation-box");

		var node1LineBox = self.$el.find(".node1-line-checkbox");
		var node2LineBox = self.$el.find(".node2-line-checkbox");

		var target = self.$el.find(".simulation-view");

		var switchOpts = {
			size: "mini",
			onSwitchChange: function (event, state) {
				if (self.currentBarChart != null)
				{
					self.initHistogram(self.currentBarChart.getData(),
					                   target,
					                   node1LineBox.is(":checked"),
					                   node2LineBox.is(":checked"));
				}
			}
		};
		node1LineBox.bootstrapSwitch(switchOpts);
		node2LineBox.bootstrapSwitch(switchOpts);

		simulationBox.change(function(evt) {
			// preserve prev selection if possible
			var prevSelection = {
				node1: $(target).find(".row-node-box").val(),
				strength1: $(target).find(".row-strength-box").val(),
				node2: $(target).find(".col-node-box").val(),
				strength2: $(target).find(".col-strength-box").val()
			};

			// display loader message before actually loading the data
			// it will be replaced once data is fetched
			$(target).html(_.template(
				$("#loader_template").html(), {}));

			var name = simulationBox.val();
			self.loadSimulation(target, name, prevSelection);
		});

		simulationBox.chosen({
			search_contains: true
		});

		// trigger change function to load initial data...
		simulationBox.change();
	},
	initHistogram: function(histogramData, target, line1, line2)
	{
		var self = this;
		var histogramEl = target.find(".simulation-histogram");

		// remove previous content
		histogramEl.empty();

		// draw the actual histogram (bar chart & line charts)
		var barChart = new BarChart({el: histogramEl,
				drawLine: [line1, line2],
				yAxisLabel: "# of Models",
				xAxisLabel: "Predicted Response: log(perturbed / non-perturbed)"},
			histogramData);

		barChart.init();
		self.currentBarChart = barChart;
	},
	loadSimulation: function(target, simName, prevSelection)
	{
		var self = this;
		var baseDir = self.model.directory;
		var initialSelection = null;

		// strength to numerical value mapping
		var strengthMapping = {
			"IC20": 1,
			"IC40": 2,
			"IC60": 3,
			"IC80": 4
		};

		var matrixData = new MatrixData({name: baseDir + "|" + simName});

		// extracts select options for the given headers
		var extractOptions = function(headers)
		{
			var nodeSelectOptions = [];
			var strengthSelectOptions = [];

			_.each(headers, function(name) {
				var templateFn = _.template($("#select_item_template").html());
				var parts = name.split("_");

				nodeSelectOptions.push(
					templateFn({selectId: parts[0], selectName: parts[0]}));

				strengthSelectOptions.push(
					templateFn({selectId: parts[1], selectName: parts[1]}));
			});

			nodeSelectOptions = _.uniq(nodeSelectOptions).sort().join("");
			strengthSelectOptions = _.uniq(strengthSelectOptions).sort().join("");

			return {
				nodeSelectOptions: nodeSelectOptions,
				strengthSelectOptions: strengthSelectOptions
			};
		};

		// generates the name of the target histogram data file
		var histogramFile = function(node1, node2, strength1, strength2)
		{
			var strBuilder = ["predict"];

			// ignore node2 selection if they are the same
			if (node1 === node2)
			{
				strBuilder.push(node1);
				strBuilder.push(strengthMapping[strength1]);
			}
			else
			{
				strBuilder.push(node1);
				strBuilder.push(node2);
				strBuilder.push(strengthMapping[strength1]);
				strBuilder.push(strengthMapping[strength2]);
			}

			return strBuilder.join("_");
		};

		// draws the actual histogram (bar chart)
		var drawHistogram = function(node1, node2, strength1, strength2, type, line1, line2)
		{
			var histogramData = new HistogramData({
				name: histogramFile(node1, node2, strength1, strength2)});

			var histogramEl = target.find(".simulation-histogram");

			var histDataErrorFn = function(collection, response, options)
			{
				histogramEl.empty();

				ViewUtil.displayErrorMessage(
					"Error retrieving histogram data.");
			};

			histogramData.fetch({
				success: function(collection, response, options)
				{
					var data = {barChartData: response[type].binSummary};
					var mean =  response[type].mean;
					var stdDev = response[type].stdDev;

					var summaryViewVars = {
						mean: mean.toFixed(5),
						stdDev: stdDev.toFixed(5)
					};

					var templateFn = _.template($("#simulation_summary_template").html());
					$(target).find(".simulation-summary").html(templateFn(summaryViewVars));

					// also fetch separate node1 and node2 data for additional
					// overlay lines on the bar chart

					var node1data = new HistogramData({
						name: histogramFile(node1, node1, strength1, strength1)});

					node1data.fetch({
						success: function(collection, response, options)
						{
							data.lineChartData = [];
							data.lineChartData.push(response[type].binSummary);

							if (node1 !== node2)
							{
								var node2data = new HistogramData({
									name: histogramFile(node2, node2, strength2, strength2)});

								node2data.fetch({
									success: function(collection, response, options)
									{
										data.lineChartData.push(response[type].binSummary);
										self.initHistogram(data, target, line1, line2);
								    },
									error: histDataErrorFn
								});
							}
							else
							{
								self.initHistogram(data, target, line1, line2);
							}
					    },
						error: histDataErrorFn
					});
				},
				error: histDataErrorFn
			});

			histogramEl.html(_.template($("#loader_template").html(), {}));
		};

		// fetches matrix data from server
		matrixData.fetch({
			type: "POST",
			dataType: "text",
			data: {name: matrixData.get("name")},
			success: function(collection, response, options)
			{
				var matrix = MatrixParser.parseInput({
					input: response,
					columnHeader: true,
					rowHeader: true
				});

				var colIdxMap = HeatMapDataUtil.getIndexMap(matrix.columnHeaders);
				var rowIdxMap = HeatMapDataUtil.getIndexMap(matrix.rowHeaders);

				var rowOpts = extractOptions(matrix.rowHeaders);
				var colOpts = extractOptions(matrix.columnHeaders);

				// set default (initial) selection values
				if (_.contains(matrix.rowHeaders, "aMEK_IC60") &&
				    _.contains(matrix.columnHeaders, "c-Myc_IC60"))
				{
					initialSelection = {
						node1: "aMEK",
						node2: "c-Myc",
						strength1: "IC60",
						strength2: "IC60"
					};
				}

				var variables = {
					rowNodeSelectOptions: rowOpts.nodeSelectOptions,
					rowStrengthSelectOptions: rowOpts.strengthSelectOptions,
					colNodeSelectOptions: colOpts.nodeSelectOptions,
					colStrengthSelectOptions: colOpts.strengthSelectOptions
				};

				var templateFn = _.template($("#simulation_view_template").html());

				$(target).html(templateFn(variables));

				// if all values are the same (empty or null),
				// then assuming there is no prev selection yet...
				if (_.uniq(_.values(prevSelection)).length > 1)
				{
					$(target).find(".row-node-box").val(prevSelection.node1);
					$(target).find(".row-strength-box").val(prevSelection.strength1);
					$(target).find(".col-node-box").val(prevSelection.node2);
					$(target).find(".col-strength-box").val(prevSelection.strength2);
				}
				else if (initialSelection != null)
				{
					$(target).find(".row-node-box").val(initialSelection.node1);
					$(target).find(".row-strength-box").val(initialSelection.strength1);
					$(target).find(".col-node-box").val(initialSelection.node2);
					$(target).find(".col-strength-box").val(initialSelection.strength2);
				}

				$(target).find(".select-box").chosen({
					search_contains: true
				});

				var submitButton = $(target).find(".simulate-button");

				submitButton.click(function(evt) {
					var node1 = $(target).find(".row-node-box").val();
					var strength1 = $(target).find(".row-strength-box").val();
					var node2 = $(target).find(".col-node-box").val();
					var strength2 = $(target).find(".col-strength-box").val();
					var line1 = self.$el.find(".node1-line-checkbox").is(":checked");
					var line2 = self.$el.find(".node2-line-checkbox").is(":checked");

					var rowIdx = rowIdxMap[node1 + "_" + strength1];
					var colIdx = colIdxMap[node2 + "_" + strength2];

					if (node1 === node2)
					{
						colIdx = rowIdx;
					}

					// fetch the actual value from the average data matrix & visualize...
//					$(target).find(".simulation-summary").html("Average: " +
//						matrix.data[rowIdx][colIdx]);
//					console.log("average response: " + (matrix.data[rowIdx][colIdx] * 1.3));

					var type = simName; // g1arrest, sarrest, etc.

					drawHistogram(node1, node2, strength1, strength2, type, line1, line2);
				});

				// draw the histogram initially
				submitButton.click();
			},
			error: function(collection, response, options)
			{
				ViewUtil.displayErrorMessage(
					"Error retrieving simulation data.");
			}
		});
	}
});
