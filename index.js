const minimist = require("minimist");
const path = require("path");
const fs = require("fs");

module.exports = () => {
  const args = minimist(process.argv.slice(2));

  const flags = {
    theme: args.theme || args.t,
    font: args.font || args.f,
    size: args.size || args.s,
    opacity: args.opacity || args.o,
  };
  console.log(flags);
  console.log(
    path.resolve(process.env.HOME, ".config/alacritty/alacritty.yml")
  );
  fs.open(
    path.resolve(process.env.HOME, ".config/alacritty/alacritty.yml"),
    "r",
    (error, data) => {
      console.log(error);
      console.log();
    }
  );
};
