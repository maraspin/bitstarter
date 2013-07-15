#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2

 + restler
 - https://github.com/danwrong/restler

*/

var fs = require('fs');
var program = require('commander');
var rest = require('restler');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://serene-meadow-2070.herokuapp.com";



var checkFromUrl = function(url) { 
        rest.get(url).on('complete', function(result) {
          if (result instanceof Error) {
               console.log("Problem loading URL: %s. Exiting.", url);
               process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
          } else {
		doChecks(result);
          }
        });
	return true;
}

var checkFromFile = function(file) {
     fs.readFile(file, function (err, data) {
     if (err) {
          console.log("Problem loading File: %s. Exiting.", file);
          process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
     }
     doChecks(data);
  });

}

var doChecks = function(data) {
  var result = checkHtmlFile(cheerio.load(data), checksFile);    
  var out = JSON.stringify(result, null, 4);  
  console.log(out);
}


var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};


var loadChecks = function(checksfile) {
    // process.exit(0);
    var loadedChecks = fs.readFileSync(checksfile);
    return JSON.parse(loadedChecks);
};


var checkHtmlFile = function(htmlContent, checksfile) {
    $ = htmlContent;
    console.log("Loading checks in %s", checksfile);   
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};



var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};



if(require.main == module) {

    var checksFile;
  
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <html_file_url>', 'URL to index.html')
        .parse(process.argv);
  
    checksFile = program.checks;

    // do we have an URL?
    if(null != program.url) {
       console.log("Checking an URL");	
       checkFromUrl(program.url);
    } else {
       // fallback to file
       console.log("Checking a File");	
	checkFromFile(program.file);
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
