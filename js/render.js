let resize = () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
	ctx.imageSmoothingEnabled = true;
  if (ship) draw();
};

let clear = () => {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 3;
};

let render = () => {
  let now = Date.now();
  draw();
  delta = (now-last)/1e3;
  last = now;
  if (!FRAME_CAP) {
    setImmediate(() => {
      render();
    });
  } else if (FPS === 60) {
    requestAnimationFrame(() => {
      render();
    });
  } else {
    setTimeout(() => {
      render();
    }, 1e3/FPS);
  }
};

let draw = () => {
  clear();
  refreshCamera();
  //renderBackground();
  renderGrid();
  //renderBoundingBox();
  renderStars();
  renderBullets();
  renderEntities();
  renderParticles();
  renderBars();
  renderOverlays();
  renderStats();
};

let refreshCamera = () => {
  let entity = focusedEntity;
  if (entity === null) return void 0;
  let cdt = (CAMERA_SPEED*delta);
  let tcx = (-(entity.x + entity.width/2) * SCALE + (width / DIM)/2) * DIM;
  let tcy = (-(entity.y + entity.height/2) * SCALE + (height / DIM)/2) * DIM;
  // shooting recoils camera softly to the opposit direction
  if (isKeyPressed("Fire")) {
    rcx = -(Math.cos(entity.angle)*(RECOIL));
    rcy = Math.sin(-entity.angle)*(RECOIL);
  }
  rcx = lerp(rcx, 0, cdt*4);
  rcy = lerp(rcy, 0, cdt*4);
  ccx = lerp(ccx, tcx+rcx, cdt);
  ccy = lerp(ccy, tcy+rcy, cdt);
  if (shaking > 0) {
    shaking -= (delta*1e3)/250; // wat
    let a = saw(shaking / 1.0) * 1.0;
    scx = random(-a, a);
    scy = random(-a, a);
  } else {
    shaking |= 0;
  }
  cx = ccx + scx;
  cy = ccy + scy;
  refreshCameraScale();
};

let refreshCameraScale = () => {
  let cdt = (CAMERA_SPEED*delta) * SPEED;
  zcv = lerp(zcv, 0, cdt);
  scaleCamera(zcv);
};

let renderBackground = () => {

  let img = cache["bg.jpg_texture"].canvas;
  let ww = img.width;
  let hh = img.height;

  let sx = Math.floor(cx/ww)+1;
  let sy = Math.floor(cy/hh)+1;

  ctx.drawImage(
    img,
    cx, cy,
    ww, hh
  );

  ctx.drawImage(
    img,
    cx-(ww*sx), cy-(hh*sy),
    ww, hh
  );

  ctx.drawImage(
    img,
    cx+(ww*sx), cy,
    ww, hh
  );

  ctx.drawImage(
    img,
    cx, cy+(hh*sy),
    ww, hh
  );

};

let renderGrid = () => {

  let size = GRID_SIZE * SCALE;

  let xx = (cx % size) | 0;
  let yy = (cy % size) | 0;

  ctx.lineWidth = .25;
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineStyle = "dotted";
  ctx.setLineDash([1.5, 1.5]);

  ctx.beginPath();
  for (; xx < width; xx += size) {
    ctx.moveTo(xx, 0);
    ctx.lineTo(xx, height);
  };
  for (; yy < height; yy += size) {
    ctx.moveTo(0, yy);
    ctx.lineTo(width, yy);
  };
  ctx.stroke();
  ctx.closePath();

  ctx.setLineDash([0, 0]);

};

let renderBoundingBox = () => {
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.strokeRect(
    cx, cy,
    width * SCALE, height * SCALE
  );
  ctx.stroke();
  ctx.closePath();
};

let renderBars = () => {
  renderSlowMotionBar();
  renderHealthBar();
};

let renderSlowMotionBar = () => {

  let x = width - 35;
  let y = 10;
  let ww = 25;
  let radius = 50;
  let hh = height / 2;
  y = (height - y) - (radius / 2);

  let power = (hh/1e2)*slowmoenergy;
  let color = null;

  if (slowmoenergy < SLOWMOTION_MIN/2) {
    color = COLOR_RED;
  }
  else if (slowmoenergy <= SLOWMOTION_MIN) {
    color = COLOR_YELLOW;
  }
  else {
    color = COLOR_GREEN;
  }

  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(130,130,130,0.25)";
  ctx.arc(
    x, y,
    radius/2,
    -2*Math.PI,
    0,
    false
  );
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.arc(
    x, y,
    radius/2,
    -(slowmoenergy/50)*Math.PI,
    0,
    false
  );
  ctx.stroke();
  ctx.closePath();

  ctx.font = "42px Kenny";
  ctx.fillStyle = color;
  ctx.fillText("S", x-12, y+12);

};

let renderHealthBar = () => {

  let x = width / 4;
  let y = 15;
  let ww = width / 2;
  let hh = 25;

  let color = null;
  let health = (ww/1e2)*ship.health;

  ctx.beginPath();
  ctx.strokeStyle = "#313131";
  ctx.strokeRect(
    x, y,
    ww, hh
  );
  ctx.stroke();
  ctx.closePath();

  // padding
  x += 1;
  y += 1;
  ww -= 2;
  hh -= 2;

  ctx.beginPath();

  if (ship.health < 25) {
    color = COLOR_RED;
  }
  else if (ship.health < 50) {
    color = COLOR_ORANGE;
  }
  else if (ship.health < 75) {
    color = COLOR_YELLOW;
  }
  else {
    color = COLOR_GREEN;
  }

  ctx.fillStyle = color;
  ctx.fillRect(
    x, y,
    health-1, hh
  );

};

let renderOverlays = () => {
  if (healOverlayAlpha > 0) {
    ctx.globalAlpha = healOverlayAlpha;
    ctx.drawImage(
      heal.canvas,
      0, 0,
      width, height,
      0, 0,
      width, height
    );
    ctx.globalAlpha = 1;
    healOverlayAlpha -= delta;
  }
  if (dmgOverlayAlpha > 0) {
    ctx.globalAlpha = dmgOverlayAlpha;
    ctx.drawImage(
      damage.canvas,
      0, 0,
      width, height,
      0, 0,
      width, height
    );
    ctx.globalAlpha = 1;
    dmgOverlayAlpha -= delta;
  }
  ctx.drawImage(
    griddy.canvas,
    0, 0,
    width, height,
    0, 0,
    width, height
  );
};

let fps = 0;
let lastfps = 0;
let renderStats = () => {
  ctx.font = "12px KennyThin";
  ctx.fillStyle = "yellow";
  if (last > lastfps) {
    lastfps = last + 500;
    fps = roundTo(1.0/delta, 10);
  }
  ctx.fillText("FPS: " + fps, 10, 15);
  ctx.fillText("Speed: " + SPEED, 10, 30);
  ctx.fillText("Score: " + ship.score, 10, 45);
  ctx.fillText("Stars: " + stars.length, 10, 60);
  ctx.fillText("Bullets: " + bullets.length, 10, 75);
  ctx.fillText("Entities: " + (entities.length-1), 10, 90);
  ctx.fillText("Shaking: " + shaking, 10, 105);
  ctx.fillText(`Camera: x: ${-ccx|0}, y: ${-ccy|0}`, 10, 120);
	ctx.fillText("Score: " + ship.points, 10, 135);
  ctx.fillText("Scale: " + SCALE, 10, 150);
};

let renderParticles = () => {
  let ii = 0;
  let particle = null;
  let length = particles.length;
  for (; ii < length; ++ii) {
    particle = particles[ii];
    renderParticle(particle);
    if (particle.frame >= particle.frames) {
      particles.splice(ii, 1);
      ii--; length--;
    }
  };
};

let renderParticle = (particle) => {

  let entity = particle.entity;
  let frame = particle.frame;
  let texture = particle.texture.canvas;

  let frameWidth = 256;
  let frameHeight = 256;

  let framesPerRow = (texture.width/frameWidth);

  let scale = particle.scale * SCALE;

  let xx = cx + ((entity.x - (frameWidth/2)/DIM) * DIM) * SCALE;
  let yy = cy + ((entity.y - (frameHeight/2)/DIM) * DIM) * SCALE;

  let row = Math.floor(frame / framesPerRow);
  let column = Math.floor(frame % framesPerRow);

  ctx.drawImage(
    texture,
    column * frameWidth, row * frameHeight,
    frameWidth, frameHeight,
    xx, yy,
    frameWidth*scale, frameHeight*scale
  );

};

let renderStars = () => {
  let ii = 0;
  let length = stars.length;
  let entity = null;
  for (; ii < length; ++ii) {
    entity = stars[ii];
    ctx.globalAlpha = 0.6;
    renderEntity(entity);
    ctx.globalAlpha = 1.0;
  };
};

let renderBullets = () => {
  let ii = 0;
  let length = bullets.length;
  let bullet = null;
  for (; ii < length; ++ii) {
    bullet = bullets[ii];
    if (bullet instanceof Bullet) {
      renderEntity(bullet);
    }
    else if (bullet instanceof Laser) {
      renderLaser(bullet);
    }
  };
};

let renderLaser = (entity) => {

  ctx.beginPath();

  ctx.strokeStyle = "#FFF";
  ctx.lineWidth = 2 * SCALE;

  ctx.globalAlpha = 0.45;

  let texture = ship.texture.canvas;

  let x = (cx + ((ship.x + ((texture.width/DIM)/2)) * DIM) * SCALE);
  let y = (cy + ((ship.y + ((texture.height/DIM)/2)) * DIM) * SCALE);

  entity.angle += 0.05;

  ctx.moveTo(x, y);
  ctx.lineTo(x * (Math.cos(ship.angle) * DIM), y * (Math.sin(ship.angle) * DIM));
  entity.x += Math.cos(entity.angle);
  entity.y += Math.sin(entity.angle);
  ctx.stroke();

  // reset
  ctx.closePath();

  ctx.globalAlpha = 1.0;

};

let renderEntities = () => {
  let ii = 0;
  let length = entities.length;
  let entity = null;
  for (; ii < length; ++ii) {
    entity = entities[ii];
    if (entity.delay > 0) continue;
    renderEntity(entity);
  };
};

let renderEntity = (entity) => {

  let x = cx + ((entity.x + (entity.width / 2)) * DIM) * SCALE;
  let y = cy + ((entity.y + (entity.height / 2)) * DIM) * SCALE;

  let opacity = entity.opacity;

  let texture = entity.texture.canvas;

  let rad = entity.angle-30;
  let sin = Math.sin(rad);
  let cos = Math.cos(rad);

  if (opacity !== 1) ctx.globalAlpha = opacity;

  ctx.setTransform(cos, sin, -sin, cos, x, y);
  if (SHOW_COLLISIONS === true) {
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.arc(
      0, 0,
      (entity.radius*DIM)*SCALE,
      0,
      Math.PI * 2,
      true
    );
    ctx.stroke();
    ctx.closePath();
  }
  let sprite = entity.sprite.canvas;
  ctx.drawImage(
    sprite,
    0, 0,
    sprite.width, sprite.height,
    -(sprite.width/2)*SCALE, -(sprite.height/2)*SCALE,
    sprite.width*SCALE, sprite.height*SCALE
  );
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (opacity !== 1) ctx.globalAlpha = 1;

};