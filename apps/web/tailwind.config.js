/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      // Les couleurs, typographies et espacements de la charte se declarent ici,
      // a partir du fichier Figma du projet. Aucune valeur en dur dans les
      // composants : tout passe par le theme.
    },
  },
  plugins: [],
};
