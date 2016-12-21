"use strict";

let ressources = [
  //"img/bg.jpg",
  "img/plasma.png",
  "img/explosion_1.png",
  "img/explosion_2.png",
  "img/ship.png",
  "img/enemy.png",
  "img/enemy2.png",
  "img/asteroid.png",
  "img/powerup_volt.png",
  "img/pill_blue.png",
  "img/star_gold.png",
  "img/star_silver.png",
  "img/shield_silver.png",
  "img/magnet_yellow.png",
  "img/shield_bronze.png",
  "img/explosion_shield.png",
  "img/laser1.png"
];

let GET = (url, resolve) => {
	let x = new XMLHttpRequest();
  x.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      resolve(this.responseText);
    }
  };
  x.open("GET", url, true);
  x.send();
};

let init = () => {
  resize();
  generateOverlays();
	loadSprites(ressources).then((data) => {
		addLocalShip();
		addStars(STAR_AMOUNT);
    let eventLoop = () => {
      updateEvents();
      setTimeout(() => {
        eventLoop();
      }, (1e3/FPS)/SPEED);
    };
    eventLoop();
    update();
		render();
	});
};

let loadSprites = (array) => {
	let ii = 0;
  let idx = 0;
	let length = array.length;
	return new Promise((resolve) => {
		for (; ii < length; ++ii) {
			let img = new Image();
			img.onload = (function(ii) {
        return function() {
  				let name = getFileName(array[ii]);
          let texture = generateTexture(img);
          let lighting = generateLighting(img, 16, "#fff");
          let sprite = generateSprite(texture, lighting);
          cache[name + "_sprite"] = sprite;
          cache[name + "_texture"] = texture;
          cache[name + "_lighting"] = lighting;
  				if (++idx >= length) resolve();
        };
			})(ii);
      img.src = array[ii] + "?" + Date.now();
		};
	});
};

let getFileName = (str) => {
  let pos = str.lastIndexOf("/")+1;
  let name = str.substring(pos, str.length).replace(".png", "");
  return (name);
};

let addLocalShip = () => {
  let entity = new Ship({
    x: (width/2)/DIM,
    y: (height/2)/DIM,
    velocity: LOCAL_SHIP_VELOCITY,
    health: LOCAL_SHIP_DEFAULT_HEALTH
  });
  ship = entity;
  entity.magnetEnabled = true;
  entity.local = true;
  focusEntity(entity);
  entities.push(entity);
};

let addStars = (limit) => {
  let idx = 0;
  while (idx++ < limit) {
    let entity = new Star({
      hidden: true,
      width: 16, height: 16,
      delay: (Math.random() * 1e4)
    });
    entity.respawn = true;
    stars.push(entity);
  };
};

let addAsteroids = (limit) => {
  let idx = 0;
  while (idx++ < limit) {
    let entity = createDefaultAsteroid();
    entity.respawn = true;
    entities.push(entity);
  };
};

let createDefaultAsteroid = () => {
  return (spawnAsteroid({
    delay: (Math.random() * 1e4)
  }));
};

let spawnAsteroid = (obj) => {
  return(new Asteroid({
    hidden: true,
    width: 16, height: 16,
    delay: obj.delay || 0
  }));
};

let spawnSuicideHunter = (hunted) => {
  let hunter = new SuicideHunter({});
  hunter.hunted = hunted;
  hunter.hidden = true;
  hunter.canFire = false;
  hunter.velocity = Math.random() + 0.75;
  hunter.setTexture("enemy2");
  return (hunter);
};

let spawnHunter = (hunted) => {
  return (new Hunter({
    hunted: hunted,
    width: 8,
    height: 8,
    velocity: 0.25,
    hidden: true
  }));
};

let spawnSilverCoin = () => {
  let coin = new Coin(createDefaultAsteroid());
  return (coin);
};

let spawnGoldCoin = () => {
  let coin = spawnSilverCoin();
  coin.setTexture("star_gold");
  coin.points *= 2;
  return (coin);
};

let shakeCamera = (power) => {
  shaking = power;
};

let focusEntity = (entity) => {
  focusedEntity = entity;
};

let scaleCamera = (n) => {

  if (SCALE + n <= MIN_SCALE) return void 0;
  if (SCALE + n >= MAX_SCALE) return void 0;

  let scale = SCALE;
  SCALE += n;

  // fixed zoom on entity
  ccx -= ((focusedEntity.x * DIM)) * (zoomScale(SCALE) - zoomScale(scale));
  ccy -= ((focusedEntity.y * DIM)) * (zoomScale(SCALE) - zoomScale(scale));

};

let oscale = 0;
let nscale = 0;
let zoomCamera = (n) => {
  oscale = n;
  zcv = n;
  nscale = SCALE + n;
};

let showHealOverlay = (power) => {
  healOverlayAlpha = power;
};

let showDamageOverlay = (power) => {
  dmgOverlayAlpha = power;
};

let restart = () => {
  stars = [];
  bullets = [];
  entities = [];
  particles = [];
  addLocalShip();
};

let triggerSlowMotion = () => {
  if (slowmoenergy >= SLOWMOTION_MIN) {
    SPEED = SLOWMOTION;
  }
};

/*let idx = 0;
setInterval(() => {
  if (idx++ >= 360) idx = 0;
  document.body.style.background = `radial-gradient(ellipse at bottom, hsl(${idx}, 100%, 27%) 0%, #020512 100%)`;
}, 1);*/

let fire360 = (entity) => {
  let obj = {
    master: entity,
    x: entity.x,
    y: entity.y,
    angle: 0,
    velocity: 1,
    width: 8.0,
    height: 8.0
  };
  let bullet = null;
  let angle = 0;
  while (angle < 360) {
    bullet = new Bullet(obj);
    bullet.angle = angle;
    bullet.velocity *= 2;
    bullet.light = null;
    bullets.push(bullet);
    angle += 3;
  };
};