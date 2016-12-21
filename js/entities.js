"use strict";

class Entity {

  constructor(obj) {
    this.uid = ++uid;
    this.lifetime = 0;
    this.x = obj.x || 0;
    this.y = obj.y || 0;
    this.mx = 0;
    this.my = 0;
    this.canFire = false;
    this.angle = obj.angle || 0;
    this.radius = obj.radius || 0;
    this.width = obj.width || 0;
    this.height = obj.height || 0;
    this.scale = obj.scale || 1;
    this.opacity = 1;
    this.delay = obj.delay || 0;
    this.color = "#fff";
    this.health = obj.health || 100;
    this.light = obj.light !== void 0 ? obj.light : true;
    this.texture = null;
    this.hidden = obj.hidden || false;
    this.respawn = obj.respawn || false;
    this.velocity = obj.velocity || 0.25;
    this.magnetTimer = 0;
		this.points = 0;
    this.shield = null;
    this.magnetEnabled = obj.magnet || false;
    if (this.hidden) {
      let bx = -cx/DIM;
      let by = -cy/DIM;
			if (!(this instanceof Hunter)) {
        this.x = random(bx, (-cx+width)/DIM);
        this.y = by;
			} else {
				this.x = random(bx, (-cx+width)/DIM);
				this.y = random(by, (-cy+height)/DIM);
				if (Math.random() < .5) {
					this.x = Math.random() < .5 ? bx : (-cx+width)/DIM;
				} else {
					this.y = Math.random() < .5 ? by : (-cy+height)/DIM;
				}
			}
    }
    if (obj.texture !== void 0) {
      if (obj.texture instanceof CanvasRenderingContext2D) {
        this.texture = obj.texture;
      } else {
        this.setTexture(obj.texture);
      }
    }
  }

  isLocalPlayer() {
    return (this.uid === ship.uid);
  }

  receivePointsFrom(entity) {

  }

  setTexture(key) {
    this.sprite = cache[key + "_sprite"];
    this.texture = cache[key + "_texture"];
    this.lighting = cache[key + "_lighting"];
    if (!(this instanceof Particle)) {
      this.width = this.texture.canvas.width / DIM;
      this.height = this.texture.canvas.height / DIM;
    }
    this.radius = Math.sqrt((this.width)**2 + (this.height)**2) * 0.25;
    this.magnetRadius = this.radius * MAGNET_RADIUS;
    if (this instanceof Bullet) {
      this.radius /= 1.5;
    } else if (this instanceof Package) {
      this.radius *= 1.5;
    }
  }

  setHealth(x) {
    if (x < 0) {
      if (this.shield !== null) {
        this.health += x / this.shield.decrease;
      } else {
        this.health += x;
      }
      if (this.health <= 0) {
        if (!this.dead) {
          this.die();
          this.dead = true;
        }
      } else {
        if (this.isLocalPlayer()) {
          showDamageOverlay(1.35);
          shakeCamera(3.0);
        }
      }
    } else {
      this.health += x;
      if (this.health > 100) this.health = 100;
    }
  }

  die() {
    if (this.uid === ship.uid) {
      restart();
    } else {
      this.kill();
    }
  }

  kill() {
    this.remove();
  }

  explode(entity) {
    let particle = new Particle({
      entity: this,
      loop: false,
      width: 256,
      height: 256,
      tick: 1,
      frame: 0,
      frames: 25,
      speed: 1
    });
    if (entity.shield !== null) {
      particle.setTexture("explosion_shield");
      particles.push(particle);
      return void 0;
    }
    particle.setTexture("explosion_2");
    particles.push(particle);
  }

  remove() {
    if (this.respawn) {
      let ctor = Object.getPrototypeOf(this).constructor;
      let entity = new ctor(this);
      if (this instanceof Star) {
        stars.push(entity);
      } else if (this instanceof Bullet) {
        bullets.push(entity);
      } else {
        entities.push(entity);
      }
    }
    if (this instanceof Star) {
      this.removeStar();
    }
    else if (this instanceof Bullet) {
      this.removeBullet();
    }
    else if (this instanceof Entity) {
      this.removeEntity();
    }
    else {
      throw new Error("Cannot kill entity " + this.uid + "!");
    }
  }

  removeStar() {
    for (let ii = 0; ii < stars.length; ++ii) {
      if (stars[ii].uid === this.uid) {
        stars.splice(ii, 1);
        break;
      }
    };
  }

  removeEntity() {
    for (let ii = 0; ii < entities.length; ++ii) {
      if (entities[ii].uid === this.uid) {
        entities.splice(ii, 1);
        break;
      }
    };
  }

  removeBullet() {
    for (let ii = 0; ii < bullets.length; ++ii) {
      if (bullets[ii].uid === this.uid) {
        bullets.splice(ii, 1);
        break;
      }
    };
  }

  update() {
    let frt = FRICTION*SPEED;
    this.x += this.mx * frt;
    this.y += this.my * frt;
    this.mx = lerp(this.mx, 0, frt);
    this.my = lerp(this.my, 0, frt);
    this.lifetime += delta;
    this.updateMagnetTimer();
    if (this.shield !== null) {
      this.updateShield();
    }
  }

  updateShield() {
    /*
    let shield = this.shield;
    shield.angle += 0.05;

    let target = this;
    let radius = target.radius*2.5;

    shield.x = (target.x) + radius * Math.cos(shield.angle);
    shield.y = (target.y) + radius * Math.sin(shield.angle);
    */
    this.shield.color += 4*SPEED;
    if (this.shield.color >= 360) this.shield.color = 0;
  }

  updateMagnetTimer() {
    let x = delta * 1e3;
    if (this.magnetTimer - x <= 0) {
      this.magnetTimer = 0;
      this.magnetEnabled = false;
    } else {
      this.magnetTimer -= x;
      this.magnetEnabled = true;
    }
  }

  moveUp() {
    this.my -= this.velocity * SPEED;
  }
  moveDown() {
    this.my += this.velocity * SPEED;
  }
  moveLeft() {
    this.mx -= this.velocity * SPEED;
  }
  moveRight() {
    this.mx += this.velocity * SPEED;
  }

};

class Particle extends Entity {
  constructor(obj) {
    super(obj);
    this.loop = obj.loop || false;
    this.tick = obj.tick || 1;
    this.speed = obj.speed || 1;
    this.frame = obj.frame || 0;
    this.frames = obj.frames || 1;
    this.entity = obj.entity || null;
  }
};

class Bullet extends Entity {
  constructor(obj) {
    super(obj);
    this.master = obj.master || null;
		this.setTexture("plasma");
    this.color = obj.color || "yellow";
  }
  kill(entity) {
    if (entity.invulnurable) return void 0;
    // prevent hunters from destroying each other
    if (entity instanceof Hunter && this.master instanceof Hunter) {
      return void 0;
    }
    // prevent pill bullets from killing local player
    if (this.master instanceof Pill && entity.isLocalPlayer()) {
      return void 0;
    }
    if (this.master.isLocalPlayer()) {
      shakeCamera(2.5);
    }
    entity.setHealth(-5);
    entity.explode(entity);
    this.removeBullet();
  }
};

class Railgun extends Bullet {
  constructor(obj) {
    super(obj);
    this.color = "green";
  }
};

class Asteroid extends Entity {
  constructor(obj) {
    super(obj);
    this.angle = 0;
    this.respawn = obj.respawn || false;
    this.setTexture("asteroid");
    this.color = "white";
  }
  kill(entity) {
    if (entity instanceof Ship) {
      entity.setHealth(5);
      this.remove();
    }
    else if (entity instanceof Bullet) {
      this.remove();
    }
  }
};

class Enemy extends Asteroid {
  constructor(obj) {
    super(obj);
    this.delay = 0;
    this.color = "red";
    this.setTexture("ship");
  }
};

class Star extends Asteroid {
  constructor(obj) {
    super(obj);
    this.pulse = 0;
  }
}

class Ship extends Entity {

  constructor(obj) {
    super(obj);
    this.score = 0;
    this.color = obj.color || "#fd00d2";
    this.setTexture("ship");
  }

  fire() {
    if (this.isLocalPlayer()) {
      shakeCamera(1.0);
    }
    if (SHIP_BULLET_TYPE) {
      this.fireBullet();
    } else {
      this.fireRailgun();
    }
  }

  fireBullet() {
		let obj = {
      color: this.color,
      master: this,
      x: this.x - 4,
      y: this.y - 4,
      angle: this.angle,
      velocity: 1
    };
    let bullet = null;
		bullet = new Bullet(obj);
    bullets.push(bullet);
		obj.angle += 0.075;
		bullet = new Bullet(obj);
    bullets.push(bullet);
		obj.angle -= 0.15;
		bullet = new Bullet(obj);
    bullets.push(bullet);
  }

  fireLaser() {
    let obj = {
      x: this.x - 4,
      y: this.y - 4,
      angle: this.angle
    };
    let laser = new Laser(obj);
    laser.master = this;
    bullets.push(laser);
  }

  fireRailgun() {
    let bullet = new Railgun({
      master: this,
      x: this.x,
      y: this.y + 1,
      angle: this.angle,
      velocity: 1.25
    });
    bullets.push(bullet);
  }

  explodeByCollidment() {
    let particle = new Particle({
      entity: this,
      loop: false,
      width: 256,
      height: 256,
      tick: 1,
      frame: 0,
      frames: 25,
      speed: 1,
      texture: "explosion_1"
    });
    particles.push(particle);
  }

};

class Laser extends Entity {
  constructor(obj) {
    super(obj);
  }
}

class Hunter extends Ship {
  constructor(obj) {
    super(obj);
    this.canFire = true;
    this.setTexture("enemy");
    this.hunted = obj.hunted;
  }

  kill(entity) {
    let idx = 0;
    let count = 8;
    while (idx++ < count) {
      if (Math.random() < .5) continue;
      let entity = spawnSuicideHunter(ship);
      entity.x = this.x + random(-3.5, 3,5);
      entity.y = this.y + random(-3.5, 3,5);
      entities.push(entity);
    };
    if (entity) {
      // give random reward drop
      if (entity instanceof Bullet && entity.master.isLocalPlayer()) {
        let coin = spawnGoldCoin();
        coin.x = this.x;
        coin.y = this.y;
        entities.push(coin);
      }
      entity.setHealth(-7.5);
    }
    this.remove();
  }

};

class SuicideHunter extends Hunter {
  constructor(obj) {
    super(obj);
    this.invulnurable = false;
    this.health = 1;
    /*setTimeout(() => {
      this.invulnurable = false;
    }, 250);*/
  }
  fire() {

  }
  kill(entity) {
    if (entity) {
      entity.setHealth(-1.5);
    }
    this.remove();
  }
}

class Coin extends Enemy {
  constructor(obj) {
    super(obj);
		this.points = 1;
    this.setTexture("star_silver");
  }
  kill(entity) {
    if (!(entity instanceof Bullet)) {
      entity.points += this.points;
    }
    this.remove();
  }
}

class Package extends Enemy {
  constructor(obj) {
    super(obj);
    this.weight = 25;
    this.setTexture("powerup_volt");
  }
  kill(entity) {
    if (!entity) {
      this.remove();
      return void 0;
    }
    if (entity instanceof Ship) {
      entity.setHealth(this.weight);
      if (entity.isLocalPlayer()) {
        showHealOverlay(1.35);
      }
    }
    this.remove();
  }
};

class Pill extends Package {
  constructor(obj) {
    super(obj);
    this.setTexture("pill_blue");
  }
  kill(entity) {
    if (!entity) {
      this.remove();
      return void 0;
    }
    if (entity instanceof Ship || entity.master instanceof Pill) {
      fire360(this);
    }
    this.remove();
  }
};

class Magnet extends Package {
  constructor(obj) {
    super(obj);
    this.setTexture("magnet_yellow");
  }
  kill(entity) {
    if (entity instanceof Ship && entity.isLocalPlayer()) {
      entity.magnetTimer += MAGNET_DURATION;
    }
    this.remove();
  }
};

class Shield extends Package {
  constructor(obj) {
    super(obj);
    this.angle = 4.9;
    this.color = 0;
    this.duration = SHIELD_BRONZE_DURATION;
    this.decrease = SHIELD_BRONZE_DECREASE_FACTOR;
    this.setTexture("shield_bronze");
  }
  kill(entity) {
    if (entity instanceof Ship && entity.isLocalPlayer()) {
      if (entity.shield !== null) {
        // only renew shield if new shield's duration is higher
        // than the current active one
        if (entity.shield !== this && entity.shield.duration <= this.duration) {
          this.angle = entity.shield.angle;
          entity.shield.remove();
          entity.shield = null;
          entity.shield = this;
        }
      } else {
        entity.shield = this;
      }
    }
    this.remove();
  }
};