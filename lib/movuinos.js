"use strict";

const EventEmitter = require("events");
const pEvent = require("p-event");

const movuinos = new EventEmitter();
movuinos.movuinos = [];
movuinos.promise = function(...args) {
  return pEvent(this, ...args);
};

module.exports = movuinos;
