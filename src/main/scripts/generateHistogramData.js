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

	// map of <column name, column index> pairs (of select columns only)
	// TODO use node_index.txt if possible
	var indexMap = {
		//error: 101,
		g2m: 84,
		g1arrest: 85,
		g2arrest: 86,
		sarrest: 87,
		cell_viability:	88
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

	function processMatrix(matrix)
	{
		var dataSlice = {};
		var histogramData = {};

		// init arrays for data slice
		_.each(_.keys(indexMap), function(key) {
			dataSlice[key] = [];
			histogramData[key] = [];
		});

		// extract columns of interest
		_.each(matrix.data, function(row, idx) {
			_.each(_.keys(indexMap), function(key) {
				dataSlice[key].push(parseFloat(row[indexMap[key]]));
			});
		});

		// generate histogram data for each column
		_.each(_.keys(dataSlice), function(key) {
			var binData = 0;

			_.each(dataSlice[key], function(value, idx) {
				binData += value;
			});

			// TODO define bin interval and take count & average for all intervals!!
			histogramData[key].push(binData / dataSlice[key].length);
		});

		return histogramData;
	}

	// args[0]: node -- args[1]: generateHistogramData.js
	var inputDir = args[2];
	var outputDir = args[3];

	if (inputDir && outputDir)
	{
		walk(inputDir, function(err, results) {
			if (err)
			{
				throw err;
			}

			console.log("[" + Date() + "] processing directory: " + inputDir);

			_.each(results, function(filename, idx) {
				if (filename.indexOf(PREFIX) != -1 &&
				    filename.indexOf(SUFFIX) != -1)
				{
					var content = fs.readFileSync(filename).toString();
					var matrix = MatrixParser.parseInput({input: content});
					var histogramData = processMatrix(matrix);

					var sliceIdx = filename.lastIndexOf("/");
					var outputName = outputDir + filename.slice(sliceIdx);
					fs.writeFileSync(outputName, JSON.stringify(histogramData));
				}
			});

			console.log(Date() + " results written to: " + outputDir);
		});
	}
	else
	{
		console.log("usage: node generateHistogramData.js <input_dir> <output_dir>");
	}
}

main(system.args);
