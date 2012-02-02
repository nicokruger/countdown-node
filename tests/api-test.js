var vows = require("vows");
var assert = require("assert");
var server = require("../js/server");
var httpwrapper = require("./httpwrapper");
// why can't i start this in the beforeEach? wtf

// Load the page from localhost
describe("When, Again?", function () {
    var s = server.server({logging:false});
    before(function () {
        s.listen();
    });
    describe("URLs", function () {
        describe("support GET", function () {
            describe("Accepts: text/html", function () {
                var html_headers = {"Accepts":"text/html"};
                it("200 on /", function (done) {
                    httpwrapper.get("http://localhost:8080", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, html_headers);
                });
                it("200 on /future", function (done) {
                    httpwrapper.get("http://localhost:8080/future", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, html_headers);
                });
                it("200 on /countdowns", function (done) {
                    httpwrapper.get("http://localhost:8080/countdowns", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, html_headers);
                });
                it("200 on /random", function (done) {
                    httpwrapper.get("http://localhost:8080/random", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, html_headers);
                });
                it("200 on /add", function (done) {
                    httpwrapper.get("http://localhost:8080/add", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, html_headers);
                });
                it("200 on /tags/SOME_TAG", function (done) {
                    httpwrapper.get("http://localhost:8080/tags/SOME_TAG", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, html_headers);
                });
                it("200 on /<TAG_ID>", function (done) {
                    httpwrapper.get("http://localhost:8080/4f2a4a1b9b781a81b052b067", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, html_headers);
                });
                it("404 on /insert", function (done) {
                    httpwrapper.get("http://localhost:8080/insert", function (error, res, body) { assert.equal(res.statusCode, 404); done(); }, html_headers);
                });
                it("404 on /upsert", function (done) {
                    httpwrapper.get("http://localhost:8080/upsert", function (error, res, body) { assert.equal(res.statusCode, 404); done(); }, html_headers);
                });
                it("404 on /upsertmulti", function (done) {
                    httpwrapper.get("http://localhost:8080/upsertmulti", function (error, res, body) { assert.equal(res.statusCode, 404); done(); }, html_headers);
                });
            });
            describe("Accepts: application/json", function () {
                var json_headers = {"Accepts":"application/json"};
                it("200 on /", function (done) {
                    httpwrapper.get("http://localhost:8080", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, json_headers);
                });
                it("200 on /countdowns", function (done) {
                    httpwrapper.get("http://localhost:8080/countdowns", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, json_headers);
                });
                it("200 on /future", function (done) {
                    httpwrapper.get("http://localhost:8080/future", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, json_headers);
                });
                it("200 on /random", function (done) {
                    httpwrapper.get("http://localhost:8080/random", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, json_headers);
                });
                it("200 on /tags/SOME_TAG", function (done) {
                    httpwrapper.get("http://localhost:8080/tags/SOME_TAG", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, json_headers);
                });
                it("200 on /<TAG_ID>", function (done) {
                    httpwrapper.get("http://localhost:8080/4f2a4a1b9b781a81b052b067", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, json_headers);
                });
                it("404 on /add", function (done) {
                    httpwrapper.get("http://localhost:8080/add", function (error, res, body) { assert.equal(res.statusCode, 404); done(); }, json_headers);
                });
                it("200 on /insert", function (done) {
                    httpwrapper.get("http://localhost:8080/insert", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, json_headers);
                });
                it("200 on /upsert", function (done) {
                    httpwrapper.get("http://localhost:8080/upsert", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, json_headers);
                });
                it("200 on /upsertmulti", function (done) {
                    httpwrapper.get("http://localhost:8080/upsertmulti", function (error, res, body) { assert.equal(res.statusCode, 200); done(); }, json_headers);
                });
            });
            describe("Version fingerprinting for text/html", function () {
                it("200 on /public", function (done) {
                    httpwrapper.get("http://localhost:8080/public_/index.js", function (error, res, body) { assert.equal(res.statusCode, 200); done(); });
                });
                it("200 on /public_static", function (done) {
                    httpwrapper.get("http://localhost:8080/public_static/index.js", function (error, res, body) { assert.equal(res.statusCode, 200); done(); });
                });
                it("200 on /publicFINGERPRINT1", function (done) {
                    httpwrapper.get("http://localhost:8080/publicFINGERPRINT1/index.js", function (error, res, body) { assert.equal(res.statusCode, 200); done(); });
                });
            });
        });
    });
    describe("handling errors", function () {
        it("handles 404", function (done) {
            //http.request({host:"http://localhost", port:8080, method:"GET", path:"DOES_NOT_EXIST"}, function (res) {
            httpwrapper.get("http://localhost:8080/DOES_NOT_EXIST", function (error, res, body) {
                assert.equal(res.statusCode, 404);
                done();
            });
        });
        it("handles breakage gracefully", function (done) {
            httpwrapper.post("http://localhost:8080/upsertmulti", "", null, function (error, res, body) { // break on purpose!
                assert.equal(res.statusCode, 500);
                done();
            });
        });
    });
    after(function () {
        s.close();
    });
});
