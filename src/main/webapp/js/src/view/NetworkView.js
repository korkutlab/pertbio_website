var NetworkView = Backbone.View.extend({
	render: function()
	{
		var self = this;
		var container = $(self.el);

		var cyStyle = cytoscape.stylesheet()
	        .selector("node")
	        .css({
	            //"content": "data(" + self.model.nodeLabel +")",
				"content": "data(canonicalName)",
	            "width": 20,
	            "height": 20,
	            //"shape": "data(shape)",
	            "border-width": 2,
	            //"background-color": "mapData(altered, 0, 1, #DDDDDD, red)",
				"background-color": "#DDDDDD",
	            "border-color": "#555",
	            "font-size": "15"
	        })
	        .selector("edge")
	        .css({
	            //"width": "mapData(cited, 5, 50, 0.4, 0.5)",
				"width": 1.5,
	            "line-color": "#444",
				"target-arrow-shape": "triangle"
	        })
	        .selector("[?isdirected]")
	        .css({
	            "target-arrow-shape": "triangle"
	        })
	        .selector(":selected")
	        .css({
	            "background-color": "#000",
	            "line-color": "#000",
	            "source-arrow-color": "#000",
	            "target-arrow-color": "#000"
	        });

//		if (self.model.edgeColor == "edgesign")
//		{
//			captonVizStyle.selector("edge[edgesign=1]")
//				.css({
//					"line-color": "#FF0000"
//				})
//				.selector("edge[edgesign=-1]")
//				.css({
//					"line-color": "#0000FF"
//				});
//		}
//		else
//		{
//			captonVizStyle.selector("edge[inpc=0]")
//				.css({
//					"line-color": "#7F7F7F"
//				})
//				.selector("edge[inpc=1]")
//				.css({
//					"line-color": "#11FA34"
//				});
//		}

		container.empty();

		container.cytoscape({
			elements: self.model.data,
			style: cyStyle,
			layout: {
				name: "preset"
			},
			ready: function()
			{
				self.cy = this;
				window.cy = this;
			}
		});
	},
	updateEdgeStyle: function(edgeColor)
	{
		var self = this;
		var cy = self.cy;

		if (!cy)
		{
			return;
		}

		if (edgeColor == "edgesign")
		{
			cy.style().selector("edge[edgesign=1]")
				.css({
					"line-color": "#FF0000"
				})
				.selector("edge[edgesign=-1]")
				.css({
					"line-color": "#0000FF"
				})
				.update();
		}
		else
		{
			cy.style().selector("edge[inpc=0]")
				.css({
					"line-color": "#7F7F7F"
				})
				.selector("edge[inpc=1]")
				.css({
					"line-color": "#11FA34"
				})
				.update();
		}
	},
	updateNodeStyle: function(nodeLabel)
	{
		var self = this;
		var cy = self.cy;

		if (!cy)
		{
			return;
		}

		cy.style().selector("node")
			.css({"content": "data(" + nodeLabel +")"})
			.update();
	}

});

