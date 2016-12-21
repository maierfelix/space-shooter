let update = () => {
  updateKeys();
  updateDepth();
  updateParticles();
  updateStars();
  updateBullets();
  updateEntities();
  updateAsteroidCollisions();
  updateBulletCollisions();
  updateSlowMotion();
  requestAnimationFrame(() => {
    update();
  });
};

let updateSlowMotion = () => {
  if (SPEED === SLOWMOTION) {
    slowmoenergy -= SLOWMOTION_DECREASE;
    if (slowmoenergy <= 0) {
      slowmoenergy = 0;
      SPEED = DEFAULT_SPEED;
    }
    return void 0;
  }
  if (slowmoenergy + SLOWMOTION_INCREASE <= 100) {
    slowmoenergy += SLOWMOTION_INCREASE;
  }
};

let updateDepth = () => {
  depthSort(entities);
};

let updateParticles = () => {
  let length = particles.length;
  for (let ii = 0; ii < length; ++ii) {
    let particle = particles[ii];
    if (particle.frame + particle.tick > particle.frames) {
      if (particle.loop) {
        particle.frame = 0;
      } else {
        particles.splice(ii, 1);
        ii--; length--;
      }
    } else {
      particle.frame += particle.tick * (SPEED*2.5);
    }
  };
};

let updateStars = () => {
  for (let ii = 0; ii < stars.length; ++ii) {
    let star = stars[ii];
    star.update();
    updateEntityPosition(star);
  };
};

let updateBullets = () => {
  let length = bullets.length;
  for (let ii = 0; ii < length; ++ii) {
    let bullet = bullets[ii];
    bullet.update();
    let overlap = 512;
    // bullets outside view?
    if (!rectanglesOverlap(
      bullet.x, bullet.y, bullet.width, bullet.height,
      (-cx-overlap)/DIM, (-cy-overlap)/DIM, (width+overlap*2)/DIM, (height+overlap*2)/DIM
    )) {
      bullet.remove();
      ii--; length--;
      continue;
    }
    bullet.x += Math.cos(bullet.angle) * (bullet.velocity * SPEED);
    bullet.y += Math.sin(bullet.angle) * (bullet.velocity * SPEED);
  };
};

let updateEntities = () => {
  for (let ii = 0; ii < entities.length; ++ii) {
    let entity = entities[ii];
    entity.update();
    if (!(entity instanceof Ship)) {
      if (updateEntityPosition(entity)) {
        ii--; length--;
      }
    } else {
      updateShip(entity);
    }
  };
};

let updateShip = (entity) => {
  if (entity.magnetEnabled) {
    triggerShipMagnet(entity);
  }
  if (entity.shield !== null) {
    entity.shield.duration -= delta * 1e3;
    if (entity.shield.duration <= 0) {
      entity.shield.remove();
      entity.shield = null;
    }
  }
  if (entity instanceof Hunter) {
    let x = (entity.hunted.x * DIM) - (entity.x * DIM);
    let y = (entity.hunted.y * DIM) - (entity.y * DIM);
    let angle = Math.atan2(y, x);
    entity.angle = angle;
    entity.x += Math.cos(entity.angle) * ((entity.velocity * SPEED));
    entity.y += Math.sin(entity.angle) * ((entity.velocity * SPEED));
    if (circlesOverlap(entity, entity.hunted, entity.radius, entity.hunted.radius)) {
      entity.explodeByCollidment();
      entity.kill(entity.hunted);
    }
  }
};

let magnetify = (a, b) => {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  return (dist < a.magnetRadius + b.radius);
};

let triggerShipMagnet = (entity) => {
  for (let ii = 0; ii < entities.length; ++ii) {
    let attracted = entities[ii];
    if (attracted.uid === entity.uid) continue;
    if (!(attracted instanceof Coin)) continue;
    if (magnetify(entity, attracted)) {
      let x = (attracted.x * DIM) - (entity.x * DIM);
      let y = (attracted.y * DIM) - (entity.y * DIM);
      let angle = Math.atan2(y, x);
      attracted.angle = angle;
      let yy = Math.sin(attracted.angle) * ((entity.velocity));
      // increase magnet power if attracted from bottom
      // since items fall down -> decreases speed to top
      if (yy > 0) {
        yy *= FALLING_SPEED * entity.velocity;
      }
      attracted.x -= Math.cos(attracted.angle) * ((entity.velocity * SPEED));
      attracted.y -= yy * SPEED;
    }
  };
};

let updateAsteroidCollisions = () => {
  let length = entities.length;
  for (let ii = 0; ii < length; ++ii) {
    let entity = entities[ii];
    if (entity instanceof Ship) continue;
    if (rectanglesOverlap(
      ship.x, ship.y, ship.width, ship.height,
      entity.x, entity.y, entity.width, entity.height
    )) {
      entity.kill(ship);
      ii--; length--;
    }
  };
};

let updateBulletCollisions = () => {
  for (let ii = 0; ii < bullets.length; ++ii) {
    let bullet = bullets[ii];
    for (let jj = 0; jj < entities.length; ++jj) {
      let entity = entities[jj];
      if (circlesOverlap(bullet, entity, bullet.radius, entity.radius)) {
        if (entity instanceof Ship) {
          if (bullet.master.uid !== entity.uid) {
            bullet.kill(entity);
            if (entity.health <= 0) {
              entity.kill(bullet);
            }
          }
          continue;
        }
        bullet.kill(entity);
        entity.kill(bullet);
        break;
      }
    };
  };
};

let updateEntityPosition = (entity) => {
  entity.delay -= delta*1e3;
  if (entity.delay >= 0) {
    return (false);
  }
  if (entity.y+(cy/DIM) > (height+64)/DIM) {
    entity.remove();
    return (true);
  }
  entity.y += (FALLING_SPEED * entity.velocity) * SPEED;
  if (entity instanceof Pill) {
    entity.angle += 0.05 * SPEED;
  }
  else if (entity instanceof Coin) {
    entity.angle -= 0.075 * SPEED;
  }
  else if (!(entity instanceof Shield)) {
    entity.angle = 4.9;
  }
  return (false);
};