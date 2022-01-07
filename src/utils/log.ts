import * as chalk from "chalk";
const log = console.log;

type LogOptions = {
  underline?: boolean;
  bold?: boolean;
};

const log_color = (message: string, color: string, options: LogOptions) => {
  const { underline = false, bold = false } = options;

  let finalMessage = chalk(message);

  switch (color) {
    case "green":
      finalMessage = chalk.green(finalMessage);
      break;
    case "blue":
      finalMessage = chalk.blue(finalMessage);
      break;
    case "orange":
      finalMessage = chalk.keyword("orange")(finalMessage);
    case "red":
      finalMessage = chalk.red(finalMessage);

    default:
      finalMessage = chalk.keyword(color)(finalMessage);
  }

  if (underline) {
    finalMessage = chalk.underline(finalMessage);
  }

  if (bold) {
    finalMessage = chalk.bold(finalMessage);
  }

  log(finalMessage);
};

export const normal = log;

export const primary = (message: string, options?: LogOptions) => {
  if (!options) {
    options = { underline: false, bold: false };
  }

  const { underline, bold } = options;

  log_color(message, "green", {
    underline: underline,
    bold: bold,
  });
};

export const ok = (message: string, options?: LogOptions) => {
  if (!options) {
    options = { underline: false, bold: false };
  }

  const { underline, bold } = options;

  log_color(message, "blue", {
    underline: underline,
    bold: bold,
  });
};

export const warn = (message: string, options?: LogOptions) => {
  if (!options) {
    options = { underline: false, bold: false };
  }

  const { underline, bold } = options;

  log_color(message, "orange", {
    underline: underline,
    bold: bold,
  });
};

export const err = (message: string, options?: LogOptions) => {
  if (!options) {
    options = { underline: false, bold: false };
  }

  const { underline, bold } = options;

  log_color(message, "red", {
    underline: underline,
    bold: bold,
  });
};
