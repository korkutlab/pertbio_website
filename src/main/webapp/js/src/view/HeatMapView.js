var HeatMapView = Backbone.View.extend({
	render: function()
	{
		var self = this;
		var matrix = self.model.matrix;

		var heatmap = new HeatMap({el: self.el},
			matrix.data);

		heatmap.init();
	}
});
