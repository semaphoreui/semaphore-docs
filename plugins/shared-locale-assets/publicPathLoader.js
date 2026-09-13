// Webpack post-loader. Runs after url-loader/file-loader and replaces the
// locale-specific public path (/docs/<lang>/) in the emitted asset URL with the
// shared one (/docs/), so every language points at the same image files.
module.exports = function publicPathLoader(source) {
  const {publicPath} = this.getOptions();
  const code = Buffer.isBuffer(source) ? source.toString('utf8') : source;
  if (!code.includes('__webpack_public_path__')) return source;
  return code.replace(
    /__webpack_public_path__\s*\+\s*/g,
    () => `${JSON.stringify(publicPath)} + `,
  );
};
