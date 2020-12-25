const minimist = require("minimist");
const args = minimist(process.argv.slice(2));

const flags = {
  theme: args.theme || args.t,
  font: args.font || args.f,
  size: args.size || args.s,
  opacity: args.opacity || args.o,
};
if (flags.theme === undefined) {
  delete flags.theme;
}
if (flags.font === undefined) {
  delete flags.font;
}
if (flags.size === undefined) {
  delete flags.size;
}
if (flags.opacity === undefined) {
  delete flags.opacity;
}

module.exports = {
  args: flags,
};
