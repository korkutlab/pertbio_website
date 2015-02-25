var CrossValidationView = Backbone.View.extend({
	render: function()
	{
		var self = this;
		self.currentBarChart = null;

		// TODO read map from a file if possible
		self.readoutMapping = {
			"4EBP1pS65": 1,
			"RbpS807": 2,
			"MAPKpT202": 3,
			"MEKpS217": 4,
			"S6": 5,
			"PAI-1": 6,
			"AKTpS473": 7,
			"AMPKpT172": 8,
			"beta-Catenin": 9,
			"BIM": 10,
			"Caveolin": 11,
			"CyclinB1": 12,
			"CyclinD1": 13,
			"GSK3-alpha-betapS21": 14,
			"GSKpS9": 15,
			"IGFBP2": 16,
			"p38pT180": 17,
			"p53": 18,
			"p70S6KpT389": 19,
			"SRCpY527": 20,
			"STAT3pY705": 21,
			"TSC2pT1462": 22,
			"YAPpS127": 23,
			"ACC1": 24,
			"AKTpT308": 25,
			"AKT": 26,
			"beta-CateninpS33": 27,
			"Fibronectin": 28,
			"HSP27": 29,
			"IGF1R-beta": 30,
			"IRS1": 31,
			"p27/Kip1": 32,
			"c-Myc": 33,
			"SMAD3": 34,
			"STAT3": 35,
			"STAT5": 36,
			"STAT5pY694": 37,
			"COX2": 38,
			"PAX2": 39,
			"PLK1": 40,
			"YBIpS102": 41,
			"CHK2pT68": 42,
			"S6pS235": 43,
			"S6pS240": 44,
			"4EBP1pT37": 45,
			"Caspase9": 46,
			"alpha-tubulin": 47,
			"ATMpS1981": 48,
			"ATR": 49,
			"BAK": 50,
			"BCL-XL": 51,
			"BCL2": 52,
			"BRAF": 53,
			"c-JUNpS73": 54,
			"Casp9cAsp31": 55,
			"CHK1pS345": 56,
			"cRAF": 57,
			"EGFR": 58,
			"ELK1pS383": 59,
			"ER-alpha": 60,
			"GATA3": 61,
			"GSK3-alpha-beta": 62,
			"mTORpS2448": 63,
			"p21/CIP1": 64,
			"STAT6pY641": 65,
			"TAZpS89": 66,
			"XRCC1": 67,
			"PCNA": 68,
			"PDK1pS241": 69,
			"PI3Kp85": 70,
			"PKC-alpha": 71,
			"RAD51": 72,
			"SRCpY416": 73,
			"4EBP1pT70": 74,
			"ACCpS79": 75,
			"Collagenase": 76,
			"CyclinE1": 77,
			"IRS1pS307": 78,
			"p38/MAPK14": 79,
			"SMAD3pS423": 80,
			"TSC2": 81,
			"SRC": 82,
			"G2M": 84,
			"G1arrest": 85,
			"G2arrest": 86,
			"Sarrest": 87,
			"cell_viability": 88
//			"aMEK": 89,
//			"aAKT": 90,
//			"aHDAC": 91,
//			"aMDM2": 92,
//			"aJAK": 93,
//			"aBRAF(V600E)": 94,
//			"aPKC": 95,
//			"aSTAT3": 96,
//			"amTOR": 97,
//			"aPI3K": 98,
//			"aCDK4": 99,
//			"aSRC": 100
		};

		var simulationOptions = [];
		var simulationList = _.keys(self.readoutMapping).sort();

		_.each(simulationList, function(name) {
			var templateFn = _.template($("#select_item_template").html());
			simulationOptions.push(templateFn({
				selectId: name,
				//TODO selectName: self.readoutMapping[name].display
				selectName: name
			}));
		});

		var variables = {selectOptions: simulationOptions.join("")};

		// compile the template using underscore
		var templateFn = _.template($("#cross_validation_visualizer_template").html());

		// load the compiled HTML into the Backbone "el"
		self.$el.html(templateFn(variables));

		self.format();
	},
	format: function()
	{
		var self = this;
		var simulationBox = self.$el.find(".cross-validation-box");

		var target = self.$el.find(".simulation-view");

		simulationBox.change(function(evt) {
			// preserve prev selection if possible
			var prevSelection = {
				node1: $(target).find(".row-node-box").val(),
				node2: $(target).find(".col-node-box").val()
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
	initHistogram: function(histogramData, target)
	{
		var self = this;
		var histogramEl = target.find(".simulation-histogram");

		// remove previous content
		histogramEl.empty();

		// draw the actual histogram (bar chart & line charts)
		var barChart = new BarChart({el: histogramEl,
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

		// extracts select options for the given headers
		var extractOptions = function(headers)
		{
			var nodeSelectOptions = [];

			_.each(headers, function(name) {
				var templateFn = _.template($("#select_item_template").html());

				nodeSelectOptions.push(
					templateFn({selectId: name, selectName: name}));
			});

			nodeSelectOptions = _.uniq(nodeSelectOptions).sort().join("");

			return {
				nodeSelectOptions: nodeSelectOptions
			};
		};

		// generates the name of the target histogram data file
		var histogramFile = function(node1, node2)
		{
			var strBuilder = ["predict"];

			// ignore node2 selection if they are the same
			if (node1 === node2)
			{
				strBuilder.push(node1);
			}
			else
			{
				strBuilder.push(node1);
				strBuilder.push(node2);
			}

			return strBuilder.join("_");
		};

		// draws the actual histogram (bar chart)
		var drawHistogram = function(node1, node2, type)
		{
			var histogramData = new HistogramData({
				name: histogramFile(node1, node2)});

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
					self.initHistogram(data, target);
				},
				error: histDataErrorFn
			});

			histogramEl.html(_.template($("#loader_template").html(), {}));
		};

		// TODO get column and row headers from an actual matrix file!
		var matrix = {
			rowHeaders: [
			    "aBRAFm",
				"aCDK",
				"aHDAC",
				"aJAK",
				"aMDM2",
				"aMEK12",
				"amTOR",
				"aPI3K",
				"aPKC",
				"aSRC",
				"aSTAT3"
			],
			columnHeaders: [
				"aAKT"
			]
		};

		var colIdxMap = HeatMapDataUtil.getIndexMap(matrix.columnHeaders);
		var rowIdxMap = HeatMapDataUtil.getIndexMap(matrix.rowHeaders);

		var rowOpts = extractOptions(matrix.rowHeaders);
		var colOpts = extractOptions(matrix.columnHeaders);

		var variables = {
			rowNodeSelectOptions: rowOpts.nodeSelectOptions,
			colNodeSelectOptions: colOpts.nodeSelectOptions
		};

		var templateFn = _.template($("#cross_validation_view_template").html());

		$(target).html(templateFn(variables));

		// if all values are the same (empty or null),
		// then assuming there is no prev selection yet...
		if (_.uniq(_.values(prevSelection)).length > 1)
		{
			$(target).find(".row-node-box").val(prevSelection.node1);
			$(target).find(".col-node-box").val(prevSelection.node2);
		}

		$(target).find(".select-box").chosen({
			search_contains: true
		});

		var submitButton = $(target).find(".simulate-button");

		submitButton.click(function(evt) {
			var node1 = $(target).find(".row-node-box").val();
			var node2 = $(target).find(".col-node-box").val();

			var rowIdx = rowIdxMap[node1];
			var colIdx = colIdxMap[node2];

			if (node1 === node2)
			{
				colIdx = rowIdx;
			}

			// fetch the actual value from the average data matrix & visualize...
//			$(target).find(".simulation-summary").html("Average: " +
//				matrix.data[rowIdx][colIdx]);

			var type = simName; // g1arrest, sarrest, etc.

			drawHistogram(node1, node2, type);
		});

		// draw the histogram initially
		submitButton.click();
	}
});

