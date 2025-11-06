import baseConfig from '@subbiah/reusable/tailwind.config';

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/popup.html',
    // Scan @subbiah/reusable source files for Tailwind classes (includes CursorProvider). ../node_modules is used because its a monorepo doing npm i will installnode_modules on parent directory
    '../node_modules/@subbiah/reusable/src/**/*.{js,ts,jsx,tsx}',
  ],
};
