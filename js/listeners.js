"use strict";

window.addEventListener("mousemove", (e) => {
  e.preventDefault();
  if (ship === null) return void 0;

  let x = e.clientX - (cx + (ship.x * DIM) * SCALE);
  let y = e.clientY - (cy + (ship.y * DIM) * SCALE);

  let angle = Math.atan2(y, x);

  ship.angle = angle;

});

window.addEventListener("mousedown", (e) => {
  e.preventDefault();
  if (e.which === 3) {
    keys["Slow"] = 1;
  }
  if (e.which !== 1) return void 0; // only handle left click
  keys["Fire"] = 1;
});
window.addEventListener("mouseup", (e) => {
  e.preventDefault();
  if (e.which === 3) {
    SPEED = DEFAULT_SPEED;
    keys["Slow"] = 0;
  }
  if (e.which !== 1) return void 0; // only handle left click
  keys["Fire"] = 0;
});

window.addEventListener("keydown", (e) => {
  //e.preventDefault();
  if (keys[e.code] !== void 0) {
    keys[e.code] = 1;
  }
});

window.addEventListener("keyup", (e) => {
  e.preventDefault();
  if (keys[e.code] !== void 0) {
    keys[e.code] = 0;
  }
});

window.addEventListener("mousewheel", (e) => {
  e.preventDefault();
  let n = e.deltaY < 0 ? 0.1 : -0.1;
  scaleCamera(n);
});

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

setTimeout(() => {
  init();
}, 10);