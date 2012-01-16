JS/HTML Time display
--------------------

Project for nice visual display of time in Javascript.

Current implementation uses HTML 5's canvas element to draw a single LED symbol. Next step would be to combine this to display a running time display.

Future work
----------
- Make it work on non-HTML 5 browsers. Can investigate SVG here perhaps,
  or maybe even try to do it with table cells (screw the purists). It
  is important that it works on older browsers, so this is something
  to look at.

- Other styles of displaying time:
  	- Analog
        - Those old school "ticker" time mechanical stuff.

Running
-------
If you have python < 3, just run:

    python -m SimpleHTTPServer

For python 3, do:

    python -m http.server

In the main directory and then go to http://localhost:8000, and click the button.

JS Unit Tests
-------------

You need ruby, and rake installed, then do:

	gem install jasmine
	gem install jasmine-headless-webkit

Then, in the main directory of the code:

	jasmine-headless-webkit

(If it still doesn't work, you may need to do a

        jasmine init

in the top level dir of the code)

