const path = require("path");
const fs = require("fs");
const yaml = require("yaml");

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
    this.init();
  }

  init() {
    this.basePath = path.resolve(process.env.HOME, ".config/alacritty");
    if (!fs.existsSync(this.basePath)) {
      console.error(`Config directory not found: ${this.base_path}`);
    }
    this.configFile = `${this.basePath}/alacritty.yml`;
    if (!fs.existsSync(this.configFile)) {
      console.warn("Config file not found");
      fs.writeFileSync(this.configFile);
      console.log("Created config file =>");
      console.log(this.configFile);
    }
    this.config = this.load(this.configFile);
    if (this.config === null) {
      this.config = {};
      console.warn("Alacritty config file was empty");
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
    } catch (error) {
      console.log("error");
    }
  }

  resourcePath(resource) {
    if (!(resource in this.resources)) {
      console.log(`Path for resource "${resource}" not set`);
    }

    resource = this.resources[resource];
    if (!resource["exists"]) {
      console.warn(`${resource["type"]} not found`);
      resource["create"]();
      console.log("Created resource =>");
      console.log(resource["path"]);
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
      console.log("No options provided");
    }

    const actions = {
      theme: this.changeTheme,
      font: this.changeFont,
      size: this.changeFontSize,
      opacity: this.changeOpacity,
    };

    let errorsFound = 0;
    for (const param in actions) {
      if (param in config) {
        try {
          actions[param](config[param]);
        } catch (error) {
          console.log(error);
          errorsFound += 1;
        }
      }
    }

    if (errorsFound > 0) {
      console.log(`\n${errorsFound} error(s) found`);
    }
  }

  changeTheme(theme) {
    const themesDirectory = this.resourcePath("themes");
    const themeFile = `${themesDirectory}/${theme}.yaml`;
    if (!fs.existsSync(themeFile)) {
      console.error(`Theme "${theme}" not found`);
    }
    const themeYaml = this.load(themeFile);
    if (themeYaml === null) {
      console.error(`File ${themeFile.name} is empty`);
    }
    if (!themeYaml["colors"]) {
      console.error(`${themeFile} does not contain color config`);
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
        console.warn(`Missing "colors:${k}" for theme "${theme}"`);
        continue;
      }
      for (let v in expected_props[k]) {
        if (!(v in Object.keys(themeYaml["colors"][k]))) {
          console.warn(`Missing "colors:${k}:${v}" for theme "${theme}"`);
        }
      }
    }
    this.config["colors"] = themeYaml["colors"];
    console.log(`Theme ${theme} applied`);
  }

  changeFontSize(size) {
    console.log(this.config);
    if (size <= 0) {
      console.log("Font size cannot be negative or zero");
    }

    if (!("font" in this.config)) {
      this.config["font"] = {};
      console.log('"font" prop config was not present in alacritty.yml');
      this.config["font"]["size"] = size;
    }

    this.config["font"]["size"] = size;
    console.log(`Font size set to ${size}`);
  }

  changeOpacity(opacity) {
    if (opacity < 0.0 || opacity > 1.0) {
      console.log("Opacity should be between 0.0 and 1.0");
    }

    this.config["background_opacity"] = opacity;
    console.log(`Opacity set to ${opacity}`);
  }

  changeFont(font) {
    if (!("font" in this.config)) {
      this.config["font"] = {};
      console.log('"font" prop was not present in alacritty.yml');
    }

    const fontsFile = this.resourcePath("fonts");
    let fonts = this.load(fontsFile);
    if (fonts === null) {
      console.log(`File "${fontsFile}" is empty`);
    }
    if (!("fonts" in fonts)) {
      console.log(`No font config found in "${fontsFile}"`);
    }

    fonts = fonts["fonts"];

    if (!(font in fonts)) {
      console.log(`Config for font "${font}" not found`);
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
      console.log(`Font "${font}" has wrong format`);
    }

    for (let t in fontTypes) {
      if (!(t in Object.keys(fonts))) {
        console.log(`Font "${font}" does not have "${t}" property`);
      }
      if (!(t in this.config["font"])) {
        this.config["font"][fontTypes[t]] = { family: "tmp" };
      }
      this.config["font"][fontTypes[t]]["family"] = fonts[font][fontTypes[t]];
    }
    console.log(`Font ${font} applied`);
  }
}

module.exports = Alacritty;
