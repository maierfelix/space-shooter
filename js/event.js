"use strict";

let randSpawn = () => {
  return (Math.random() * SPAWN_RATE);
};

let updateEvents = () => {
  if (randSpawn() < SPAWN_RATE_HEAL_PACKAGE) {
    let pkg = new Package(createDefaultAsteroid());
    entities.push(pkg);
  }
  if (randSpawn() < SPAWN_RATE_COINS_SILVER) {
    if (Math.random() < SPAWN_RATE_COINS_GOLD) {
      entities.push(spawnGoldCoin());
    } else {
      entities.push(spawnSilverCoin());
    }
  }
  let hunterCount = getHunterAmount();
  if (hunterCount < SPAWN_MAX_HUNTER_COUNT && randSpawn() < SPAWN_RATE_HUNTERS) {
    let hunter = spawnHunter(ship);
    entities.push(hunter);
  }
  if (randSpawn() < SPAWN_RATE_PILL) {
    let pill = new Pill(createDefaultAsteroid());
    entities.push(pill);
  }
  if (randSpawn() < SPAWN_RATE_MAGNET) {
    let mg = new Magnet(createDefaultAsteroid());
    entities.push(mg);
  }
  if (randSpawn() < SPAWN_RATE_SHIELD) {
    let entity = new Shield(createDefaultAsteroid());
    entities.push(entity);
  }
  updateHunters();
};

let getHunterAmount = () => {
  let count = 0;
  for (let ii = 0; ii < entities.length; ++ii) {
    if (entities[ii] instanceof Hunter) count++;
  };
  return (count);
};

let updateHunters = () => {
  for (let ii = 0; ii < entities.length; ++ii) {
    let entity = entities[ii];
    if (!(entity instanceof Hunter)) continue;
    if (entity.canFire && Math.random() < HUNTER_FIRE_RATE) {
      entity.fire();
    }
  };
};