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
    title: 'Pavement Performance Suite API',
    version: '0.1.0',
    description: 'Placeholder OpenAPI spec; replace with backend-generated spec once routes exist.',
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/api/estimates': {
      post: {
        summary: 'Create estimate from inputs',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/EstimateRequest' } } },
        },
        responses: {
          '200': {
            description: 'Estimate result',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/EstimateResponse' } } },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      EstimateRequest: {
        type: 'object',
        additionalProperties: true,
      },
      EstimateResponse: {
        type: 'object',
        additionalProperties: true,
      },
    },
  },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(spec, null, 2));
console.log(`Wrote ${path.relative(ROOT, OUT)}`);
