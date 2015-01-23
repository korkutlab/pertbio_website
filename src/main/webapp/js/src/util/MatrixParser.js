/**
 * Singleton utility class for parsing text files and
 * generating matrix data.
 *
 * @author Selcuk Onur Sumer
 */
var MatrixParser = (function()
{
	/**
	 * Parses the entire input data and creates a 2D array of matrix data.
	 *
	 * @param input         input string/file.
	 * @returns {Object}    an object representing the matrix data.
	 */
	function parseInput(input)
	{
		var matrixData = [];
		var rowHeaders = [];
		var columnHeaders;

		var lines = input.split("\n");

		if (lines.length > 0)
		{
			// assuming first line is a header
			var indexMap = buildIndexMap(lines[0]);

			// split by whitespace and then get all but the first element,
			// (first element is the header of the column headers)
			columnHeaders = lines[0].trim().split(/\s/).slice(1);

			// rest should be data
			for (var i=1; i < lines.length; i++)
			{
				// skip empty lines
				if (lines[i].length > 0)
				{
					var parts = lines[i].trim().split(/\s/);

					if (parts.length > 1)
					{
						// first element is the row heaher
						rowHeaders.push(parts[0]);

						// rest is matrix data
						matrixData.push(parts.slice(1));
					}
				}
			}
		}

		return {
			data: matrixData,
			columnHeaders: columnHeaders,
			rowHeaders: rowHeaders
		};
	}

	/**
	 * Builds a map of <header name, index> pairs, to use header names
	 * instead of index constants.
	 *
	 * @param header    header line (first line) of the input
	 * @returns {Object} map of <header name, index> pairs
	 */
	function buildIndexMap(header)
	{
		var columns = header.split("\t");
		var map = {};

		_.each(columns, function(column, index) {
			map[column.toLowerCase()] = index;
		});

		return map;
	}

	return {
		parseInput: parseInput
	}

})();
