var MatrixData = Backbone.Model.extend({
	initialize: function(attributes)
	{
		this.matrix = attributes.matrix;
	},
	url: function()
	{
		return "data/matrix/" + this.get("name");
    }
});

var NetworkData = Backbone.Model.extend({
	initialize: function(attributes)
	{
		this.network = attributes.network;
	},
	url: function()
	{
		return "data/network/" + this.get("model");
    }
});
