"use strict";

let lerp = (v0, v1, t) => {
  return (v0*(1-t)+v1*t);
};

let roundTo = (a, b) => {
  let n = 1/b;
  return (Math.round(a*n)/n);
};

let random = (a, b) => {
  return (
    Math.floor(a + Math.random() * Math.abs(b - a + 1))
  );
};

let saw = (t) => {
  if (t < 0.5) {
    return (t / 0.5);
  } else {
    return (1 - (t - 0.5) / 0.5);
  }
};

let rectanglesOverlap = (x1, y1, w1, h1, x2, y2, w2, h2) => {
  return !(
    x1 + w1 - 1 < x2 ||
    y1 + h1 - 1 < y2 ||
    x1 > x2 + w2 - 1 ||
    y1 > y2 + h2 - 1
  );
};

let circlesOverlap = (a, b, ar, br) => {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  return (dist < ar + br);
};

let pointIntersectsEntity = (x, y, entity) => {
  return (
    x >= entity.x &&
    x < entity.x + entity.width &&
    y >= entity.y &&
    y < entity.y + entity.height
  );
};

let zoomScale = (n) => {
  return (
    n >= 0 ? n + 1 :
    n < 0 ? -(n) + 1 :
    n + 1
  );
};

let depthSort = (array) => {

  let key = null;

  let length = array.length;

  let jj = 0;
  for (let ii = 0; ii < length; ++ii) {
    jj = ii;
    key = array[jj];
    for (; jj > 0 && array[jj - 1].y > key.y; --jj) {
      array[jj] = array[jj - 1];
    };
    array[jj] = key;
  };

};