/* vim: set noai ts=4 sw=4 expandtab eol nobinary: */

"use strict";

const { watch, dest, src, series } = require("gulp");
const eslint = require("gulp-eslint");
const istanbul = require("gulp-istanbul");
const prettier = require("gulp-prettier");
const cache = require("gulp-cached");
const mocha = require("gulp-mocha");

const unitTests = ["test/unit/**/*.js"];

const funcTests = ["test/func/**/*.js"];

const jsFiles = ["gulpfile.js", "index.js", "test/**/*.js", "lib/**/*.js"];

const measureCoverageFiles = ["lib/**/*.js"];

function taskLocalLint() {
  return src(jsFiles).pipe(eslint()).pipe(eslint.format());
}

function taskLintCI() {
  return src(jsFiles)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
}

function taskLocalPrettify() {
  return src(jsFiles)
    .pipe(cache("prettier"))
    .pipe(prettier())
    .pipe(dest((file) => file.base));
}

function taskPrettifyCI() {
  return src(jsFiles).pipe(prettier.check());
}

function taskLocalUnit() {
  return src(unitTests, {
    read: false,
  }).pipe(
    mocha({
      reporter: "dot",
      colors: false,
    })
  );
}

function taskWatch(done) {
  watch(
    jsFiles,
    {
      usePolling: true,
      interval: 500,
    },
    series(taskLocalPrettify, taskLocalUnit, taskLocalLint)
  );
  done();
}

function taskPreTest() {
  return src(measureCoverageFiles)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
}

function taskUnitCI() {
  return (
    src(unitTests, {
      read: false,
    })
      .pipe(
        mocha({
          reporter: "spec",
          timeout: 10000,
        })
      )
      .pipe(istanbul.writeReports())
      // Enforce a coverage of at least 90%
      .pipe(
        istanbul.enforceThresholds({
          thresholds: {
            global: 89,
          },
        })
      )
  );
}

function taskFuncCI() {
  return src(funcTests, {
    read: false,
  })
    .pipe(
      mocha({
        reporter: "spec",
        timeout: 10000,
      })
    )
    .pipe(istanbul.writeReports());
}

exports.local = series(taskLocalPrettify, taskLocalLint, taskLocalUnit);
exports.validate = series(taskPrettifyCI, taskLocalLint, taskLocalUnit);
exports.watch = taskWatch;
exports.default = series(
  taskPrettifyCI,
  taskLintCI,
  taskFuncCI,
  taskPreTest,
  taskUnitCI
);
