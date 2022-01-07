import * as path from "path";
import * as fs from "fs";
import * as yaml from "yaml";
import * as log from "./utils/log";
import Config from "./types/config";
import Resources from "./types/resources";
import Flags from "./types/flags";
import Cords from "./types/cords";

class Jscritty {
  public basePath: string;
  public configFile: string;
  public config: Config;
  public resources: Resources;
  constructor() {
    this.resourcePath = this.resourcePath.bind(this);
    this.load = this.load.bind(this);
    this.changeTheme = this.changeTheme.bind(this);
    this.save = this.save.bind(this);
    this.changeFontSize = this.changeFontSize.bind(this);
    this.changeOpacity = this.changeOpacity.bind(this);
    this.changeFont = this.changeFont.bind(this);
    this.changePadding = this.changePadding.bind(this);
    this.changeFontOffset = this.changeFontOffset.bind(this);
    this.list = this.list.bind(this);
    this.listFonts = this.listFonts.bind(this);
    this.listThemes = this.listThemes.bind(this);
    this.print = this.print.bind(this);
    this.printConfig = this.printConfig.bind(this);
    this.printFonts = this.printFonts.bind(this);
    this.printTheme = this.printTheme.bind(this);
    this.init();
  }

  init() {
    this.basePath = path.resolve(process.env.HOME, ".config/alacritty");
    if (!fs.existsSync(this.basePath)) {
      log.err(`Config directory not found: ${this.basePath}`);
      process.exit();
    }
    this.configFile = `${this.basePath}/alacritty.yml`;
    if (!fs.existsSync(this.configFile)) {
      log.warn("Config file not found");
      fs.openSync(this.configFile, "a");
      log.normal("Created config file =>");
      log.ok(this.configFile);
    }
    this.config = this.load(this.configFile);
    if (this.config === null) {
      this.config = {};
      log.warn("Alacritty config file was empty");
    }
    this.resources = {
      themes: {
        type: "Themes directory",
        path: `${this.basePath}/themes`,
        exists: () => fs.existsSync(this.resources["themes"]["path"]),
        create: () => fs.mkdirSync(this.resources["themes"]["path"]),
      },
      fonts: {
        type: "Fonts file",
        path: `${this.basePath}/fonts.yaml`,
        exists: () => fs.existsSync(this.resources["fonts"]["path"]),
        create: () => fs.writeFileSync(this.resources["fonts"]["path"], ""),
      },
    };
  }

  load(yamlFile: string) {
    try {
      return yaml.parse(
        fs.readFileSync(yamlFile, {
          encoding: "utf8",
        })
      );
    } catch (err) {
      log.err(err);
      process.exit();
    }
  }

  resourcePath(resource: string) {
    if (!(resource in this.resources)) {
      log.err(`Path for resource "${resource}" not set`);
      process.exit();
    }

    resource = this.resources[resource];
    if (!resource["exists"]()) {
      log.warn(`${resource["type"]} not found`);
      resource["create"]();
      log.normal("Created resource =>");
      log.ok(resource["path"]);
    }
    return resource["path"];
  }

  save() {
    fs.writeFileSync(this.configFile, yaml.stringify(this.config), {
      encoding: "utf8",
    });
  }

  apply(flags: Flags) {
    if (flags === null || Object.keys(flags).length < 1) {
      log.err("No options provided");
      process.exit();
    }

    const actions = {
      theme: this.changeTheme,
      font: this.changeFont,
      size: this.changeFontSize,
      opacity: this.changeOpacity,
      padding: this.changePadding,
      offset: this.changeFontOffset,
      list: this.list,
      print: this.print,
    };

    let errorsFound = 0;
    for (const param in actions) {
      if (param in flags) {
        try {
          actions[param](flags[param]);
        } catch (err) {
          log.err(err);
          errorsFound += 1;
          process.exit();
        }
      }
    }

    if (errorsFound > 0) {
      log.err(`\n${errorsFound} error(s) found`);
      process.exit();
    }
  }

  changeTheme(theme: string) {
    const themesDirectory = this.resourcePath("themes");
    const themeFile = `${themesDirectory}/${theme}.yaml`;
    if (!fs.existsSync(themeFile)) {
      log.err(`Theme "${theme}" not found`);
      process.exit();
    }
    const themeYaml = this.load(themeFile);
    if (themeYaml === null) {
      log.err(`File ${theme} is empty`);
      process.exit();
    }
    if (!themeYaml["colors"]) {
      log.err(`${themeFile} does not contain color config`);
      process.exit();
    }

    const expected_colors = [
      "black",
      "red",
      "green",
      "yellow",
      "blue",
      "magenta",
      "cyan",
      "white",
    ];
    const expected_props = {
      primary: ["background", "foreground"],
      normal: expected_colors,
      bright: expected_colors,
    };

    for (let k in expected_props) {
      if (!(k in themeYaml["colors"])) {
        log.warn(`Missing "colors:${k}" for theme "${theme}"`);
        continue;
      }
      for (let v in expected_props[k]) {
        if (!(v in Object.keys(themeYaml["colors"][k]))) {
          log.warn(`Missing "colors:${k}:${v}" for theme "${theme}"`);
        }
      }
    }
    this.config["colors"] = themeYaml["colors"];
    log.warn(`Theme ${theme} applied`);
  }

  changeFontSize(size: number) {
    size = Number(size);
    if (size <= 0) {
      log.err("Font size cannot be negative or zero");
      process.exit();
    }

    if (!("font" in this.config)) {
      this.config["font"] = {};
      log.warn('"font" prop config was not present in alacritty.yml');
      this.config["font"]["size"] = size;
    }

    this.config["font"]["size"] = size;
    log.ok(`Font size set to ${size}`);
  }

  changeOpacity(opacity: number) {
    opacity = Number(opacity);
    if (opacity < 0.0 || opacity > 1.0) {
      log.err("Opacity should be between 0.0 and 1.0");
      process.exit();
    }

    this.config["background_opacity"] = opacity;
    log.ok(`Opacity set to ${opacity}`);
  }

  changeFont(font: string) {
    if (!("font" in this.config)) {
      this.config["font"] = {};
      log.warn('"font" prop was not present in alacritty.yml');
    }

    const fontsFile = this.resourcePath("fonts");
    let fonts = this.load(fontsFile);
    if (fonts === null) {
      log.err(`File "${fontsFile}" is empty`);
      process.exit();
    }
    if (!("fonts" in fonts)) {
      log.err(`No font config found in "${fontsFile}"`);
      process.exit();
    }

    fonts = fonts["fonts"];

    if (!(font in fonts)) {
      log.err(`Config for font "${font}" not found`);
      process.exit();
    }

    const fontTypes = ["normal", "bold", "italic"];

    if (typeof fonts[font] === "string") {
      const fontName = fonts[font];
      fonts[font] = {};
      for (let t in fontTypes) {
        fonts[font][fontTypes[t]] = fontName;
      }
    }

    if (!(typeof fonts[font] === "object")) {
      log.err(`Font "${font}" has wrong format`);
      process.exit();
    }

    for (let t in fontTypes) {
      if (!(fontTypes[t] in fonts[font])) {
        log.err(`Font "${font}" does not have "${fontTypes[t]}" property`);
      }

      if (!(fontTypes[t] in this.config["font"])) {
        this.config["font"][fontTypes[t]] = { family: "tmp" };
      }

      this.config["font"][fontTypes[t]]["family"] = fonts[font][fontTypes[t]]
        ? fonts[font][fontTypes[t]]
        : "tmp";
      const capitalize = (words: string) =>
        words.charAt(0).toUpperCase() + words.slice(1);
      const fontType: string =
        fontTypes[t] === "normal" ? "regular" : fontTypes[t];
      this.config["font"][fontTypes[t]]["style"] = capitalize(fontType);
    }
    log.ok(`Font ${font} applied`);
  }

  changePadding(padding: Cords) {
    if (Object.keys(padding).length !== 2) {
      log.err("Padding should only have an x and y value");
    }

    if (!padding.x || !padding.y) {
      log.err('Missing "Y" value of padding');
      process.exit();
    }

    if (Math.sign(padding.x) === -1 || Math.sign(padding.y) === -1) {
      log.err('The "X" or "Y" values of padding cannot be negative');
      process.exit();
    }

    const { x, y } = padding;
    if (!("window" in this.config)) {
      this.config["window"] = {};
      log.warn('"window" prop was not present in config file');
    }
    if (!("padding" in this.config["window"])) {
      this.config["window"]["padding"] = {};
      log.warn('"padding" prop was not present in config file');
    }

    this.config["window"]["padding"]["x"] = Number(x);
    this.config["window"]["padding"]["y"] = Number(y);
    log.ok(`Padding set to x: ${x}, y: ${y}`);
  }

  changeFontOffset(offset: Cords) {
    if (Object.keys(offset).length != 2) {
      log.err("Offset should only have an x and y value");
    }

    if (!offset.x || !offset.y) {
      log.err('Missing "Y" value of offset');
      process.exit();
    }

    if (Math.sign(offset.x) === -1 || Math.sign(offset.y) === -1) {
      log.err('The "X" or "Y" values of offset cannot be negative');
      process.exit();
    }

    const { x, y } = offset;
    if (!("font" in this.config)) {
      this.config["font"] = {};
    }
    if (!("offset" in this.config["font"])) {
      log.warn('"offset" prop was not set');
      this.config["font"]["offset"] = {};
    }
    this.config["font"]["offset"]["x"] = Number(x);
    this.config["font"]["offset"]["y"] = Number(y);
    log.ok(`Offset set to x: ${x}, y: ${y}`);
  }

  list(toBeListed: string) {
    const options = {
      themes: this.listThemes,
      fonts: this.listFonts,
    };

    if (toBeListed == "all") {
      for (let listFunction in options) {
        options[listFunction]();
      }
    } else {
      if (!(toBeListed in options)) {
        log.err(`Cannot list ${toBeListed}, unknown option`);
        process.exit();
      }
      options[toBeListed]();
    }
  }

  listFonts() {
    const fonts = this.load(this.resourcePath("fonts"));
    if (fonts === null || !("fonts" in fonts)) {
      log.warn("Cannot list fonts, no fonts found");
    } else {
      log.ok("Fonts:", { underline: true, bold: true });
      for (let font in fonts["fonts"]) {
        log.ok(`${font}`);
      }
    }
  }

  listThemes() {
    const themesDir = this.resourcePath("themes");
    fs.readdir(themesDir, (err, files) => {
      if (err) {
        log.err(String(err));
      } else {
        const themes = [];

        files.forEach((file) => {
          themes.push(file);
        });

        if (themes.length < 1) {
          log.warn("Cannot list themes, themes directory is empty");
        } else {
          log.primary("Themes:", { underline: true, bold: true });
          for (let theme in themes) {
            const themeName = themes[theme].replace(".yaml", "");
            log.primary(`${themeName}`);
          }
        }
      }
    });
  }

  printConfig() {
    log.normal(this.configFile);
    log.normal(yaml.stringify(this.config));
  }

  printFonts() {
    const fontsFile = this.resourcePath("fonts");
    log.ok(fontsFile);
    log.primary(yaml.stringify(this.load(fontsFile)));
  }

  printTheme(theme: string) {
    const themesDir = this.resourcePath("themes");
    const themeFile = `${themesDir}/${theme}.yaml`;

    if (!fs.existsSync(themeFile)) {
      log.err(`Failed printing "${theme}" theme, "${themeFile}" not found`);
      process.exit();
    }
    log.ok(themeFile);
    log.normal(yaml.stringify(this.load(themeFile)));
  }

  print(toBePrinted: string) {
    const options = {
      fonts: this.printFonts,
      config: this.printConfig,
    };

    if (toBePrinted.length == 0) {
      toBePrinted = "config";
    }

    if (toBePrinted in options) {
      options[toBePrinted]();
    } else {
      this.printTheme(toBePrinted);
    }
  }
}

export default Jscritty;
