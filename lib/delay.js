"use strict";

// eslint-disable-next-line func-names
module.exports = function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};
