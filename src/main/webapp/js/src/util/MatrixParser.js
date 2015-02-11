/**
 * Singleton utility class for parsing text files and
 * generating matrix data.
 *
 * @author Selcuk Onur Sumer
 */
var MatrixParser = (function()
{
	// default parse options
	var _defaultOpts = {
		input: null, //input string/file
		columnHeader: false, // whether the input contains column headers (the first row)
		rowHeader: false, // whether the input contains row headers (the first column)
		trimData: true // trim the trailing zero rows
	};

	/**
	 * Parses the entire input data and creates a 2D array of matrix data.
	 *
	 * @param options       options object (see _defaultOpts).
	 * @returns {Object}    an object representing the matrix data.
	 */
	function parseInput(options)
	{
		// merge options with default options to use defaults for missing values
		//options = jQuery.extend(true, {}, _defaultOpts, options);
		options = _.extend({}, _defaultOpts, options);

		var input = options.input;

		var matrixData = [];

		var rowHeaders = [];
		var columnHeaders = [];

		var indexMap = null;
		// starting index for column data
		var colStart = options.rowHeader == true ? 1 :0;
		// starting index for row data
		var rowStart = options.columnHeader == true ? 1 :0;

		var lines = input.split("\n");

		if (lines.length > 0)
		{
			if (options.columnHeader)
			{
				// assuming first line is a header
				indexMap = buildIndexMap(lines[0]);

				// split by whitespace and then get all headers
				// (except the first one if there are row headers)
				columnHeaders = lines[0].trim().split(/\s+/).slice(colStart);
			}

			// rest should be data
			for (var i=rowStart; i < lines.length; i++)
			{
				// skip empty lines
				if (lines[i].length > 0)
				{
					var parts = lines[i].trim().split(/\s+/);

					if (parts.length > 1)
					{
						// first element is the row header
						if (options.rowHeader)
						{
							rowHeaders.push(parts[0]);
						}

						// rest is matrix data
						matrixData.push(parts.slice(colStart));
					}
				}
			}
		}

		if (options.trimData)
		{
			matrixData = trimData(matrixData);
			rowHeaders = rowHeaders.slice(0, matrixData.length);
		}

		return {
			data: matrixData,
			columnHeaders: columnHeaders,
			rowHeaders: rowHeaders
		};
	}

	function trimData(data)
	{
		var lastZeroIdx = -1;
		var lastNonZeroIdx = -1;
		var trimmedData = data;

		for (var i=0; i < data.length; i++)
		{
			var reduced = _.uniq(data[i]);

			if (reduced.length === 1 && reduced[0] == 0)
			{
				if (lastZeroIdx <= lastNonZeroIdx)
				{
					lastZeroIdx = i;
				}
			}
			else
			{
				lastNonZeroIdx = i;
			}
		}

		if (lastZeroIdx > lastNonZeroIdx)
		{
			trimmedData = data.slice(0, lastZeroIdx);
		}

		return trimmedData;
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
