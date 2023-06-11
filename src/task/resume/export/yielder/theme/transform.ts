const getTheme = (themeModule: string) => 'jsonresume-theme-' + themeModule;

export const transformWithTheme =
  (themeModule: string) => async (json: string) => {
    const jsonResume = JSON.parse(json);
    const theme = require(getTheme(themeModule));
    return theme.render(jsonResume);
  };
