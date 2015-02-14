var SimulationView = Backbone.View.extend({
	render: function()
	{
		var self = this;
		var names = new MatrixList({directory: self.model.directory});

		names.fetch({
			success: function(collection, response, options)
			{
				var simulationOptions = [];
				var simulationList = response.sort();

				_.each(simulationList, function(name) {
					var templateFn = _.template($("#select_item_template").html());
					simulationOptions.push(templateFn({selectId: name, selectName: name}));
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

		simulationBox.change(function(evt) {
			var target = self.$el.find(".simulation-view");

			// display loader message before actually loading the data
			// it will be replaced once data is fetched
			$(target).html(_.template(
				$("#loader_template").html(), {}));

			var name = simulationBox.val();
			self.loadSimulation(target, name);
		});

		simulationBox.chosen({
			search_contains: true
		});

		// trigger change function to load initial data...
		simulationBox.change();
	},
	loadSimulation: function(target, simName)
	{
		var self = this;
		var baseDir = self.model.directory;

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
		var drawHistogram = function(node1, node2, strength1, strength2, type)
		{
			var histogramData = new HistogramData({
				name: histogramFile(node1, node2, strength1, strength2)});

			histogramData.fetch({
				success: function(collection, response, options)
				{
					// remove previous content
					target.find(".simulation-histogram").empty();

					// draw the actual histogram (bar chart)
					var barChart = new BarChart({el: target.find(".simulation-histogram")},
						response[type].binSummary);

					barChart.init();
				},
				error: function(collection, response, options)
				{
					ViewUtil.displayErrorMessage(
						"Error retrieving histogram data.");
				}
			});
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

				var variables = {
					rowNodeSelectOptions: rowOpts.nodeSelectOptions,
					rowStrengthSelectOptions: rowOpts.strengthSelectOptions,
					colNodeSelectOptions: colOpts.nodeSelectOptions,
					colStrengthSelectOptions: colOpts.strengthSelectOptions
				};

				var templateFn = _.template($("#simulation_view_template").html());

				$(target).html(templateFn(variables));

				$(target).find(".select-box").chosen({
					search_contains: true
				});

				$(target).find(".simulate-button").click(function(evt) {
					var node1 = $(target).find(".row-node-box").val();
					var strength1 = $(target).find(".row-strength-box").val();
					var node2 = $(target).find(".col-node-box").val();
					var strength2 = $(target).find(".col-strength-box").val();

					var rowIdx = rowIdxMap[node1 + "_" + strength1];
					var colIdx = colIdxMap[node2 + "_" + strength2];

					if (node1 === node2)
					{
						colIdx = rowIdx;
					}

					// fetch the actual value from the average data matrix & visualize...
					$(target).find(".simulation-average").html("Average: " +
						matrix.data[rowIdx][colIdx]);

					var type = (simName.split("_"))[1]; // g1arrest, sarrest, etc.

					drawHistogram(node1, node2, strength1, strength2, type);
				});

			},
			error: function(collection, response, options)
			{
				ViewUtil.displayErrorMessage(
					"Error retrieving simulation data.");
			}
		});
	}
});
