"use strict";

let createCanvasBuffer = (width, height) => {
  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return (canvas.getContext("2d"));
};

let generateOverlays = () => {
  heal = generateHealthOverlay(HEALTH_OVERLAY_COLOR);
  damage = generateHealthOverlay(DAMAGE_OVERLAY_COLOR);
  griddy = generateGridOverlay();
};

let generateHealthOverlay = (color) => {
  let xx = width*1.5;
  let yy = height*1.5;
  let buffer = createCanvasBuffer(width, height);

  buffer.fillStyle = color;
  buffer.fillRect(
    0, 0,
    width, height
  );

  buffer.shadowBlur = width*2;
  buffer.shadowOffsetX = width*2;
  buffer.shadowOffsetY = height*2;

  buffer.globalCompositeOperation = "destination-out";
  buffer.fillStyle = color;
  buffer.shadowColor = color;

  buffer.beginPath();
  buffer.arc(-xx,-yy,width/1.75,0,Math.PI*2,true);
  buffer.fill();
  buffer.stroke();
  buffer.closePath();
  return (buffer);
};

let generateGridOverlay = () => {
  let buffer = createCanvasBuffer(width, height);
  let size = 3;
  let xx = 0;
  let yy = 0;
  buffer.strokeStyle = GRID_STYLE_COLOR;
  buffer.lineWidth = GRID_STYLE_WIDTH;
  buffer.beginPath();
  for (; xx < width; xx += size) {
    buffer.moveTo(xx, 0);
    buffer.lineTo(xx, height);
  };
  for (; yy < height; yy += size) {
    buffer.moveTo(0, yy);
    buffer.lineTo(width, yy);
  };
  buffer.stroke();
  buffer.closePath();
  return (buffer);
};

let generateSprite = (texture, lighting) => {

  let width = lighting.canvas.width;
  let height = lighting.canvas.height;
  let buffer = createCanvasBuffer(width, height);

  buffer.drawImage(
    lighting.canvas,
    0, 0,
    width, height
  );
  buffer.drawImage(
    texture.canvas,
    (width/2)/2, (height/2)/2,
    width/2, height/2
  );

  return (buffer);

};

let generateTexture = (img) => {
  let buffer = createCanvasBuffer(img.width, img.height);
  buffer.drawImage(
    img,
    0, 0,
    img.width, img.height
  );
  return (buffer);
};

let generateLighting = (img, blur, color) => {

  let width = img.width;
  let height = img.height;

  let buffer = createCanvasBuffer(width*2, height*2);

  buffer.drawImage(
    img,
    0, 0,
    -width, -height
  );

  buffer.shadowColor=color;
  buffer.shadowBlur = blur;
  buffer.shadowOffsetX = -width*2;
  buffer.shadowOffsetY = -height*2;

  buffer.drawImage(
    img,
    width*2.5, height*2.5,
    width, height
  );

  return (buffer);

};

let colorizeImageData = (data, r, g, b) => {
  let ii = 0;
  let idx = 0;
  let length = data.length;
  for (; ii < length / 4; ++ii) {
    idx = ii * 4;
    if (data[idx] > 0) {
      data[idx] = r;
    }
    if (data[++idx] > 0) {
      data[idx] = g;
    }
    if (data[++idx] > 0) {
      data[idx] = b;
    }
  };
};