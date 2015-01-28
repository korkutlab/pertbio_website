var HeatMapView = Backbone.View.extend({
	render: function()
	{
		var self = this;
		var matrix = self.model.matrix;
		var options = self.model.heatMapOpts || {};
		options.el = self.el;

		var heatmap = new HeatMap(options,
			matrix);

		heatmap.init();
	}
});
