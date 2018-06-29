#include <Arduino.h>
#include "Config.h"
#include "Router.h"
#include "Button.h"

void
Button::init(Config *c, Router *r) {
  config = c;
  router = r;
  // really implement this ? (and other options ?)
  // btnPressTimeThresh = config->getButtonHoldThreshold();
}

void
Button::update() {
  bool btn = digitalRead(pinBtn) == 0;
  unsigned long now = millis();

  if (btn && !btnOn) {
    btnOn = holding = true;
    lastBtnDate = now;
    state = ButtonPressed;
    router->onButtonEvent(state);
  } else if (!btn && btnOn) {
    btnOn = holding = false;

    // if (now - lastBtnDate > btnPressTimeThresh) {
    //   // do whatever on buttonRelease after time threshold
    // } else {
    //   // do whatever on buttonRelease before time threshold
    // }
    state = ButtonReleased;
    router->onButtonEvent(state);
  } else if (btnOn && holding && now - lastBtnDate > btnPressTimeThresh) {
    // do whatever on buttonHold until time threshold
    holding = false;
    state = ButtonHolding;
    router->onButtonEvent(state);
  } else {
    // return ButtonNone;
  }
}

ButtonState
Button::getState() {
  return state;
}
