const path = require("path");
const fs = require("fs");
const yaml = require("yaml");
const chalk = require("chalk");
const log = console.log;
const error = chalk.bold.red;
const warning = chalk.keyword("orange");

class Alacritty {
  constructor() {
    this.basePath = "";
    this.configFile = "";
    this.config = {};
    this.resources = "";
    this.resourcePath = this.resourcePath.bind(this);
    this.load = this.load.bind(this);
    this.changeTheme = this.changeTheme.bind(this);
    this.save = this.save.bind(this);
    this.changeFontSize = this.changeFontSize.bind(this);
    this.changeOpacity = this.changeOpacity.bind(this);
    this.changeFont = this.changeFont.bind(this);
    this.changePadding = this.changePadding.bind(this);
    this.init();
  }

  init() {
    this.basePath = path.resolve(process.env.HOME, ".config/alacritty");
    if (!fs.existsSync(this.basePath)) {
      log(error(`Config directory not found: ${this.base_path}`));
    }
    this.configFile = `${this.basePath}/alacritty.yml`;
    if (!fs.existsSync(this.configFile)) {
      log(warning("Config file not found"));
      fs.writeFileSync(this.configFile);
      log("Created config file =>");
      log(chalk.blue(this.configFile));
    }
    this.config = this.load(this.configFile);
    if (this.config === null) {
      this.config = {};
      log(warning("Alacritty config file was empty"));
    }
    this.resources = {
      themes: {
        type: "Themes directory",
        path: `${this.basePath}/themes`,
        exists: () => {
          fs.existsSync(this.resources["themes"]["path"]);
        },
        create: () => {
          fs.mkdirSync(this.resources["themes"]["path"]);
        },
      },
      fonts: {
        type: "Fonts file",
        path: `${this.basePath}/fonts.yaml`,
        exists: () => {
          fs.existsSync(this.resources["fonts"]["path"]);
        },
        create: () => {
          fs.writeFileSync(this.resources["fonts"]["path"]);
        },
      },
    };
  }

  load(yamlFile) {
    try {
      return yaml.parse(
        fs.readFileSync(yamlFile, {
          encoding: "utf8",
        })
      );
    } catch (err) {
      log(error(err));
    }
  }

  resourcePath(resource) {
    if (!(resource in this.resources)) {
      log(error(`Path for resource "${resource}" not set`));
    }

    resource = this.resources[resource];
    if (!resource["exists"]) {
      log(warning(`${resource["type"]} not found`));
      resource["create"]();
      log("Created resource =>");
      log(chalk.blue(resource["path"]));
    }
    return resource["path"];
  }

  save() {
    fs.writeFileSync(this.configFile, yaml.stringify(this.config), {
      encoding: "utf8",
    });
  }

  apply(config) {
    if (config === null || config.length < 1) {
      log(error("No options provided"));
    }

    const actions = {
      theme: this.changeTheme,
      font: this.changeFont,
      size: this.changeFontSize,
      opacity: this.changeOpacity,
      padding: this.changePadding,
    };

    let errorsFound = 0;
    for (const param in actions) {
      if (param in config) {
        try {
          actions[param](config[param]);
        } catch (err) {
          log(error(err));
          errorsFound += 1;
        }
      }
    }

    if (errorsFound > 0) {
      log(error(`\n${errorsFound} error(s) found`));
    }
  }

  changeTheme(theme) {
    const themesDirectory = this.resourcePath("themes");
    const themeFile = `${themesDirectory}/${theme}.yaml`;
    if (!fs.existsSync(themeFile)) {
      log(error(`Theme "${theme}" not found`));
    }
    const themeYaml = this.load(themeFile);
    if (themeYaml === null) {
      log(error(`File ${themeFile.name} is empty`));
    }
    if (!themeYaml["colors"]) {
      log(error(`${themeFile} does not contain color config`));
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
        log(warning(`Missing "colors:${k}" for theme "${theme}"`));
        continue;
      }
      for (let v in expected_props[k]) {
        if (!(v in Object.keys(themeYaml["colors"][k]))) {
          log(warning(`Missing "colors:${k}:${v}" for theme "${theme}"`));
        }
      }
    }
    this.config["colors"] = themeYaml["colors"];
    log(chalk.blue(`Theme ${theme} applied`));
  }

  changeFontSize(size) {
    size = Number(size);
    if (size <= 0) {
      log(error("Font size cannot be negative or zero"));
    }

    if (!("font" in this.config)) {
      this.config["font"] = {};
      log(warning('"font" prop config was not present in alacritty.yml'));
      this.config["font"]["size"] = size;
    }

    this.config["font"]["size"] = size;
    log(chalk.blue(`Font size set to ${size}`));
  }

  changeOpacity(opacity) {
    opacity = Number(opacity);
    if (opacity < 0.0 || opacity > 1.0) {
      log(error("Opacity should be between 0.0 and 1.0"));
    }

    this.config["background_opacity"] = opacity;
    log(chalk.blue(`Opacity set to ${opacity}`));
  }

  changeFont(font) {
    if (!("font" in this.config)) {
      this.config["font"] = {};
      log(warning('"font" prop was not present in alacritty.yml'));
    }

    const fontsFile = this.resourcePath("fonts");
    let fonts = this.load(fontsFile);
    if (fonts === null) {
      log(error(`File "${fontsFile}" is empty`));
    }
    if (!("fonts" in fonts)) {
      log(error(`No font config found in "${fontsFile}"`));
    }

    fonts = fonts["fonts"];

    if (!(font in fonts)) {
      log(error(`Config for font "${font}" not found`));
    }

    const fontTypes = ["normal", "bold", "italic"];

    if (typeof fonts[font] === "string") {
      const fontName = fonts[font];
      fonts[font] = {};
      for (let t in fontTypes) {
        fonts[font][fontTypes[t]] = fontName;
      }
    }

    if (!(fonts[font] instanceof Object)) {
      log(error(`Font "${font}" has wrong format`));
    }

    for (let t in fontTypes) {
      if (!(t in Object.keys(fonts))) {
        log(warning(`Font "${font}" does not have "${t}" property`));
      }
      if (!(t in this.config["font"])) {
        this.config["font"][fontTypes[t]] = { family: "tmp" };
      }
      this.config["font"][fontTypes[t]]["family"] = fonts[font][fontTypes[t]];
    }
    log(chalk.blue(`Font ${font} applied`));
  }

  changePadding(padding) {
    if (Object.keys(padding).length != 2) {
      log(error("Padding should only have an x and y value"));
    }
    const { x, y } = padding;
    if (!("window" in this.config)) {
      this.config["window"] = {};
      log(warning('"window" prop was not present in config file'));
    }
    if (!("padding" in this.config["window"])) {
      this.config["window"]["padding"] = {};
      log(warning('"padding" prop was not present in config file'));
    }

    this.config["window"]["padding"]["x"] = Number(x);
    this.config["window"]["padding"]["y"] = Number(y);
    log(chalk.blue(`Padding set to x: ${x}, y: ${y}`));
  }
}

module.exports = Alacritty;
