"use strict";

let keys = {
  ArrowUp: 0,
  ArrowDown: 0,
  ArrowLeft: 0,
  ArrowRight: 0,
  KeyW: 0,
  KeyA: 0,
  KeyS: 0,
  KeyD: 0,
	Fire: 0,
  Space: 0,
  Slow: 0
};

let updateKeys = () => {
  for (let key in keys) {
    if (isKeyPressed(key)) fireKey(key);
  };
};

let isKeyPressed = (key) => {
  return (
    keys[key] === 1
  );
};

let lastEmp = 0;
let lastFire = 0;
let fireKey = (key) => {
  if (key === "Fire") {
    let last = Date.now() - lastFire;
    if (SHIP_BULLET_TYPE) {
      if (last >= 55/SPEED) {
        ship.fire();
        lastFire = Date.now();
      }
    } else {
      if (last >= 0/SPEED) {
        ship.fire();
        lastFire = Date.now();
      }
    }
  }
  else if (key === "Slow") {
    triggerSlowMotion();
  }
	/*else if (key === "Space") {
		let last = Date.now() - lastEmp;
		if (last >= 10/SPEED) {
			lastEmp = Date.now();
		} else return void 0;
		fire360(ship);
	}*/
  else {
    // move
    switch (key) {
      case "KeyW":
      case "ArrowUp":
        ship.moveUp();
        //if (ship.y - 1 >= 0) {
        //}
      break;
      case "KeyS":
      case "ArrowDown":
        ship.moveDown();
        //if ((ship.y + 1) * DIM < height) {
        //}
      break;
      case "KeyA":
      case "ArrowLeft":
        ship.moveLeft();
        //if (ship.x - 1 >= 0) {
        //}
      break;
      case "KeyD":
      case "ArrowRight":
        ship.moveRight();
        //if ((ship.x + 1) * DIM < width) {
        //}
      break;
    };
  }
};