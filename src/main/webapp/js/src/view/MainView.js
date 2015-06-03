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

		// fix for fixed nav-bar to prevent overlapping the content
		self.adjustNavBar();
		$(window).resize(function () {
			self.adjustNavBar();
		});

		// load static content as well

		self.$el.find("#tab-home-page").html(
			_.template($("#home_page_template").html(), {}));
		self.$el.find("#tab-model-method").html(
			_.template($("#network_modelling_template").html(), {}));
		self.$el.find("#tab-prediction-background").html(
			_.template($("#prediction_bg_template").html(), {}));
		self.$el.find("#tab-download").html(
			_.template($("#download_template").html(), {}));
		self.$el.find("#tab-about").html(
			_.template($("#about_template").html(), {}));

		self.format();
	},
	adjustNavBar: function()
	{
		var self = this;
		var navBar = self.$el.find(".peralyzer-navbar");

		$('body').css('padding-top', parseInt(navBar.css("height")));
	},
	format: function()
	{
		var self = this;

		self.$el.find(".link-data-matrix").one("click", function(evt) {
			// initialize the tab on the first click
			self.initDataMatrixTab();
		});

		self.$el.find(".link-exec-model").one("click", function(evt) {
			// initialize the tab on the first click
			self.initModelTab();
		});

		self.$el.find(".link-ave-model").one("click", function(evt) {
			// initialize the tab on the first click
			self.initNetworkView();
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

		self.$el.find(".navbar-brand").click(function(evt) {
			evt.preventDefault();
			self.$el.find(".link-home-page").click();
		})
	},
	initNetworkView: function()
	{
		var self = this;
		var networkData = new NetworkData({model: "average_bpmel_model_example"});

		networkData.fetch({
			type: "POST",
			data: {model: networkData.get("model")},
			success: function(collection, response, options)
			{
				var netViewOpts = {el: self.$el.find("#tab-ave-model"),
					model: {data: response.elements}};

				var netView = new NetworkView(netViewOpts);
				netView.render();
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
			el: self.$el.find("#tab-exec-model"),
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
