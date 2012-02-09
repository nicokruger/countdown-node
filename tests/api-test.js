var vows = require("vows"),
    assert = require("assert"),
    server = require("../js/server"),
    httpwrapper = require("./httpwrapper"),
    util = require("./util"),
    apiSpec;

// Load the page from localhost
describe("When, Again?", function () {
    var s, mongoDb;
    
    before(function (done) {
        mongoDb = util.spawnMongo(function (err) {
            s = server.server({logging:false, databasePort: mongoDb.port});
            s.listen();
            done(err);
        }, [{eventDate:new Date(),name:"Testing",tags:[]}]);
    });

    describe("URLs", function () {
        describe("support GET", function () {
            describe("Accepts: text/html", function () {
                it("200 on /", function (done) { util.GET("http://localhost:8080", 200, "html")(done); });
                it("200 on /countdowns", function (done) { util.GET("http://localhost:8080", 200, "html")(done); });
                it("200 on /random", function (done) { util.GET("http://localhost:8080/random", 200, "html")(done); });
                it("200 on /tags/SOME_TAG", function (done) { util.GET("http://localhost:8080/tags/SOME_TAG", 200, "html")(done); });
                it("200 on /<TAG_ID>", function (done) { util.GET("http://localhost:8080/4f2a4a1b9b781a81b052b067", 200, "html")(done); });
                it("200 on /add", function (done) { util.GET("http://localhost:8080/add", 200, "html")(done); });
                it("404 on /insert", function (done) { util.GET("http://localhost:8080/insert", 404, "html")(done); });
                it("404 on /upsert", function (done) { util.GET("http://localhost:8080/upsert", 404, "html")(done); });
                it("404 on /upsertmulti", function (done) { util.GET("http://localhost:8080/upsertmulti", 404, "html")(done); });
            });
            describe("Accepts: application/json", function () {
                /*it("200 on /", function (done) { util.GET("http://localhost:8080/", 200, "json")(done); });
                it("200 on /countdowns", function (done) { util.GET("http://localhost:8080/countdowns", 200, "json")(done); });
                it("200 on /future", function (done) { util.GET("http://localhost:8080/future", 200, "json")(done); });
                it("200 on /random", function (done) { util.GET("http://localhost:8080/random", 200, "json")(done); });
                it("200 on /tags/SOME_TAG", function (done) { util.GET("http://localhost:8080/tags/SOME_TAG", 200, "json")(done); });
                it("200 on /<TAG_ID>", function (done) { util.GET("http://localhost:8080/4f2a4a1b9b781a81b052b067", 200, "json")(done); });
                it("404 on /add", function (done) { util.GET("http://localhost:8080/add", 404, "json")(done); });
                it("200 on /insert", function (done) { util.GET("http://localhost:8080/insert", 200, "json")(done); });
                it("200 on /upsert", function (done) { util.GET("http://localhost:8080/upsert", 200, "json")(done); });*/
                //it("200 on /upsertmulti", function (done) { util.POST("http://localhost:8080/upsertmulti", {}, 200, "json")(done); });
            });
            describe("Version fingerprinting for text/html", function () {
                /*it("200 on /public", function (done) {
                    httpwrapper.get("http://localhost:8080/public/index.js", function (error, res, body) { assert.equal(res.statusCode, 200); done(); });
                });
                it("200 on /public_static", function (done) {
                    httpwrapper.get("http://localhost:8080/public_static/index.js", function (error, res, body) { assert.equal(res.statusCode, 200); done(); });
                });
                it("200 on /publicFINGERPRINT1", function (done) {
                    httpwrapper.get("http://localhost:8080/publicFINGERPRINT1/index.js", function (error, res, body) { assert.equal(res.statusCode, 200); done(); });
                });*/
            });
        });
    });
    describe("handling errors", function () {
        /*it("handles 404", function (done) {
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
        });*/
    });
    after(function (done) {
        s.close();
        mongoDb.stop(function () { console.log("calling done");done(); });
    });
});


