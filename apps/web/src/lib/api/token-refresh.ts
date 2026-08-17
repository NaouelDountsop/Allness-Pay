/**
 * Rotation du jeton d'acces.
 *
 * Ce module est volontairement une **feuille** : il n'importe ni le client HTTP
 * ni le magasin de session. C'est ce qui permet a `api-client.ts` de l'utiliser
 * sans creer de cycle d'import (`api-client` -> `token-refresh` -> `auth-storage`
 * -> `api-client`).
 *
 * Il expose deux choses :
 *   - l'appel reseau de rafraichissement, deliberement en `fetch` et non via
 *     `apiClient` : passer par le client repasserait dans l'intercepteur 401 et
 *     provoquerait une recursion infinie si le rafraichissement echoue lui-meme ;
 *   - la file d'attente des requetes bloquees pendant un rafraichissement en
 *     cours, pour n'appeler `/auth/refresh` qu'une seule fois meme si dix
 *     requetes tombent en 401 simultanement.
 */

export interface RenewedTokens {
  access_token: string;
  refresh_token: string;
}

/** Reponse de `POST /auth/refresh`. Le jeton de rafraichissement tourne a chaque appel. */
export async function requestNewTokens(
  baseURL: string,
  refreshToken: string,
): Promise<RenewedTokens> {
  const response = await fetch(`${baseURL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // L'API attend `refreshToken` (camelCase), alors qu'elle renvoie
    // `refresh_token` (snake_case). L'ecart est cote serveur, on s'y conforme.
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error(`Rafraichissement refuse (${response.status})`);
  }

  const data = (await response.json()) as Partial<RenewedTokens>;
  if (!data.access_token || !data.refresh_token) {
    throw new Error('Reponse de rafraichissement incomplete');
  }

  return { access_token: data.access_token, refresh_token: data.refresh_token };
}

// --- File d'attente pendant un rafraichissement -----------------------------

type PendingRequest = {
  resolve: (accessToken: string) => void;
  reject: (reason: unknown) => void;
};

let refreshInProgress = false;
let pending: PendingRequest[] = [];

export function isRefreshInProgress(): boolean {
  return refreshInProgress;
}

export function setRefreshInProgress(value: boolean): void {
  refreshInProgress = value;
}

/** Met la requete en attente ; la promesse se resout avec le nouveau jeton d'acces. */
export function enqueuePendingRequest(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    pending.push({ resolve, reject });
  });
}

/** Le rafraichissement a reussi : toutes les requetes en attente repartent. */
export function resolvePendingRequests(accessToken: string): void {
  const queue = pending;
  pending = [];
  queue.forEach(({ resolve }) => resolve(accessToken));
}

/** Le rafraichissement a echoue : toutes les requetes en attente echouent aussi. */
export function rejectPendingRequests(reason: unknown): void {
  const queue = pending;
  pending = [];
  queue.forEach(({ reject }) => reject(reason));
}
