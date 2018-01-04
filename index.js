"use strict";

const nodewifi = require("node-wifi");
const os = require("os");

const movuinos = require("./lib/movuinos");
const usb = require("./lib/usb");
const wifi = require("./lib/wifi");
const websocket = require("./lib/websocket");

module.exports = movuinos;

module.exports.listen = function() {
  return Promise.all([usb.listen(), wifi.listen(), websocket.listen()]);
};

module.exports.unlisten = function() {
  return Promise.all([usb.unlisten(), wifi.unlisten(), websocket.unlisten()]);
};

function networkAdresses() {
  return (
    []
      .concat(
        ...Object.entries(os.networkInterfaces()).map(([iface, addresses]) => {
          return addresses.map(addr => Object.assign({}, addr, { iface }));
        })
      )
      // filter internal
      .filter(addr => {
        return !addr.internal;
      })
      // filter IPv6
      .filter(addr => {
        return addr.family === "IPv4";
      })
  );
}

module.exports.detectWifi = async () => {
  const [{ iface, address }] = networkAdresses();
  nodewifi.init({ iface });
  const [{ ssid }] = await nodewifi.getCurrentConnections();
  return { ssid, host: address, iface };
};
