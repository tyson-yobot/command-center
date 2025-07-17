/** client/postcss.config.cjs  ─ Tailwind v4 compatible **/
module.exports = {
  plugins: [
    require('postcss-nesting'),
    // 👉 Tailwind’s v4 wrapper (installs its own tailwindcss internally)
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
