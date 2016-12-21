"use strict";

let load = (src) => {
  if (src.match("js")) {
    let el = document.createElement("script");
    el.src = src + "?" + Date.now();
    document.body.appendChild(el);
  } else {
    let el = document.createElement("link");
    el.rel = "stylesheet";
    el.href = src + "?" + Date.now();
    document.head.appendChild(el);
  }
};

let res = [
  "js/immediate.js",
  "js/render.js",
  "js/cfg.js",
  "js/enum.js",
  "js/global.js",
  "js/entities.js",
  "js/io.js",
  "js/update.js",
  "js/math.js",
  "js/main.js",
  "js/event.js",
  "js/generate.js",
  "js/listeners.js"
];

res.map((item) => load(item));