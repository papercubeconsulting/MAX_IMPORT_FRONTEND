const withCSS = require("@zeit/next-css");
module.exports = withCSS({
  exportTrailingSlash: true
});

module.exports = {
  exportTrailingSlash: true,
  exportPathMap: function() {
    return {
      '/': { page: '/' }
    };
  }
};