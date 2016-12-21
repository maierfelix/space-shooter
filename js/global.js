"use strict";

let canvas = game;
let ctx = canvas.getContext("2d");

let uid = 0;
let delta = 0;

let last = Date.now();

let cx = 0;
let cy = 0;
let ccx = 0;
let ccy = 0;
let scx = 0;
let scy = 0;
let rcx = 0;
let rcy = 0;
let zcv = 0;

let width = 0;
let height = 0;

let ship = null;

let slowmoenergy = 100;

let stars = [];
let bullets = [];
let entities = [];
let particles = [];

let cache = {};

let SHIP_BULLET_TYPE = true;

let heal = null;
let griddy = null;
let damage = null;

let focusedEntity = null;

let shaking = 0;
let shakingPower = 0;

let dmgOverlayAlpha = 0;
let healOverlayAlpha = 0;

let killStreak = 0;
let killStreakTimeout = 0;