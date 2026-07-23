/// <reference types="vite/client" />

/**
 * Variables d'environnement exposees au navigateur.
 *
 * Seules les variables prefixees `VITE_` sont injectees par Vite. Ne jamais y
 * placer de secret : leur contenu est lisible dans le bundle livre au client.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
