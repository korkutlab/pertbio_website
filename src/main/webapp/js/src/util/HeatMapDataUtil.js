var HeatMapDataUtil = (function()
{
	/**
	 * Converts a matrix object into a 1D array of objects.
	 *
	 * @param matrix    object (data: 2D-array, rowHeaders: array, columnHeaders: array)
	 */
	function processData(matrix)
	{
		var heatMapData = [];
		var data = matrix.data; // 2D array of numerical data

		for (var i=0; i < data.length; i++)
		{
			for (var j=0; j < data[i].length; j++)
			{
				var dataPoint = {
					score: data[i][j],
					row: i,
					col: j
				};

				if (matrix.rowHeaders.length > 0)
				{
					dataPoint.rowHeader = matrix.rowHeaders[i];
				}

				if (matrix.columnHeaders.length > 0)
				{
					dataPoint.colHeader = matrix.columnHeaders[j];
				}

				heatMapData.push(dataPoint);
			}
		}

		return heatMapData;
	}

	/**
	 * Creates an index map for the given array of values.
	 *
	 * @param data          data array
	 * @returns {Object}    index map keyed by values
	 */
	function getIndexMap(data)
	{
		var map = {};

		_.each(data, function(ele, idx) {
			map[ele] = idx;
		});

		return map;
	}

	return {
		processData: processData,
		getIndexMap: getIndexMap
	};
})();
