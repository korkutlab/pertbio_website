/**
 * Node script to generate precomputed histogram data from simulation matrices.
 *
 * @author Selcuk Onur Sumer
 */

var fs = require('fs');
var system = require('system');
var _ = require('underscore');
var stats = require('simple-statistics');

// TODO this is a traditional way to import a regular JS file: define a nodejs module instead!
eval(fs.readFileSync('../webapp/js/src/util/MatrixParser.js').toString());

//var matrixParser = require('../webapp/js/src/util/MatrixParser.js');


function main(args)
{
	var PREFIX = "predict";
	var SUFFIX = ".txt";
	var DEFAULT_BIN_COUNT = 100;
	var DEFAULT_DISTORTION = 1.3;
	var DEFAULT_INDEX_FILE = "simul_columns_of_interest.json";

	// map of <column name, column index> pairs (of select columns only)
	var indexMap = null;

	/**
	 * Recursive traversal of the target directory.
	 * see http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
	 *
	 * @param dir   target dir
	 * @param done  callback function
	 */
	function walk(dir, done) {
		var results = [];
		fs.readdir(dir, function(err, list) {
			if (err) return done(err);
			var pending = list.length;
			if (!pending) return done(null, results);
			list.forEach(function(file) {
				file = dir + '/' + file;
				fs.stat(file, function(err, stat) {
					if (stat && stat.isDirectory()) {
						walk(file, function(err, res) {
							results = results.concat(res);
							if (!--pending) done(null, results);
						});
					} else {
						results.push(file);
						if (!--pending) done(null, results);
					}
				});
			});
		});
	}

	function columnsOfInterest(matrix)
	{
		var dataSlice = {};

		// init array for data slice
		_.each(_.keys(indexMap), function(key) {
			dataSlice[key] = [];
		});

		// extract columns of interest
		_.each(matrix.data, function(row, idx) {
			_.each(_.keys(indexMap), function(key) {
				dataSlice[key].push(parseFloat(row[indexMap[key]]));
			});
		});

		return dataSlice;
	}

	function calcGlobalMaxMin(inputDir, distortion)
	{
		var globalMaxMin = {};

		// init the array
		_.each(_.keys(indexMap), function(key) {
			globalMaxMin[key] = {min: 0, max: 0};
		});

		walk(inputDir, function(err, results) {
			if (err)
			{
				throw err;
			}

			console.log("[" + new Date() + "] calculating global min and max for the directory: " + inputDir);

			_.each(results, function(filename, idx) {
				if (filename.indexOf(PREFIX) != -1 &&
				    filename.indexOf(SUFFIX) != -1)
				{
					var content = fs.readFileSync(filename).toString();
					var matrix = MatrixParser.parseInput({input: content});

					// multiply all data points with the distortion value before processing the matrix
					matrix = distortMatrix(matrix, distortion);

					var maxMin = calcMaxMin(matrix);

					// update global max and min if necessary
					_.each(_.keys(indexMap), function(key) {
						if (globalMaxMin[key].min > maxMin[key].min)
						{
							globalMaxMin[key].min = maxMin[key].min;
						}

						if (globalMaxMin[key].max < maxMin[key].max)
						{
							globalMaxMin[key].max = maxMin[key].max;
						}
					});
				}
			});

			console.log("[" + new Date() + "] finished calculating global min and max values.");
		});

		return globalMaxMin;
	}

	/**
	 * Multiplies all data points with the distortion value for the
	 * provided matrix.
	 *
	 * @param matrix        matrix object
	 * @param distortion    multiplication factor
	 * @returns {Object}    reference to the original matrix object
	 */
	function distortMatrix(matrix, distortion)
	{
		for (var i=0; i < matrix.data.length; i++)
		{
			for (var j=0; j < matrix.data[i].length; j++)
			{
				matrix.data[i][j] = matrix.data[i][j] * distortion;
			}
		}

		return matrix;
	}

	function generateData(inputDir, outputDir, maxMin, binCount, distortion)
	{
		walk(inputDir, function(err, results) {
			if (err)
			{
				throw err;
			}

			console.log("[" + new Date() + "] processing directory: " + inputDir);

			_.each(results, function(filename, idx) {
				if (filename.indexOf(PREFIX) != -1 &&
				    filename.indexOf(SUFFIX) != -1)
				{
					var content = fs.readFileSync(filename).toString();
					var matrix = MatrixParser.parseInput({input: content});

					// multiply all data points with the distortion value before processing the matrix
					matrix = distortMatrix(matrix, distortion);

					var histogramData = processMatrix(matrix, maxMin, binCount);

					var sliceIdx = filename.lastIndexOf("/");
					var outputName = outputDir + filename.slice(sliceIdx).replace(SUFFIX, ".json");
					fs.writeFileSync(outputName, JSON.stringify(histogramData));
				}
			});

			console.log(new Date() + " results written to: " + outputDir);
		});
	}

	function calcMaxMin(matrix)
	{
		// extract columns of interest
		var dataSlice = columnsOfInterest(matrix);

		var maxMin = {};

		// init the array
		_.each(_.keys(indexMap), function(key) {
			maxMin[key] = {};
		});

		// generate histogram data for each column
		_.each(_.keys(dataSlice), function(key) {
			// determine bin interval by using max and min values
			maxMin[key].min = _.min(dataSlice[key]);
			maxMin[key].max = _.max(dataSlice[key]);
		});

		return maxMin;
	}

	function processMatrix(matrix, maxMin, binCount)
	{
		// extract columns of interest
		var dataSlice = columnsOfInterest(matrix);

		var histogramData = {};

		// init histogram data array
		_.each(_.keys(indexMap), function(key) {
			histogramData[key] = [];
		});

		// generate histogram data for each column
		_.each(_.keys(dataSlice), function(key) {
			// determine bin interval by using max and min values
			//var min = _.min(dataSlice[key]);
			//var max = _.max(dataSlice[key]);

			// determine bin interval by using global max and min values
			var min = maxMin[key].min;
			var max = maxMin[key].max;
			var binInterval = (max - min) / binCount;

			// calculate mean, median, std deviation
			var mean = stats.mean(dataSlice[key]);
			// var median = stats.median(dataSlice[key]); // median is almost always zero
			var stdDev = stats.standard_deviation(dataSlice[key]);

			// init bin data object
			var binData = {};
			var minBinIdx = Math.floor(min/binInterval);
			var maxBinIdx = Math.floor(max/binInterval);

			for (var i = minBinIdx; i <= maxBinIdx; i++)
			{
				binData[i] = [];
			}

			// populate bins
			_.each(dataSlice[key], function(value, idx) {
				var binIdx = Math.floor(value / binInterval);
				binData[binIdx].push(value);
			});

			// generate data to be stored
			// TODO also calculate mean, median, std deviation here?
			var histData = {
				binInterval: binInterval,
				min: min,
				max: max,
				mean: mean,
				//median: median,
				stdDev: stdDev,
				binSummary: []
			};

			_.each(binData, function(values, binIdx) {
				var sum = _.reduce(values, function(memo, num){ return memo + num; }, 0);
				var count = values.length;
				var average = sum / count;

				// if no average (i.e. empty bin),
				// then take the mid point of the current interval
				average = average ||
				          (min + ((parseInt(binIdx) - minBinIdx) + 0.5) * binInterval);

				histData.binSummary.push({
					count: count,
					average: average
				});
			});

			// sort bins wrt average
			histData.binSummary.sort(function(a, b) {
				if (a.average < b.average)
				{
					return -1;
				}
				else if (a.average > b.average)
				{
					return 1;
				}

				return 0;
			});

			histogramData[key] = histData;
		});

		return histogramData;
	}

	function generateColumnIndex(indexFile)
	{
		var fileContent = fs.readFileSync(indexFile).toString();

		// error: 101
		return JSON.parse(fileContent);
	}

	// args[0]: node -- args[1]: generateHistogramData.js
	var inputDir = args[2];
	var outputDir = args[3];
	var columnIndexFile = args[4] || DEFAULT_INDEX_FILE;
	var binCount = args[5] || DEFAULT_BIN_COUNT;
	var distortion = args[6] || DEFAULT_DISTORTION;

	if (inputDir && outputDir)
	{
		indexMap = generateColumnIndex(columnIndexFile);
		var globalMaxMin = calcGlobalMaxMin(inputDir, distortion);
		generateData(inputDir, outputDir, globalMaxMin, binCount, distortion);
	}
	else
	{
		console.log("usage: node generateHistogramData.js <input_dir> <output_dir> [<column_index_file> <number_of_bins> <distortion>]");
	}
}

main(system.args);
