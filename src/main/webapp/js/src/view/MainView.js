var MainView = Backbone.View.extend({
	render: function()
	{
		var self = this;

		var variables = {};

		// compile the template using underscore
		var template = _.template(
			$("#main_view_template").html(),
			variables);

		// load the compiled HTML into the Backbone "el"
		self.$el.html(template);

		self.format();
	},
	format: function()
	{
		var self = this;

		self.$el.find(".link-data-matrix").one("click", function(evt) {
			// initialize the tab on the first click
			self.initDataMatrixTab();
		});

		self.$el.find(".link-model").one("click", function(evt) {
			// initialize the tab on the first click
			self.initModelTab();
		});

		self.$el.find(".link-simulation").one("click", function(evt) {
			// initialize the tab on the first click
			self.initSimulationTab();
		});

		self.$el.find(".link-cross-validation").one("click", function(evt) {
			// initialize the tab on the first click
			// (add a small delay to allow some UI components initialize properly)
			setTimeout(function() {
				self.initCrossValidationTab();
			}, 200);
		});
	},
	initNetworkView: function()
	{
		// TODO where to display the network view?
		var networkData = new NetworkData({model: "average_bpmel_model_example"});

		networkData.fetch({
			type: "POST",
			data: {model: networkData.get("model")},
			success: function(collection, response, options)
			{
				var netViewOpts = {el: "#main_network_view",
					model: {data: response.elements}};

				var netView = new NetworkView(netViewOpts);
				//netView.render();
			},
			error: function(collection, response, options)
			{
				ViewUtil.displayErrorMessage(
					"Error retrieving network data.");
			}
		});
	},
	initSimulationTab: function()
	{
		var self = this;

		var simulationView = new SimulationView({
			el: self.$el.find("#tab-simulation"),
			model: {
				directory: "simulation"
			}
		});

		simulationView.render();
	},
	initCrossValidationTab: function()
	{
		var self = this;

		var crossValView = new CrossValidationView({
			el: self.$el.find("#tab-cross-validation"),
			model: {
				directory: "cross_validation"
			}
		});

		crossValView.render();
	},
	initModelTab: function()
	{
		var self = this;

		var modelView = new ModelView({
			el: self.$el.find("#tab-model"),
			model: {
				directory: "decimation_models|models1",
				nodeIndexFile: "decimation_models|node_index"
			}
		});

		modelView.render();
	},
	initDataMatrixTab: function()
	{
		var self = this;
		var matrixData = new MatrixData({name: "mel133_pert_proteomic_data_clustered"});

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
					rowHeader: true});

				// init HeatMap view
				var model = {
					matrix: matrix,
					heatMapOpts: {
						threshold: {neg: -0.05, pos: 0.05}
					},
					legendTitle: "Proteomic Level Change",
					legendOptions: {
						padding: {
							top: 0
						}
					}
				};

				var viewOpts = {el: self.$el.find("#tab-data-matrix"), model: model};
				var heatmapView = new HeatMapView(viewOpts);
				heatmapView.render();
			},
			error: function(collection, response, options)
			{
				ViewUtil.displayErrorMessage(
					"Error retrieving matrix data.");
			}
		});
	}
});
