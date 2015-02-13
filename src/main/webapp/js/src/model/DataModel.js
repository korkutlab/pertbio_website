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

var HistogramData = Backbone.Model.extend({
	initialize: function(attributes)
	{
		this.histogramData = attributes;
	},
	url: function()
	{
		return "data/histogram/" + this.get("name");
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

var MatrixList = Backbone.Model.extend({
    initialize: function(attributes)
	{
		this.list = attributes;
	},
	url: function()
	{
		return "data/list/matrix/" + this.get("directory");
    }
});
