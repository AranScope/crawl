var request = require('request');
var Promise = require('promise');
var cheerio = require('cheerio');
var url = require('url')

/**
 * Return a copy of the set, with any items that
 * do not satisfy the predicate removed.
 *
 * @param predicate A boolean classification function, if false, remove element.
 * @returns {Set} The set with removed elements.
 */
Set.prototype.filter = function (predicate) {
    var filtered_set = new Set();

    this.forEach(function (elem) {
        if (predicate(elem)) {
            filtered_set.add(elem);
        }
    });

    return filtered_set;
};

/**
 * The auxillary function to recursively crawl a website.
 * When the crawl depth reaches 0 we stop recursing and pass
 * the sitemap back through the callback function.
 *
 * @param site_url The url of the page currently being crawled.
 * @param depth The current depth of the crawl.
 * @param sitemap The current sitemap (JSON).
 * @param visited The set of visited pages.
 * @param cb The callback function. (takes data and err parameter).
 */
var auxcrawl = function (site_url, depth, sitemap, visited, cb) {

    if (depth == 0) {
        // when we hit 0 depth, call the callback function with the completed sitemap.
        cb(sitemap, false);
        return;
    }

    get_html(site_url).then(
        function (html) {
            // get the html from the given site url.

            var pagemap = generate_sitemap(site_url, html);
            // generate a sitemap for the current page.

            sitemap[site_url] = pagemap;
            // add the pagemap to the global sitemap.

            var links_to_traverse = pagemap.links.filter(x => x.match("^" + site_url));
            // filter out any different-domain links. These will not be traversed.

            links_to_traverse = links_to_traverse.filter(x => !(visited.has(x)));
            // filter out any links that have already been traversed.

            if(links_to_traverse.length == 0) {
                // if there are no new links, set the depth the 0 and recurse
                // this will effectively end the crawl.
                auxcrawl(site_url, 0, sitemap, visited, cb);
            }

            links_to_traverse.forEach(function (link) {
                // loop through each link.

                visited = visited.add(link);
                // add the link to the visited set.

                auxcrawl(link, depth - 1, sitemap, visited, cb);
                // make the recursive crawl, we reduce the depth by 1 as the
                // tree depth has increased by 1. When this hits zero we return.

            });
        }, function (err) {
            cb(err, true);
        }
    )
};

/**
 *
 * Get a JSON sitemap for a given web page, with a user specified crawl depth.
 *
 * The sitemap is in JSON.
 *
 * This is restricted to crawling pages on the same domain.
 *
 * e.g.
 * {
 *      "https://aran.site": {
 *          links: ["https://aran.site/somepostname","https://aran.site/anotherpostname"],
 *          styles: ["https://aran.site/style.css"],
 *          scripts: ["https://somesite.io/jquery-min.js"]
 *      },
 *      "https://aran.site/cats": .....
 * }
 *
 * This is an alias function around auxcrawl.
 *
 * @param site_url The url to begin crawling from.
 * @param depth The maximum depth of the crawl.
 * @param callback The callback function to return the sitemap.
 */
var crawl = function (site_url, depth, callback) {
    auxcrawl(site_url, depth, {}, new Set(), function(data, err) {
        // make the auxillary call, passing in an empty object and set
        // used as accumulators later on.

        callback(data, err);
    });
};

/**
 * Generate a sitemap for a single web page.
 *
 * e.g.
 *
 * {
 *          links: ["https://aran.site/somepostname","https://aran.site/anotherpostname"],
 *          styles: ["https://aran.site/style.css"],
 *          scripts: ["https://somesite.io/jquery-min.js"]
 * }
 *
 *
 * @param site_url The url of the crawled page.
 * @param html The HTML from the crawled page.
 * @returns {{links: Array, styles: Array, scripts: Array}} The data found during the crawl.
 */
generate_sitemap = function (site_url, html) {

    var scripts = new Set();
    var styles = new Set();
    var links = new Set();
    // construct sets to avoid duplicate scripts, styles and links.

    var $ = cheerio.load(html);
    // use cheerio (a jquery library) to allow DOM traversal of the HTML data.

    $("a").each(function (index) {
        // loop through each anchor tag e.g. <a href="#">sometext</a>

        if (this.attribs.hasOwnProperty("href")) {
            // check if the current anchor has a hyperlink attribute.

            var href = this.attribs["href"];
            // extract the link from the href attribute.

            href = url.resolve(site_url, href);
            // convert any relative paths to absolute paths.
            //
            // e.g. "https://aran.site", "posts/coolpost" -> "https://aran.site/posts/coolpost"

            links.add(href);
            // add the link to the links set.
        }
    });

    $("link").each(function (index) {
        // loop through each link tag.

        if (this.attribs.hasOwnProperty("type") && this.attribs.hasOwnProperty("href")) {
            // check that the link tag has type and href attributes.

            if (this.attribs["type"] == "text/css") {
                // check that the link points to a css file.

                var href = this.attribs["href"];
                // extract the link from the href attribute.

                href = url.resolve(site_url, href);
                // convert and relative paths to absolute paths.

                styles.add(href);
                // add the link to the styles set.
            }
        }
    });

    $("script").each(function (index) {
        // loop through each script tag.

        if (this.attribs.hasOwnProperty("src")) {
            // check that the script has a src attribute i.e. is not an inline script.

            var href = this.attribs["src"];
            // extract the link from the src attribute.

            href = url.resolve(site_url, href);
            // convert and relative paths to absolute paths.

            scripts.add(href);
            // add the link to the scripts set.
        }
    });

    var result = {
        links: [],
        styles: [],
        scripts: []
    };

    result.styles = Array.from(styles);
    result.links = Array.from(links);
    result.scripts = Array.from(scripts);
    // convert the arrays back to sets for usability.

    return result;
};

/**
 * Download a given html page, using Promises for asynchronous callbacks.
 *
 * @param site_url The url of the html page.
 * @returns {*} A promise to return the text content of the html page.
 */
var get_html = function (site_url) {

    return new Promise(function (fulfill, reject) {
        var body = "";
        var status = -1;

        request
            .get(site_url) // perform a get request on the url.
            .on('response', function (res) {
                // initial response from our get request.
                var status_code = res.statusCode;
                var content_type = res.headers['content-type'];

                if (status_code != 200) {
                    // if the http status code is not 200 then we have
                    // not received out data.
                    reject('status code not equal to 200, invalid request.');
                }

                if (content_type.indexOf('text/html') < 0) {
                    // if the content type of the page is not html then we
                    // can not use the data.
                    reject('content type not equal to text/html, invalid request.');
                }
            })
            .on('data', function (data) {
                // append the new data chunk to the body of the current query.
                body += data;
            })
            .on('end', function () {
                // when the query is complete, fulfill the promise with the html body.
                fulfill(body);
            })
            .on('error', function (err) {
                // when an error occurs reject the promise with the error message.
                reject(err);
            });
    });
};

module.exports = crawl;