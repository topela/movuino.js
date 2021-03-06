"use strict";

const osc = require("osc");
const serialport = require("serialport");

const MOVUINO_VENDOR_ID = "10c4";
const MOVUINO_PRODUCT_ID = "ea60";

function isMovuino({ vendorId = "", productId = "" }) {
  return (
    vendorId.toLowerCase() === MOVUINO_VENDOR_ID &&
    productId.toLowerCase() === MOVUINO_PRODUCT_ID
  );
}

module.exports.listMovuinos = async function() {
  const devices = await serialport.list();
  return devices.filter(device => isMovuino(device));
};

module.exports.attach = function(comName) {
  return new Promise((resolve, reject) => {
    const port = new osc.SerialPort({
      devicePath: comName,
      bitrate: 115200
    });
    port.once("ready", () => {
      resolve(port);
    });
    port.once("error", reject);
    port.open();
  });
};

module.exports.detach = function(OSCSerialPort) {
  return new Promise(resolve => {
    OSCSerialPort.once("close", resolve);
    OSCSerialPort.close();
  });
};

function rpc(OSCSerialPort, address, args) {
  return new Promise((resolve, reject) => {
    const messageListener = message => {
      if (message.address !== address) {
        return;
      }
      resolve(message.args);
      OSCSerialPort.removeListener("message", messageListener);
      OSCSerialPort.removeListener("error", reject);
    };

    OSCSerialPort.once("error", reject);

    OSCSerialPort.on("message", messageListener);

    OSCSerialPort.send({
      address,
      args
    });
  });
}
module.exports.rpc = rpc;

module.exports.getId = function(OSCSerialPort) {
  return rpc(OSCSerialPort, "/get/id").then(([id]) => id);
};
