#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'docs', 'swagger.json');

const baseDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Pavement Performance Suite – Edge Functions API',
    version: '0.3.0',
    description:
      'OpenAPI specification for Supabase Edge Functions that power PPS AI proxying and observability beacons. Generated via swagger-jsdoc.',
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
      LogEvent: {
        type: 'object',
        description: 'Telemetry event emitted by the PPS web client.',
        properties: {
          event: {
            type: 'string',
            description: 'Event name (e.g. lovable.asset_load_error)',
          },
          level: {
            type: 'string',
            description: 'Severity level',
            enum: ['debug', 'info', 'warn', 'error'],
            default: 'info',
          },
          message: {
            type: 'string',
            description: 'Human readable diagnostic message',
          },
          reason: {
            type: 'string',
            description: 'Optional rejection reason or exception message',
          },
          timestamp: {
            type: 'string',
            description: 'Client provided timestamp (ISO-8601 or epoch milliseconds)',
          },
          sessionId: {
            type: 'string',
            description: 'Session identifier allocated by the client logger',
          },
          deviceId: {
            type: 'string',
            description: 'Device identifier allocated by the client logger',
          },
          environment: {
            type: 'string',
            description: 'Environment tag (development, production, loadtest, etc.)',
          },
          pageUrl: {
            type: 'string',
            format: 'uri',
            description: 'Page URL where the issue occurred',
          },
          url: {
            type: 'string',
            format: 'uri',
            description: 'Deprecated alias for pageUrl (supported for backward compatibility)',
          },
          assetUrl: {
            type: 'string',
            format: 'uri',
            description: 'Failed asset URL for lovable.asset_* events',
          },
          assetTag: {
            type: 'string',
            description: 'DOM tag name for the asset (img, script, link, etc.)',
          },
          userAgent: {
            type: 'string',
            description: 'User agent string captured server-side if provided',
          },
          metadata: {
            type: 'object',
            description: 'Arbitrary metadata supplied by the client',
            additionalProperties: true,
          },
        },
        required: ['event'],
        additionalProperties: true,
      },
      LogBeaconPayload: {
        anyOf: [
          { $ref: '#/components/schemas/LogEvent' },
          {
            type: 'array',
            description: 'Batch of telemetry events submitted in a single beacon.',
            items: { $ref: '#/components/schemas/LogEvent' },
            minItems: 1,
            maxItems: 50,
          },
        ],
      },
      LogBeaconResponse: {
        type: 'object',
        properties: {
          ingested: {
            type: 'integer',
            minimum: 0,
            description: 'Number of events successfully persisted.',
          },
        },
        required: ['ingested'],
        additionalProperties: false,
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Human-readable error message.',
          },
          details: {
            description: 'Optional validation or diagnostic details.',
            oneOf: [
              { type: 'string' },
              {
                type: 'array',
                items: { type: 'object', additionalProperties: true },
              },
              {
                type: 'object',
                additionalProperties: true,
              },
            ],
          },
        },
        required: ['error'],
        additionalProperties: true,
      },
    },
};

const options = {
  definition: baseDefinition,
  apis: [path.join(ROOT, 'supabase/functions/**/*.ts')],
};

const spec = swaggerJSDoc(options);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(spec, null, 2));
console.log(`Wrote ${path.relative(ROOT, OUT)}`);
