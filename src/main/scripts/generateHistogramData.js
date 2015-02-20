/**
 * Node script to generate precomputed histogram data from simulation matrices.
 *
 * @author Selcuk Onur Sumer
 */

var fs = require('fs');
var system = require('system');
var _ = require('underscore');

// TODO this is a traditional way to import a regular JS file: define a nodejs module instead!
eval(fs.readFileSync('../webapp/js/src/util/MatrixParser.js').toString());

//var matrixParser = require('../webapp/js/src/util/MatrixParser.js');


function main(args)
{
	var PREFIX = "predict";
	var SUFFIX = ".txt";
	var DEFAULT_BIN_COUNT = 100;

	// map of <column name, column index> pairs (of select columns only)
	// TODO use node_index.txt if possible
	var indexMap = {
		//error: 101,
		g2m: 84,
		g1arrest: 85,
		g2arrest: 86,
		sarrest: 87,
		cellviability: 88
	};

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

	function calcGlobalMaxMin(inputDir)
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

	function generateData(inputDir, outputDir, maxMin, binCount)
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

	// args[0]: node -- args[1]: generateHistogramData.js
	var inputDir = args[2];
	var outputDir = args[3];
	var binCount = args[4] || DEFAULT_BIN_COUNT;

	if (inputDir && outputDir)
	{
		var globalMaxMin = calcGlobalMaxMin(inputDir);
		generateData(inputDir, outputDir, globalMaxMin, binCount);
	}
	else
	{
		console.log("usage: node generateHistogramData.js <input_dir> <output_dir> [<number_of_bins>]");
	}
}

main(system.args);
