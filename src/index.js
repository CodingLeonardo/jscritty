#!/usr/bin/env node

const Alacritty = require("./alacritty.js");
const { args } = require("./cli.js");

module.exports = () => {
  const alacritty = new Alacritty();
  alacritty.apply(args);
  alacritty.save();
};
