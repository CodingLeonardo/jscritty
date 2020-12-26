const { Command } = require("commander");
const program = new Command();

program.version("0.0.1");
program.name("JSCritty");
program.description(
  "CLI that allows you to change your Alacritty config with one command without editting the config file."
);

program.option("-t, --theme <theme>", "Change the theme of alacritty");
program.option("-f, --font <font>", "Change the font of alacritty");
program.option("-s, --size <size>", "Change the font size of alacritty");
program.option("-o, --opacity <opacity>", "Change the opacity of alacritty");
program.option("-p, --padding <cords...>", "Change the padding of alacritty");
program.option(
  "-O, --offset <cords...>",
  "Change offset, X is space between chars and Y is line height of alacritty"
);
program.option(
  "-l, --list <fonts, themes, all>",
  'List all available options from resource, default is "all"'
);
program.option(
  "-P, --print <config, fonts>",
  "Print the content of config files or themes by specifying their name of alacritty"
);

const {
  theme,
  font,
  size,
  opacity,
  padding,
  offset,
  list,
  print,
} = program.parse(process.argv);

const flags = {
  theme,
  font,
  size,
  opacity,
  padding: {
    x: padding ? Number(padding[0]) : undefined,
    y: padding ? Number(padding[1]) : undefined,
  },
  offset: {
    x: offset ? Number(offset[0]) : undefined,
    y: offset ? Number(offset[1]) : undefined,
  },
  list: list,
  print: print,
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
if (flags.list === undefined) {
  delete flags.list;
}
if (flags.print === undefined) {
  delete flags.print;
}

module.exports = {
  args: flags,
};
