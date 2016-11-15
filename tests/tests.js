var crawl = require('../crawl.js');
var should = require('should');

/**
 * Run the unit tests for crawl.js (THIS REQUIRES AN INTERNET CONNECTION).
 */

// generate a test sitemap.
test_plain_sitemap = generate_sitemap("https://aran.site", "<a href='https://aran.site/'></a>");


// test that the first link in the sitemap is correct.
test_plain_sitemap.links[0].should.be.exactly("https://aran.site/");

// test that sitemaps have the correct properties.
test_plain_sitemap.should.have.property('links');
test_plain_sitemap.should.have.property('scripts');
test_plain_sitemap.should.have.property('styles');

// test that a valid url does not return an error
// and returns data.
crawl('https://bede.io', 3, function(data, err) {
    should.not.exist(err);
    should.exist(data);
});

// test than an invalid url does return an error and
// returns data.
crawl('https://notreal.tld', 3, function(data, err) {
    should.exist(err);
    should.exist(data);
});