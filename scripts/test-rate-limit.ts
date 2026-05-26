/**
 * test-rate-limit.ts
 * Demo de rate limiting — Mi Boleta API
 *
 * Uso:
 *   npx ts-node scripts/test-rate-limit.ts
 *   npx ts-node scripts/test-rate-limit.ts https://mi-api.render.com
 */

const BASE_URL = process.argv[2] ?? 'http://localhost:4000/api/v1';

// ─── Helpers de consola ───────────────────────────────────────────────────────

const color = {
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function header(title: string): void {
  console.log('');
  console.log(color.bold('═'.repeat(50)));
  console.log(color.bold(`  ${title}`));
  console.log(color.bold('═'.repeat(50)));
}

function section(title: string): void {
  console.log('');
  console.log(color.bold(`▶ ${title}`));
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RequestResult {
  status: number;
  body: unknown;
  rateLimitRemaining: string | null;
  rateLimitLimit: string | null;
  rateLimitReset: string | null;
}

// ─── Cliente HTTP mínimo (solo usa fetch nativo de Node 18+) ──────────────────

async function request(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
): Promise<RequestResult> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseBody = res.status !== 204 ? await res.json().catch(() => null) : null;

  return {
    status:              res.status,
    body:                responseBody,
    rateLimitRemaining:  res.headers.get('ratelimit-remaining'),
    rateLimitLimit:      res.headers.get('ratelimit-limit'),
    rateLimitReset:      res.headers.get('ratelimit-reset'),
  };
}

// ─── Formatear resultado de cada request ─────────────────────────────────────

function printResult(index: number, result: RequestResult): void {
  const { status, rateLimitRemaining } = result;
  const remaining = rateLimitRemaining ?? '?';

  let statusLabel: string;

  if (status === 200 || status === 201) {
    statusLabel = color.green(`✓ ${status} OK`);
  } else if (status === 401) {
    statusLabel = color.yellow(`⚠ ${status} Unauthorized`);
  } else if (status === 429) {
    statusLabel = color.red(`✗ ${status} TOO MANY REQUESTS  ← rate limit activado`);
  } else {
    statusLabel = color.dim(`? ${status}`);
  }

  console.log(`  Request ${index}  →  ${statusLabel}   ${color.dim(`(Restantes: ${remaining})`)}`);
}

// ─── DEMOS ────────────────────────────────────────────────────────────────────

async function demo1_dispararLogin(): Promise<void> {
  section('DEMO 1 — authLimiter: POST /auth/login');
  console.log(color.dim('  Límite demo: 5 req / 10 seg'));
  console.log(color.dim('  Enviando 7 requests seguidas...\n'));

  for (let i = 1; i <= 7; i++) {
    const result = await request('/auth/login', {
      method: 'POST',
      body: { email: 'demo@miboleta.com', password: 'Password123!' },
    });

    printResult(i, result);
    await sleep(200);
  }
}

async function demo2_cuerpoError429(): Promise<void> {
  section('DEMO 2 — Cuerpo del error 429');
  console.log(color.dim('  Forzando un request adicional para ver el JSON de error...\n'));

  const result = await request('/auth/login', {
    method: 'POST',
    body: { email: 'x@x.com', password: 'cualquiera' },
  });

  if (result.status === 429) {
    console.log(`  Status:   ${color.red(String(result.status))}`);
    console.log(`  Body:     ${JSON.stringify(result.body)}`);
  } else {
    console.log(color.dim(`  (no se disparó el 429 — status ${result.status})`));
  }
}

async function demo3_headers(): Promise<void> {
  section('DEMO 3 — Headers RateLimit-* en cada respuesta');
  console.log(color.dim('  Estos headers llegan incluso en responses exitosas:\n'));

  const result = await request('/auth/login', {
    method: 'POST',
    body: { email: 'demo@miboleta.com', password: 'Password123!' },
  });

  console.log(`  RateLimit-Limit:     ${color.yellow(result.rateLimitLimit     ?? '(no presente)')}`);
  console.log(`  RateLimit-Remaining: ${color.yellow(result.rateLimitRemaining ?? '(no presente)')}`);
  console.log(`  RateLimit-Reset:     ${color.yellow(result.rateLimitReset     ?? '(no presente)')}`);
}

async function demo4_globalLimiter(): Promise<void> {
  section('DEMO 4 — globalLimiter: GET /tickets (requiere token)');
  console.log(color.dim('  Primero obtenemos un token válido...\n'));

  const loginResult = await request('/auth/login', {
    method: 'POST',
    body: { email: 'demo@miboleta.com', password: 'Password123!' },
  });

  const token = (loginResult.body as { data?: { token?: string } })?.data?.token;

  if (!token) {
    console.log(color.yellow('  ⚠ No se pudo obtener token — ¿está corriendo la API con el seed?'));
    console.log(color.dim('    Ejecuta: npm run db:seed'));
    return;
  }

  console.log(color.green('  ✓ Token obtenido'));
  console.log(color.dim('  Enviando 12 requests a GET /tickets...\n'));

  for (let i = 1; i <= 12; i++) {
    const result = await request('/tickets?pageSize=1', { token });
    printResult(i, result);
    await sleep(100);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  header('Demo Rate Limiting — Mi Boleta API');
  console.log(`  Base URL:  ${color.bold(BASE_URL)}`);
  console.log(color.dim('\n  Asegúrate de que la API esté corriendo con DEMO_MODE=true'));
  console.log(color.dim('  Comando:  npm run demo:rate-limit'));

  await demo1_dispararLogin();
  await demo2_cuerpoError429();
  await demo3_headers();

  console.log('');
  console.log(color.dim('  Esperando 10 segundos para que el contador se resetee...'));
  await sleep(10_000);
  console.log(color.green('  ✓ Contador reseteado\n'));

  await demo4_globalLimiter();

  console.log('');
  console.log(color.bold('═'.repeat(50)));
  console.log(color.bold('  Fin del demo'));
  console.log(color.bold('═'.repeat(50)));
  console.log('');
}

main().catch((err: Error) => {
  console.error(color.red('\nError al ejecutar el script:'));
  console.error(color.red(err.message));
  console.error(color.dim('¿Está corriendo la API? → npm run demo:rate-limit'));
  process.exit(1);
});
