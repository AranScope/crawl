[![Build Status](https://travis-ci.org/AranScope/crawl.svg?branch=master)](https://travis-ci.org/AranScope/crawl)
# crawl
A Node web crawler.

Crawl is a minimal web crawler, that helps you steal that perfect font, uncover your friends cv's or improve your style(.css).

## technical details
Crawl uses the following node modules
- request (for get requests to download the pages)
- promise (for async callbacks)
- cheerio (for jquery's beautiful dom parsing)
- should (for unit testing)

and soon...
- express (for a RESTful interface)

All operations are performed asynchronously, through either passing callbacks or using the promise library mentioned above.

The recursive depth can be configured, try to keep this low as is still useful for high speed.


## give it a go
cd into crawl and run ```npm install``` to get all of the dependencies.

You can find an example usage inside ```index.js```. Crawl outputs JSON, you can prettify this using the json-prettify module or lots of sites online. You can run this with ```node index.js```

Tests are included in ```tests/tests.js```, they're written using the super cool [Should](https://www.npmjs.com/package/should) unit-test library. You can run the tests with ```node tests.js```.

## Example
```json
{  
   "https://bede.io":{  
      "links":[  
         "https://bede.io/#",
         "https://bede.io/",
         "https://bede.io/tag/hacking-team/",
         "https://bede.io/tag/textgame/",
         "https://bede.io/tag/chatroom/",
         "https://bede.io/tag/compsci/",
         "https://bede.io/rss/",
         "https://bede.io/#content",
         "https://bede.io/page/2/",
         "https://bede.io/goroutines-and-concurrency/",
         "https://bede.io/author/bedekelly/",
         "https://bede.io/aws-and-dash-amazon-buddies-forever/",
         "https://bede.io/google-open-redirect/",
         "https://bede.io/hacking-the-dash-button/",
         "https://bede.io/serverless-3-not-over-yet/",
         "https://bede.io/hackcampus/",
         "https://bede.io/chords/",
         "https://bede.io/serverless-2-who-needs-s3-anyway/",
         "https://bede.io/serverless-going-full-on-hipster/",
         "https://bede.io/buzzwords-and-friends/",
         "https://ghost.org/"
      ],
      "styles":[  
         "https://bede.io/assets/css/screen.css?v=6a7d7ce5f6",
         "https://fonts.googleapis.com/css?family=Merriweather:300,700,700italic,300italic%7COpen+Sans:700,400"
      ],
      "scripts":[  
         "https://bede.io/public/jquery.min.js?v=6a7d7ce5f6",
         "https://code.jquery.com/jquery-1.11.3.min.js",
         "https://bede.io/assets/js/jquery.fitvids.js?v=6a7d7ce5f6",
         "https://bede.io/assets/js/index.js?v=6a7d7ce5f6",
         "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"
      ]
   },
   "https://bede.io/#":{  
      "links":[  
         "https://bede.io/#",
         "https://bede.io/",
         "https://bede.io/tag/hacking-team/",
         "https://bede.io/tag/textgame/",..........
```


