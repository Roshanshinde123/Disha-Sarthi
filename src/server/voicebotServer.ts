// Disha Sarathi - Exotel Voicebot Standalone Node.js & WebSocket Server (PS 26097)
import http from 'http';
import { WebSocketServer } from 'ws';
import { handleExotelVoicebotWebSocket, getVoicebotDiagnostics } from './exotelVoicebot';
import { handleWhatsAppWebhook } from './whatsappHandler';
import { getTTSProvider } from './ttsProvider';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

// Safe .env loading without external dependencies
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key && !(key in process.env)) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const PORT = parseInt(process.env.VOICEBOT_PORT || process.env.PORT || '8080', 10);
const WS_PATH = process.env.EXOTEL_VOICEBOT_WS_PATH || '/api/voice/exotel';

/**
 * Creates and starts the Voicebot HTTP and WebSocket Server
 */
export function startVoicebotServer(port: number = PORT) {
  const server = http.createServer((req, res) => {
    const rawUrl = req.url || '';
    const reqPath = rawUrl.split('?')[0].replace(/\/+$/, '') || '/';
    const host = req.headers.host || `localhost:${port}`;
    const proto = req.headers['x-forwarded-proto'] === 'https' ? 'wss' : 'ws';
    const dynamicWsUrl = `${proto}://${host}${WS_PATH}`;

    // ------------------------------------------------------------------
    // WhatsApp Webhook: GET /api/whatsapp/webhook  (Meta hub verification)
    // ------------------------------------------------------------------
    if (req.method === 'GET' && reqPath === '/api/whatsapp/webhook') {
      const fullUrl = new URL(rawUrl, `http://${host}`);
      const mode      = fullUrl.searchParams.get('hub.mode');
      const token     = fullUrl.searchParams.get('hub.verify_token');
      const challenge = fullUrl.searchParams.get('hub.challenge');

      const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

      console.log(`[WHATSAPP] Verification request: mode=${mode} token_match=${token === expectedToken}`);

      if (mode === 'subscribe' && token === expectedToken && challenge) {
        console.log('[WHATSAPP] Verification SUCCESS — returning challenge:', challenge);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(challenge);
      } else {
        console.warn('[WHATSAPP] Verification FAILED — 403. mode=' + mode + ' token_match=' + (token === expectedToken));
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
      }
      return;
    }

    // ------------------------------------------------------------------
    // WhatsApp Webhook: POST /api/whatsapp/webhook  (Incoming messages)
    // ------------------------------------------------------------------
    if (req.method === 'POST' && reqPath === '/api/whatsapp/webhook') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));

        try {
          const payload = JSON.parse(body || '{}');
          handleWhatsAppWebhook(payload);
        } catch (err) {
          console.warn('[WHATSAPP] POST body is not valid JSON — ignored:', err);
        }
      });
      return;
    }

    // ------------------------------------------------------------------
    // Speech Synthesis Proxy: POST /api/tts
    // ------------------------------------------------------------------
    if (req.method === 'POST' && reqPath === '/api/tts') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const text = parsed.text || '';
          const lang = parsed.lang || 'mr';
          const sampleRate = parsed.sampleRate || 16000;

          if (!text) {
            res.writeHead(400, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: 'Missing text parameter' }));
            return;
          }

          const tts = getTTSProvider();
          const result = await tts.synthesize(text, lang, { sampleRate });

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            status: 'ok',
            provider: tts.getProviderName(),
            base64Payload: result.base64Payload,
            sampleRate: result.sampleRate,
            latencyMs: result.latencyMs,
            mimeType: 'audio/wav'
          }));
        } catch (err: any) {
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: err?.message || 'TTS synthesis failed' }));
        }
      });
      return;
    }

    // CORS preflight handling
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      res.end();
      return;
    }

    // Health Check Endpoint: GET /api/voice/exotel/health
    if (req.method === 'GET' && reqPath === '/api/voice/exotel/health') {
      const diagnostics = getVoicebotDiagnostics();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(
        JSON.stringify(
          {
            service: 'Disha Sarathi Exotel Voicebot Gateway',
            version: '2.0.0',
            status: 'ok',
            port,
            wsEndpoint: WS_PATH,
            wsUrl: dynamicWsUrl,
            healthEndpoint: '/api/voice/exotel/health',
            diagnostics
          },
          null,
          2
        )
      );
      return;
    }

    // Exotel Dynamic Voicebot Routing or API Root Endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify(
        {
          service: 'Disha Sarathi Exotel Voicebot Gateway',
          version: '2.0.0',
          status: 'ok',
          port,
          url: dynamicWsUrl,
          wsEndpoint: WS_PATH,
          healthEndpoint: '/api/voice/exotel/health'
        },
        null,
        2
      )
    );
  });

  // Attach WebSocket Server
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    try {
      const rawUrl = request.url || '';
      const pathname = rawUrl.split('?')[0].replace(/\/+$/, '') || '/';
      const targetPath = WS_PATH.replace(/\/+$/, '');

      if (
        pathname === targetPath ||
        pathname === '/api/exotel/stream' ||
        pathname === '/stream' ||
        pathname.startsWith(targetPath)
      ) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } else {
        console.warn(`[EXOTEL_VOICEBOT] Upgrade rejected for unknown path: ${pathname}`);
        socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
        socket.destroy();
      }
    } catch (err) {
      console.error('[EXOTEL_VOICEBOT] Error handling upgrade request:', err);
      socket.write('HTTP/1.1 500 Internal Server Error\r\nConnection: close\r\n\r\n');
      socket.destroy();
    }
  });

  wss.on('connection', (ws, request) => {
    console.log(
      '[EXOTEL_VOICEBOT] Incoming WebSocket client connected on',
      request.url || WS_PATH
    );

    ws.on('error', (err) => {
      console.error('[EXOTEL_VOICEBOT] Client WebSocket error:', err);
    });

    ws.on('close', (code, reason) => {
      console.log(
        `[EXOTEL_VOICEBOT] WebSocket closed. code=${code} reason=${reason.toString()}`
      );
    });

    // TEMPORARY DIAGNOSTIC LOGGER
    ws.on('message', (data, isBinary) => {
      try {
        const raw = isBinary
          ? data.toString()
          : data.toString();

        const message = JSON.parse(raw);

        console.log(
          `[EXOTEL_VOICEBOT] Exotel event: ${message.event || 'unknown'}`
        );

        if (message.event === 'start') {
          console.log('[EXOTEL_VOICEBOT] START received:', message.start);
        }

        if (message.event === 'media') {
          console.log(
            `[EXOTEL_VOICEBOT] MEDIA received: chunk=${message.media?.chunk || 'unknown'}`
          );
        }

        if (message.event === 'stop') {
          console.log('[EXOTEL_VOICEBOT] STOP received:', message.stop);
        }
      } catch (err) {
        console.log(
          '[EXOTEL_VOICEBOT] Received non-JSON/binary WebSocket message'
        );
      }
    });

    handleExotelVoicebotWebSocket(ws as any);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[EXOTEL_VOICEBOT] CRITICAL: Port ${port} is already in use (EADDRINUSE).`);
      console.error(`[EXOTEL_VOICEBOT] Check running processes with: netstat -ano | findstr :${port}`);
      process.exit(1);
    } else {
      console.error('[EXOTEL_VOICEBOT] Server error:', err);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`[EXOTEL_VOICEBOT] Server listening on http://0.0.0.0:${port}`);
    console.log(`[EXOTEL_VOICEBOT] WebSocket Voicebot endpoint: ws://0.0.0.0:${port}${WS_PATH}`);
    console.log(`[EXOTEL_VOICEBOT] Health check endpoint: http://0.0.0.0:${port}/api/voice/exotel/health`);
  });

  return { server, wss };
}

// Auto-start if executed directly via Node / tsx
if (
  typeof process !== 'undefined' &&
  process.argv &&
  process.argv[1] &&
  (process.argv[1].includes('voicebotServer') || process.argv[1].endsWith('voicebotServer.ts') || process.argv[1].endsWith('voicebotServer.js'))
) {
  startVoicebotServer();
}

