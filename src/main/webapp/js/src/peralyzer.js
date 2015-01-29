// This is for the moustache-like templates
// prevents collisions with JSP tags
_.templateSettings = {
	interpolate : /\{\{(.+?)\}\}/g
};

$(document).ready(function() {
	//var mainView = new MainView({el: "#main_container"});
	//mainView.render();

	// TODO this is test code, get actual input from the user...

	var networkData = new NetworkData({model: "average_bpmel_model_example"});

	networkData.fetch({
		type: "POST",
		data: {model: networkData.get("model")},
		success: function(collection, response, options)
		{
			var netViewOpts = {el: "#main_network_view",
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

	var matrixData = new MatrixData({name: "skmel133_proteomic_clustered_data"});

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
				}
			};

			var viewOpts = {el: "#heatmap1", model: model};
			var heatmapView = new HeatMapView(viewOpts);
			heatmapView.render();
		},
		error: function(collection, response, options)
		{
			ViewUtil.displayErrorMessage(
				"Error retrieving matrix data.");
		}
	});

	var modelView = new ModelView({
		el: "#model_view",
		model: {
			directory: "decimation_models|models1",
			nodeIndexFile: "decimation_models|node_index"
		}
	});

	modelView.render();
});
