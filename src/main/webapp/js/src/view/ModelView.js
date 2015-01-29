var ModelView = Backbone.View.extend({
	render: function()
	{
		var self = this;

		// TODO self.model.directory
		var names = new MatrixList({directory: self.model.directory});

		names.fetch({
			success: function(collection, response, options)
			{
				var modelOptions = [];
				var modelList = response.sort(function(a, b) {
					if (a > b)
					{
						return 1;
					}
					else
					{
						return -1;
					}
				});

				_.each(modelList, function(name) {
					var templateFn = _.template($("#select_item_template").html());
					modelOptions.push(templateFn({selectId: name, selectName: name}));
				});

				var variables = {modelOptions: modelOptions.join("")};

				// compile the template using underscore
				var templateFn = _.template($("#model_visualizer_template").html());

				// load the compiled HTML into the Backbone "el"
				self.$el.html(templateFn(variables));

				self.format();
			}
		});
	},
	format: function()
	{
		var self = this;
		// TODO format selection box (with chosen?)

		var modelBox = self.$el.find(".model-box");

		modelBox.change(function(evt) {
			var modelName = modelBox.val();
			self.loadModel(self.$el.find(".heatmap-container"), modelName)
		});
	},
	loadModel: function(target, modelName)
	{
		var self = this;
		// TODO loader image...

		var baseDir = self.model.directory;

		var nodeIndexData = new MatrixData({name: self.model.nodeIndexFile});

		nodeIndexData.fetch({
			type: "POST",
			dataType: "text",
			data: {name: nodeIndexData.get("name")},
			success: function(collection, response, options)
			{
				var indexMatrix = MatrixParser.parseInput({
					input: response,
					rowHeader: true,
					columnHeader: false
				});

				var matrixData = new MatrixData({name: baseDir + "|" + modelName});

				// fetches matrix data from server
				matrixData.fetch({
					type: "POST",
					dataType: "text",
					data: {name: matrixData.get("name")},
					success: function(collection, response, options)
					{
						var matrix = MatrixParser.parseInput({
							input: response,
							columnHeader: false,
							rowHeader: false});

						matrix.columnHeaders = indexMatrix.rowHeaders;
						matrix.rowHeaders = indexMatrix.rowHeaders;

						// init HeatMap view
						var model = {
							matrix: matrix,
							heatMapOpts: {
								colorScaleRange: ["#0000FF", "#FDFDFD", "#FDFDFD", "#FDFDFD", "#FF0000"],
								colorScaleDomain: [-1, -0.21, 0, 0.21, 1],
								threshold: {neg: -0.21, pos: 0.21}
							}
						};

						var viewOpts = {
							el: target,
							model: model
						};

						var heatmapView = new HeatMapView(viewOpts);
						heatmapView.render();
					},
					error: function(collection, response, options)
					{
						ViewUtil.displayErrorMessage(
							"Error retrieving matrix data.");
					}
				});
			},
			error: function(collection, response, options)
			{
				ViewUtil.displayErrorMessage(
					"Error retrieving node index data.");
			}
		});
	}
});

