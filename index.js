var crawl = require('./crawl.js');
var fs = require('fs');


/**
 * Try out the crawler on a given url.
 */
crawl('https://bede.io', 5, function(data, err) {
    console.log(data);
    if(err) {
        console.log(err);
    } else {
        fs.writeFile('data.txt', JSON.stringify(data), function(err) {
            if(err) {
                console.log(err);
            }
        });
    }
});