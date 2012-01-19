Frontend client for countdown project
-------------------------------------
Server-side generation and static file serving for countdown projects' web-client. Uses node.js with jsdom to generate client HTML on the server side (same code that will eventually run in the browser) for the initial requests.

This means that /month, /year, /day, /week, /?adfasdf all work as expected, and all point to a single resource, just as the web intented. It also means everything is crawlable.

From the first request onwards, the client does AJAX requests from the clients' browser.

Usage
-----

You need node.js, and then the following node.js modules (installed with npm): jsdom, node-static, express

So basically, you need to install node.js and npm using your distro package manager. Then do:

     npm install jsdom
     npm install node-static
     npm install mongodb --mongodb:native
     npm install express

Then run with the following command:

     node server.js

This starts the server on port 8080.

