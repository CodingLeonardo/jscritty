type Resources = {
  themes: {
    type: string,
    path: string,
    exists: Function,
    create: Function
  },
  fonts: {
    type: string,
    path: string,
    exists: Function,
    create: Function
  }
};

export default Resources
