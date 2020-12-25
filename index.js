const Alacritty = require("./src/alacritty.js");
const { args } = require("./src/cli.js");

module.exports = () => {
  const alacritty = new Alacritty();
  alacritty.apply(args);
  alacritty.save();
};
