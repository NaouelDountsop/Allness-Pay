import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';

/**
 * Verrouille la rotation automatique du jeton d'acces.
 *
 * Le point critique n'est pas le cas nominal mais les cas tordus : la boucle
 * de rafraichissement, les requetes concurrentes, et le 401 qui ne doit PAS
 * declencher de rotation.
 *
 * L'import de `auth-storage` est necessaire : c'est son effet de bord qui
 * branche le magasin sur le client HTTP.
 */

const REFRESH_URL = 'http://localhost:3000/api/v1/auth/refresh';

let mock: MockAdapter;
let fetchMock: ReturnType<typeof vi.fn>;

/** Simule `POST /auth/refresh`, qui passe par `fetch` et non par axios. */
function mockRefreshEndpoint(result: 'ok' | 'refused', tokens = { access: 'A2', refresh: 'R2' }) {
  fetchMock.mockImplementation(async (url: string) => {
    expect(url).toBe(REFRESH_URL);
    if (result === 'refused') {
      return { ok: false, status: 401, json: async () => ({}) };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ access_token: tokens.access, refresh_token: tokens.refresh }),
    };
  });
}

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);

  sessionStorage.clear();
  authStorage.setToken('A1');
  authStorage.setRefreshToken('R1');
});

afterEach(() => {
  mock.restore();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe('apiClient — rotation automatique du jeton', () => {
  it('rafraichit puis rejoue la requete apres un 401', async () => {
    mockRefreshEndpoint('ok');
    // Premier appel : 401. Second (apres rotation) : 200.
    mock.onGet('/wallets').replyOnce(401, { statusCode: 401, code: 'UNAUTHORIZED' });
    mock.onGet('/wallets').replyOnce(200, { solde: 1500 });

    const response = await apiClient.get('/wallets');

    expect(response.data).toEqual({ solde: 1500 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejoue la requete avec le NOUVEAU jeton', async () => {
    mockRefreshEndpoint('ok', { access: 'NOUVEAU', refresh: 'R2' });
    mock.onGet('/wallets').replyOnce(401, {});
    mock.onGet('/wallets').replyOnce(200, {});

    await apiClient.get('/wallets');

    const replayed = mock.history.get[1];
    expect(replayed?.headers?.Authorization).toBe('Bearer NOUVEAU');
  });

  it('persiste les deux jetons apres rotation', async () => {
    mockRefreshEndpoint('ok', { access: 'A2', refresh: 'R2' });
    mock.onGet('/wallets').replyOnce(401, {});
    mock.onGet('/wallets').replyOnce(200, {});

    await apiClient.get('/wallets');

    expect(authStorage.getToken()).toBe('A2');
    // Le jeton de rafraichissement tourne aussi : ne pas le remplacer
    // condamnerait la rotation suivante.
    expect(authStorage.getRefreshToken()).toBe('R2');
  });

  it("n'appelle /auth/refresh qu'une fois pour plusieurs 401 simultanes", async () => {
    mockRefreshEndpoint('ok');
    mock.onGet('/a').replyOnce(401, {});
    mock.onGet('/b').replyOnce(401, {});
    mock.onGet('/c').replyOnce(401, {});
    mock.onGet('/a').reply(200, { ok: 'a' });
    mock.onGet('/b').reply(200, { ok: 'b' });
    mock.onGet('/c').reply(200, { ok: 'c' });

    const results = await Promise.all([
      apiClient.get('/a'),
      apiClient.get('/b'),
      apiClient.get('/c'),
    ]);

    expect(results.map((r) => r.data)).toEqual([{ ok: 'a' }, { ok: 'b' }, { ok: 'c' }]);
    // Sans file d'attente, trois rotations auraient eu lieu et deux jetons
    // auraient ete invalides des leur emission.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('purge la session quand le rafraichissement est refuse', async () => {
    mockRefreshEndpoint('refused');
    mock.onGet('/wallets').reply(401, {});

    await expect(apiClient.get('/wallets')).rejects.toMatchObject({ statusCode: 401 });

    expect(authStorage.getToken()).toBeNull();
    expect(authStorage.getRefreshToken()).toBeNull();
  });

  it('ne boucle pas : une seule tentative de rafraichissement par requete', async () => {
    mockRefreshEndpoint('ok');
    // L'API renvoie 401 meme apres rotation (jeton revoque cote serveur).
    mock.onGet('/wallets').reply(401, {});

    await expect(apiClient.get('/wallets')).rejects.toBeDefined();

    // `_retry` empeche la seconde tentative : sans lui, boucle infinie.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('apiClient — cas ou il ne faut PAS rafraichir', () => {
  it('ne rafraichit pas sur un 401 de /auth/login', async () => {
    mockRefreshEndpoint('ok');
    // Forme reelle renvoyee par `AllExceptionsFilter` cote API.
    mock.onPost('/auth/login').reply(401, {
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Email ou mot de passe invalide',
      requestId: 'req-1',
    });

    await expect(apiClient.post('/auth/login', {})).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });

    // Un mauvais mot de passe n'est pas une session expiree.
    expect(fetchMock).not.toHaveBeenCalled();
    expect(authStorage.getToken()).toBe('A1');
  });

  it('ne rafraichit pas sur un 403 (compte suspendu)', async () => {
    mockRefreshEndpoint('ok');
    mock.onGet('/wallets').reply(403, {
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'Votre compte est suspendu. Veuillez contacter le support.',
      requestId: 'req-2',
    });

    await expect(apiClient.get('/wallets')).rejects.toMatchObject({ statusCode: 403 });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ne rafraichit pas quand aucun jeton de rafraichissement n'existe", async () => {
    sessionStorage.clear();
    mockRefreshEndpoint('ok');
    mock.onGet('/wallets').reply(401, {});

    await expect(apiClient.get('/wallets')).rejects.toBeDefined();

    // Visiteur non connecte : ni rotation, ni redirection en boucle.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normalise une panne reseau sans tenter de rotation', async () => {
    mockRefreshEndpoint('ok');
    mock.onGet('/wallets').networkError();

    await expect(apiClient.get('/wallets')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
