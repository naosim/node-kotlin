const
  kotlin = require(".."),
  assert = require("chai").assert,
  rimraf = require("rimraf"),
  fs = require("fs");

describe("node-kotlin", () => {
  beforeEach(done => rimraf("out/test", {}, done));
  afterEach(done => rimraf("out/test", {}, done));

  it("should compile file", (done) => {
    kotlin({src: "test/resources/main.kt", out: "out/test"})
      .then(()=> {
        fs.stat("out/test/app.js", (err, stats) => {
          assert.equal(true, stats.isFile());
          done()
        });
      })
  });
});
