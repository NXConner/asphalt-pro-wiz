#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, 'docs', 'swagger.json');

const definition = {
  openapi: '3.1.0',
  info: {
    title: 'Pavement Performance Suite – Supabase Edge Functions',
    version: '0.3.0',
    description:
      'Documented Supabase Edge Function endpoints powering AI proxying, observability, and supplier intelligence for Pavement Performance Suite.',
  },
};

const baseDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Pavement Performance Suite – Edge Functions API',
    version: '0.3.0',
    description:
      'OpenAPI specification for Supabase Edge Functions that power PPS AI proxying and observability beacons. Generated via swagger-jsdoc.',
    contact: {
      name: 'Pavement Performance Suite Engineering',
      url: 'https://github.com/continue-repo',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  externalDocs: {
    description: 'Project documentation',
    url: 'https://github.com/continue-repo/pavement-performance-suite/tree/main/docs',
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
    { name: 'Intelligence', description: 'Supplier pricing and operations insights' },
  ],
  components: {
    securitySchemes: {
      supabaseAnonKey: {
        type: 'apiKey',
        in: 'header',
        name: 'apikey',
        description:
          "Supabase anon or service key. When calling from browsers use the anon public key; for server-to-server use service role credentials via the 'apikey' header.",
      },
      supabaseBearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Supabase JWT (anon or service role). Provide as `Authorization: Bearer <token>` when invoking Edge Functions.',
      },
    },
    schemas: {
      GeminiProxyRequest: {
        type: 'object',
        description: 'Payload forwarded to Google Gemini.',
        properties: {
          action: {
            type: 'string',
            enum: ['chat', 'image', 'embed'],
            description: 'Operation to perform.',
          },
          contents: {
            type: 'array',
            description: 'Gemini content payload, required for chat and image actions.',
            items: {
              type: 'object',
              additionalProperties: true,
            },
          },
          text: {
            type: 'string',
            description: "Plain text to embed when action === 'embed'.",
            minLength: 1,
            maxLength: 5000,
          },
        },
        required: ['action'],
        additionalProperties: false,
      },
      GeminiProxyResponse: {
        type: 'object',
        description: 'Subset of the Gemini response returned to clients.',
        properties: {
          text: {
            type: 'string',
            description: 'Generated text for chat/image requests.',
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
        description: 'Telemetry event emitted by the Pavement Performance Suite client.',
        properties: {
          event: {
            type: 'string',
            description: 'Event name (e.g. lovable.asset_load_error).',
          },
          level: {
            type: 'string',
            enum: ['debug', 'info', 'warn', 'error'],
            default: 'info',
          },
          message: { type: 'string', description: 'Human readable message.' },
          reason: { type: 'string', description: 'Optional rejection reason or exception.' },
          timestamp: {
            type: 'string',
            description: 'Client-provided timestamp (ISO-8601 or epoch milliseconds).',
          },
          sessionId: { type: 'string', description: 'Client session identifier.' },
          deviceId: { type: 'string', description: 'Client device identifier.' },
          environment: { type: 'string', description: 'Environment label (production, staging, loadtest).' },
          pageUrl: { type: 'string', format: 'uri', description: 'Page URL where the event occurred.' },
          url: {
            type: 'string',
            format: 'uri',
            description: 'Deprecated alias for pageUrl (supported for backward compatibility).',
          },
          assetUrl: { type: 'string', format: 'uri', description: 'Asset URL tied to lovable.asset_* events.' },
          assetTag: { type: 'string', description: 'DOM tag name for the asset (img, script, link, etc.).' },
          userAgent: { type: 'string', description: 'User agent string captured server-side when provided.' },
          metadata: {
            type: 'object',
            description: 'Arbitrary metadata supplied by the client.',
            additionalProperties: true,
          },
        },
        required: ['event'],
        additionalProperties: true,
      },
      LogBeaconPayload: {
        description: 'Single telemetry event or batch of events.',
        anyOf: [
          { $ref: '#/components/schemas/LogEvent' },
          {
            type: 'array',
            minItems: 1,
            maxItems: 50,
            description: 'Batch submission of telemetry events (max 50 per request).',
            items: { $ref: '#/components/schemas/LogEvent' },
          },
        ],
      },
      SupplierIntelRequest: {
        type: 'object',
        description: 'Optional filters supplied when requesting supplier intelligence.',
        properties: {
          orgId: {
            type: 'string',
            format: 'uuid',
            description: 'Organization identifier. Defaults to the caller’s organisation if omitted.',
          },
          materials: {
            type: 'array',
            items: { type: 'string' },
            maxItems: 12,
            description: 'Material identifiers to include (defaults to organisation-wide recent materials).',
          },
          radiusMiles: {
            type: 'number',
            minimum: 0,
            maximum: 500,
            description: 'Optional supplier coverage radius filter.',
          },
          includeAiSummary: {
            type: 'boolean',
            description: 'Set to false to skip the Gemini summarisation step.',
            default: true,
          },
          jobLocation: {
            type: 'object',
            description: 'Optional job geolocation used for future geospatial ranking.',
            properties: {
              lat: { type: 'number', minimum: -90, maximum: 90 },
              lng: { type: 'number', minimum: -180, maximum: 180 },
            },
          },
        },
      },
      SupplierPriceHistoryPoint: {
        type: 'object',
        properties: {
          effectiveDate: { type: 'string', format: 'date-time' },
          unitPrice: { type: 'number' },
          currency: { type: 'string' },
        },
        required: ['effectiveDate', 'unitPrice', 'currency'],
      },
      SupplierInsight: {
        type: 'object',
        description: 'Per-supplier price snapshot enriched with context.',
        properties: {
          supplierId: { type: 'string' },
          supplierName: { type: 'string' },
          materialType: { type: 'string' },
          materialGrade: { type: ['string', 'null'] },
          unitPrice: { type: 'number' },
          unitOfMeasure: { type: 'string' },
          currency: { type: 'string' },
          effectiveDate: { type: 'string', format: 'date-time' },
          confidence: { type: ['number', 'null'] },
          source: { type: ['string', 'null'] },
          trailing30DayAverage: { type: ['number', 'null'] },
          sevenDayChangePercent: { type: ['number', 'null'] },
          sampleCount: { type: 'integer' },
          leadTimeDays: { type: ['number', 'null'] },
          coverageRadiusMiles: { type: ['number', 'null'] },
          reliabilityScore: { type: ['number', 'null'] },
          contact: { type: ['object', 'null'], additionalProperties: true },
          metadata: { type: ['object', 'null'], additionalProperties: true },
          priceHistory: {
            type: 'array',
            items: { $ref: '#/components/schemas/SupplierPriceHistoryPoint' },
          },
        },
        required: [
          'supplierId',
          'supplierName',
          'materialType',
          'unitPrice',
          'unitOfMeasure',
          'currency',
          'effectiveDate',
          'sampleCount',
          'priceHistory',
        ],
      },
      SupplierBestOffer: {
        type: 'object',
        description: 'Best offer for a material across all suppliers.',
        properties: {
          supplierId: { type: 'string' },
          supplierName: { type: 'string' },
          unitPrice: { type: 'number' },
          currency: { type: 'string' },
          leadTimeDays: { type: ['number', 'null'] },
        },
        required: ['supplierId', 'supplierName', 'unitPrice', 'currency'],
      },
      SupplierIntelResponse: {
        type: 'object',
        properties: {
          orgId: { type: 'string', format: 'uuid' },
          materials: {
            type: 'array',
            items: { type: 'string' },
          },
          generatedAt: { type: 'string', format: 'date-time' },
          insights: {
            type: 'array',
            items: { $ref: '#/components/schemas/SupplierInsight' },
          },
          bestOffers: {
            type: 'object',
            description: 'Dictionary keyed by material identifier with the best offer.',
            additionalProperties: { $ref: '#/components/schemas/SupplierBestOffer' },
          },
          aiSummary: { type: ['string', 'null'], description: 'Optional Gemini-generated summary.' },
        },
        required: ['orgId', 'materials', 'generatedAt', 'insights', 'bestOffers', 'aiSummary'],
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

const spec = swaggerJSDoc({
  definition,
  apis: [path.join(ROOT, 'supabase/functions/**/*.ts')],
});

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(spec, null, 2));

const pathCount = spec.paths ? Object.keys(spec.paths).length : 0;
console.log(`Wrote ${path.relative(ROOT, OUTPUT_PATH)} with ${pathCount} documented paths`);
const options = {
  definition: baseDefinition,
  apis: [path.join(ROOT, 'supabase/functions/**/*.ts')],
};

const spec = swaggerJSDoc(options);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(spec, null, 2));
console.log(`Wrote ${path.relative(ROOT, OUT)}`);
