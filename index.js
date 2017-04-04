'use strict';

// require modules
var request 	= require('request'),
	progress 	= require('request-progress'),
	cheerio 	= require('cheerio'),
	async 		= require('async'),
	fs			= require('fs-extra'),
	commands	= require('command-line-commands'),
	exec		= require('child_process').exec;

// configure paths and urls
var downloadUrl, fileName, fileExists;
var showsUrl 	= 'https://www.democracynow.org/shows';
var showsRoot 	= './shows/';
var data 		= './data.json';

// configure valid commands
const validCommands = [ null, 'download', 'play', 'dap', 'clean', 'list' ];
var { command, argv } = commands(validCommands);

if (!command) command = 'dap';

// write to a JSON file to track the latest downloaded show
function saveData(latestShow, cb) {
	fs.writeJson(data, { latestShow: latestShow }, err => {
		if (err) return console.error(err);
		cb();
	});
}

// async check if file exists
function doesFileExist(file, cb) {
	fs.open(file, 'r', (err, fd) => {
		if (err) {
			if (err.code === 'ENOENT') {
				cb(false);
			}
		} else {
			cb(true);
		}
	});
}

// (unix only (?)) open the mp3
function playShow(cb) {
	doesFileExist(data, exists => {
		if (!exists) {
			console.error('no shows have been downloaded');
			if (cb) cb();
			return;
		}
		console.info('Playing latest show');
		fs.readJson(data, (err, obj) => {
			var cmd = 'open shows/' + obj.latestShow;
			exec(cmd, function(err, stdout, stderr) {
				if (err) {
					return console.error(err);
				}
				if (cb) cb();
			});
		});
	});
}

// clear the directory of all downloaded shows
if (command === 'clean') {
	fs.emptyDir(showsRoot, err => {
		if (err) return console.error(err)
		saveData('', () => {
			console.log('deleted all downloaded shows');
		});
	});
}

// play the latest show
if (command === 'play') {
	playShow();
}

// print a list of the downloaded shows
if (command === 'list') {
	fs.readdir(showsRoot, (err, files) => {
		console.log('downloaded shows:');
		files.forEach(file => {
			console.log(file);
		});
	})
}

// download the latest show (and play, if the 'dap' command was given)
if (command === 'download' || command === 'dap') {

	async.waterfall([

		// go to democracy now and get the download link
		function(cb) {
			console.info('Navigating to Democracy Now!');
			request(showsUrl, function(err, res, body) {
				if (err) {
					if (err.code === 'ENOTFOUND') {
						return console.error('Could not download the latest show because there is no internet connection');
					}
					return console.error('Request Error: ' + err);
				}
				var $ = cheerio.load(body);
				downloadUrl = $('.download_audio').attr('href');
				cb();
			});
		},

		// check if the show has already been downloaded
		function(cb) {

			console.log('Checking if file has already been downloaded...');
			fileName = downloadUrl.split('/');
			fileName = fileName[fileName.length-1];

			doesFileExist(showsRoot + fileName, exists => {
				fileExists = exists;
				cb();
			});
		},

		// if it hasn't already been downloaded, download the latest show
		function(cb) {

			if (!fileExists) {

				console.info('Downloading the latest show...');
				
				fs.mkdirpSync(showsRoot);

				progress(request(downloadUrl))
				.on('progress', function (state) {
					console.log('progress', Math.round(state.percent * 100) + '%');
				})
				.on('error', function(err) {
					console.error('Request Error: ' + err);
				})
				.on('end', function() {
					console.info('Download complete');
					cb();
				})
				.pipe(fs.createWriteStream(showsRoot + fileName));

			} else {
				console.info('Latest show has already been downloaded');
				cb();
			}
		},

		// update the data with the latest show
		function(cb) {

			// for reference next time this is run, save the reference to the latest download
			saveData(fileName, cb);
		},

		// if the 'dap' command was given, play the show
		function(cb) {
			if (command === 'dap') {
				playShow(cb);
			} else {
				cb();
			}
		}

	], function() {
		console.info('done!');
	});
}