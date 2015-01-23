var HeatMapDataUtil = (function()
{
	/**
	 * Converts a 2D numerical data array into a 1D array of objects.
	 *
	 * @param data  2D array of numerical data
	 */
	function processData(data)
	{
		var heatMapData = [];

		for (var i=0; i < data.length; i++)
		{
			for (var j=0; j < data[i].length; j++)
			{
				heatMapData.push({
					score: data[i][j],
					row: i,
					col: j
				});
			}
		}

		return heatMapData;
	}

	return {
		processData: processData
	};
})();
