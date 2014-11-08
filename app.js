/**
 * Module dependencies
 */
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var jsdom = require('jsdom');
var app = express();
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.get('/scrape', function (req, res) {
    var url = req.query.url;

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

    request(url, function (error, response, html) {

        // First we'll check to make sure no errors occurred when making the request

        if (!error) {
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);
            var pContent = [];
            $('p').each(function(key, val){
                pContent = pContent.concat($(val).text().split(' '));

            });
            var h1Content,h2Content,h3Content,combined,sortCounter= [];
            var counter = {};


            h1Content = $('h1').text().split(' ');
            h2Content = $('h2').text().split(' ');
            h3Content = $('h3').text().split(' ');
            h1Content = arrayClean(h1Content);
            h2Content = arrayClean(h2Content);
            h3Content = arrayClean(h3Content);

            combined = h1Content.concat(h2Content.concat(h3Content.concat(pContent)));

            counter=wordCount(counter,combined);

            for (var word in counter)
             sortCounter.push({word:word, count:counter[word]});

            var sortCounter = sortObject(sortCounter);


            res.json({h1Contents: h1Content,
                h2Contents: h2Content,
                h3Contents: h3Content,
                allContents: pContent,
                allWords:combined,
                popularWords:sortCounter
            });
        }
    });
});

function arrayClean(content){
    for(i in content){
        if(content[i].length == 0){
            content.splice(i,1);
        }
    }
    return content;
}

function wordCount(count,words){

    var letterCheck = /^[A-Za-z0-9,\. ]{3,50}$/;
    for(i in words){
        if(letterCheck.test(words[i])) {
            count[words[i]] = (count[words[i]]+1 || 1);
        }
    }
    return count;
    }

function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                term: obj[prop]

            });
        }
    }
    arr.sort(function(a, b) {
        return b.term.count - a.term.count; });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr; // returns array
}
app.use(express.static(__dirname+"/public"));
app.listen('80');

console.log('Magic happens on port 80');

exports = module.exports = app;
