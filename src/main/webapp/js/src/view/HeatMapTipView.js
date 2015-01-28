/**
 * Tooltip view for the heatmap rectangles (data points).
 *
 * options: {el: [target container],
 *           model: {value: [data point value]}
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var HeatMapTipView = Backbone.View.extend({
	render: function()
	{
		// compile the template
		var template = this.compileTemplate();

		// load the compiled HTML into the Backbone "el"
		this.$el.html(template);
		this.format();
	},
	format: function()
	{
		// implement if necessary...
	},
	compileTemplate: function()
	{
		// pass variables in using Underscore.js template
		var variables = {
			datum: this.model.datum,
			display: this.model.display
		};

		// compile the template using underscore
		var templateFn = _.template($("#heatmap_tip_template").html());
		return templateFn(variables);
	}
});
