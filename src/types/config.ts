type Config = { 
  colors?: {
    primary?: {
      background: string,
      foreground: string
    },
    normal?: {
      black: string,
      red: string,
      green: string,
      yellow: string,
      blue: string,
      magenta: string,
      cyan: string,
      white: string
    },
    bright?: {
      black: string,
      red: string,
      green: string,
      yellow: string,
      blue: string,
      magenta: string,
      cyan: string,
      white: string,
    },
  },
  background_opacity?: number
  font?: {
    normal?: {
      family: string,
      style: string
    },
    bold?: {
      family: string,
      style: string
    },
    italic?: {
      family: string,
      style: string
    },
    size?: number,
    offset?: {
      x?: number,
      y?: number
    }
  }
  window?: {
    padding?: {
      x?: number,
      y?: number
    }
  }
};

export default Config;
