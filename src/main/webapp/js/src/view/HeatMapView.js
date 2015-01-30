var HeatMapView = Backbone.View.extend({
	render: function()
	{
		var self = this;
		var matrix = self.model.matrix;

		// compile the template using underscore
		var templateFn = _.template($("#heatmap_view_template").html());

		// load the compiled HTML into the Backbone "el"
		self.$el.html(templateFn({}));

		var options = self.model.heatMapOpts || {};
		options.el = self.$el.find(".heatmap-container");

		// render the new heat map
		var heatmap = new HeatMap(options, matrix);
		heatmap.init();

		options = self.model.legendOptions || {};
		options.el = self.$el.find(".legend-container");

		var legend = new GradientLegend(options);
		legend.init();
	}
});
