const { Command } = require("commander");
const program = new Command();
program.version("0.0.1");

program
  .name("JSCritty")
  .option("-t, --theme [theme]", "Change the theme of alacritty")
  .option("-f, --font [font]", "Change the font of alacritty")
  .option("-s, --size [size]", "Change the font size of alacritty")
  .option("-o, --opacity [opacity]", "Change the opacity of alacritty")
  .option("-p, --padding [x] [y]", "Change the padding of alacritty")
  .option(
    "-O, --offset [x] [y]",
    "Change offset, X is space between chars and Y is line height of alacritty"
  );

const { theme, font, size, opacity, padding, offset } = program.parse(
  process.argv
);

// console.log(program.opts());
// console.log(program.args);

const flags = {
  theme,
  font,
  size,
  opacity,
  padding: {
    x: padding,
    y: offset ? undefined : program.args[0],
  },
  offset: {
    x: offset,
    y: padding ? undefined : program.args[0],
  },
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
if (flags.padding.x === undefined && flags.padding.y === undefined) {
  delete flags.padding;
}
if (flags.offset.x === undefined && flags.offset.y === undefined) {
  delete flags.offset;
}

console.log(flags);

module.exports = {
  args: flags,
};
