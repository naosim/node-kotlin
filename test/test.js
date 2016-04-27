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
        assert.equal(true, fs.existsSync("out/test/app.js" ));
        done()
      })
  });

  describe("sourceMaps", () => {
    it("should not generate by default", (done) => {
      kotlin({src: "test/resources/main.kt", out: "out/test"})
        .then(()=> {
          assert.equal(false, fs.existsSync("out/test/app.js.map" ));
          done()
        })
    });

    it("should generate when option is set", (done) => {
      kotlin({
        src: "test/resources/main.kt",
        out: "out/test",
        sourceMaps: true
      })
        .then(()=> {
          assert.equal(true, fs.existsSync("out/test/app.js.map" ));
          done()
        })
    });
  });
  
  describe("metaInfo", () => {
    it("should generate by default", (done) => {
      kotlin({src: "test/resources/main.kt", out: "out/test"})
        .then(()=> {
          assert.equal(true, fs.existsSync("out/test/app.meta.js" ));
          done()
        })
    });

    it("should not generate when option is set to false", (done) => {
      kotlin({
        src: "test/resources/main.kt",
        out: "out/test",
        metaInfo: false
      })
        .then(()=> {
          assert.equal(false, fs.existsSync("out/test/app.meta.js" ));
          done()
        })
    });
  });


});
