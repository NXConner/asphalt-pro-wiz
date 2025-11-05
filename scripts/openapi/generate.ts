#!/usr/bin/env tsx
/*
This script scaffolds OpenAPI generation from a frontend-only app by
collecting typed API route definitions for a future backend and outputting
an initial swagger.json. Replace with real backend route annotations later.
*/

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'docs', 'swagger.json');

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Pavement Performance Suite – Edge Functions API',
    version: '0.2.0',
    description:
      'Documented endpoints for Supabase Edge Functions that power PPS AI proxying and observability beacons.',
    contact: {
      name: 'Pavement Performance Suite',
      url: 'https://github.com/continue-repo',
    },
  },
  servers: [
    {
      url: 'https://{projectRef}.functions.supabase.co',
      description: 'Supabase hosted Edge Functions',
      variables: {
        projectRef: {
          default: 'your-project-ref',
          description: 'Supabase project reference ID (e.g. vodglzbgqsafghlihivy)',
        },
      },
    },
    {
      url: 'http://localhost:54321/functions/v1',
      description: 'Local Supabase CLI',
    },
  ],
  tags: [
    { name: 'AI', description: 'Generative AI proxy endpoints' },
    { name: 'Observability', description: 'Telemetry capture and log beacons' },
  ],
  paths: {
    '/gemini-proxy': {
      post: {
        tags: ['AI'],
        summary: 'Proxy Gemini API calls',
        description:
          'Routes chat, image, and embedding requests to Google Gemini models while keeping API keys server-side.',
        operationId: 'GeminiProxy',
        security: [{ supabaseAnonKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GeminiProxyRequest' },
              examples: {
                chat: {
                  summary: 'Chat prompt',
                  value: {
                    action: 'chat',
                    contents: [{ role: 'user', parts: [{ text: 'Summarize sealcoating steps' }] }],
                  },
                },
                embed: {
                  summary: 'Embedding request',
                  value: {
                    action: 'embed',
                    text: 'Church lot resurfacing quote',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Gemini response payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GeminiProxyResponse' },
              },
            },
          },
          '400': {
            description: 'Unsupported action or malformed body',
          },
          '405': {
            description: 'Method not allowed',
          },
          '500': {
            description: 'Upstream error or missing API key',
          },
        },
      },
    },
    '/log-beacon': {
      post: {
        tags: ['Observability'],
        summary: 'Ingest client log beacons',
        description:
          'Receives structured telemetry events from the PPS frontend for centralized logging and later fan-out.',
        operationId: 'LogBeacon',
        security: [{ supabaseAnonKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LogBeaconPayload' },
            },
          },
        },
        responses: {
          '200': { description: 'Beacon accepted' },
          '400': { description: 'Invalid JSON payload' },
          '405': { description: 'Method not allowed' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      supabaseAnonKey: {
        type: 'apiKey',
        in: 'header',
        name: 'apikey',
        description:
          "Supabase anon/service key. When calling from browsers use the anon public key, for server-to-server use service role escorts via 'Authorization: Bearer <token>'.",
      },
    },
    schemas: {
      GeminiProxyRequest: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: 'Operation to perform',
            enum: ['chat', 'image', 'embed'],
          },
          contents: {
            type: 'array',
            description: 'Gemini content payload, required for chat/image actions',
            items: { type: 'object', additionalProperties: true },
          },
          text: {
            type: 'string',
            description: "Plain text to embed when action === 'embed'",
          },
        },
        required: ['action'],
        additionalProperties: false,
      },
      GeminiProxyResponse: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Generated text for chat/image requests',
          },
          embedding: {
            type: 'object',
            properties: {
              values: {
                type: 'array',
                items: { type: 'number' },
              },
            },
          },
        },
        additionalProperties: true,
      },
      LogBeaconPayload: {
        type: 'object',
        description: 'Structured client telemetry with arbitrary metadata',
        properties: {
          event: {
            type: 'string',
            description: 'Event name (e.g. mission_scheduler.conflict)',
          },
          level: {
            type: 'string',
            description: 'Log level',
            enum: ['debug', 'info', 'warn', 'error'],
            default: 'info',
          },
          context: {
            type: 'object',
            description: 'Arbitrary contextual fields',
            additionalProperties: true,
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'ISO-8601 timestamp from client (optional)',
          },
        },
        required: ['event'],
        additionalProperties: true,
      },
    },
  },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(spec, null, 2));
console.log(`Wrote ${path.relative(ROOT, OUT)}`);
