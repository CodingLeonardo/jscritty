import { ArgumentParser, SUPPRESS } from "argparse";
import { Command } from "commander";
import * as chalk from "chalk";
import * as fs from "fs";
import { getVersion } from "./utils/getVersion";
import { execSync } from "child_process";

const version = getVersion();
const log = console.log;

const jscritty = new ArgumentParser({
  prog: "jscritty",
  description:
    "CLI that allows you to change your Alacritty config with one command without editting the config file.",
  argument_default: SUPPRESS,
});

jscritty.add_argument("-v", "--version", {
  action: "version",
  version: version,
});

jscritty.add_argument("-t", "--theme", {
  dest: "theme",
  metavar: "THEME",
  help: "Change the theme, choose from ~/.config/alacritty/themes",
});

jscritty.add_argument("-f", "--font", {
  dest: "font",
  metavar: "FONT",
  help: "Change font family, choose from ~/.config/alacritty/fonts.yaml",
});

jscritty.add_argument("-s", "--size", {
  dest: "size",
  type: "float",
  metavar: "SIZE",
  help: "Change the font size",
});

jscritty.add_argument("-o", "--opacity", {
  dest: "opacity",
  type: "float",
  metavar: "OPACITY",
  help: "Change the opacity",
});

jscritty.add_argument("-p", "--padding", {
  dest: "padding",
  type: "int",
  metavar: ["X", "Y"],
  nargs: 2,
  help: "Change the padding",
});

jscritty.add_argument("-O", "--offset", {
  dest: "offset",
  type: "int",
  metavar: ["X", "Y"],
  nargs: 2,
  help: "Change the offset",
});

jscritty.add_argument("-l", "--list", {});

jscritty.add_argument("-P", "--print", {});

const subparsers = jscritty.add_subparsers({
  title: "subcommands",
  dest: "subcommand",
});

const flags = jscritty.parse_args();

export const args = {
  ...flags,
};

/*
const jscritty = new Command("jscritty");

jscritty.version(version);
jscritty.description(
  "CLI that allows you to change your Alacritty config with one command without editting the config file."
);

jscritty.option("-t, --theme <theme>", "Change the theme of alacritty");

jscritty.option("-f, --font <font>", "Change the font of alacritty");

jscritty.option("-s, --size <size>", "Change the font size of alacritty");

jscritty.option("-o, --opacity <opacity>", "Change the opacity of alacritty");

jscritty.option("-p, --padding <cords...>", "Change the padding of alacritty");

jscritty.option(
  "-O, --offset <cords...>",
  "Change offset, X is space between chars and Y is line height of alacritty"
);

jscritty.option(
  "-l, --list <fonts, themes, all>",
  'List all available options from resource, default is "all"'
);

jscritty.option(
  "-P, --print <config, fonts>",
  "Print the content of config files or themes by specifying their name of alacritty"
);
*/
/*
jscritty
  .command("install <font>")
  .option("--force", "Force Install Nerd Font")
  .description("Install Nerd Font");
  .action((font, { force }) => {
    const URL =
      "https://github.com/ryanoasis/nerd-fonts/releases/download/v2.1.0";
    const cachePath: string = `${process.env.HOME}/.cache/jscritty`;
    const fontFilePath: string = `${process.env.HOME}/.cache/jscritty/${font}.zip`;
    const fontsPath: string = `${process.env.HOME}/.local/share/fonts/nerdfonts`;
    log(font);

    if (!fs.existsSync(fontFilePath) || force) {
      fs.rmSync(fontFilePath);
      execSync(`wget ${URL}/${font}.zip -P ${cachePath}`);
    }

    execSync(`unzip -o ${cachePath}/${font}.zip -d ${fontsPath}`);
    execSync("fc-cache -fv");

    log(chalk.blue(`${font} installed`));
  });


const { theme, font, size, opacity, padding, offset, list, print } =
  jscritty.parse(process.argv);

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

export const args = {
  ...flags,
};
*/
