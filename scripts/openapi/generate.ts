#!/usr/bin/env tsx
/*
This script scaffolds OpenAPI generation from a frontend-only app by
collecting typed API route definitions for a future backend and outputting
an initial swagger.json. Replace with real backend route annotations later.
*/

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs", "swagger.json");

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Pavement Performance Suite API",
    version: "0.1.0",
    description: "Placeholder OpenAPI spec; replace with backend-generated spec once routes exist.",
  },
  servers: [{ url: "http://localhost:3000" }],
  paths: {
    "/api/estimates": {
      post: {
        summary: "Create estimate from inputs",
        description:
          "Calculates a project estimate based on input parameters (area, materials, services).",
        tags: ["Estimates"],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/EstimateRequest" } },
          },
        },
        responses: {
          "200": {
            description: "Estimate result",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/EstimateResponse" } },
            },
          },
        },
      },
    },
    "/api/ai/chat": {
      post: {
        summary: "AI chat (RAG-assisted) for asphalt domain",
        description:
          "Proxy to Gemini chat through Supabase edge function, augmented with repo RAG context.",
        tags: ["AI"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { question: { type: "string" } },
                required: ["question"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Chat response",
            content: {
              "application/json": {
                schema: { type: "object", properties: { text: { type: "string" } } },
              },
            },
          },
        },
      },
    },
    "/api/ai/image": {
      post: {
        summary: "AI image analysis (asphalt condition)",
        description: "Proxy to Gemini image generateContent via Supabase edge function.",
        tags: ["AI"],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { type: "object", additionalProperties: true } },
          },
        },
        responses: {
          "200": {
            description: "Analysis response",
            content: {
              "application/json": {
                schema: { type: "object", properties: { text: { type: "string" } } },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      EstimateRequest: {
        type: "object",
        additionalProperties: true,
      },
      EstimateResponse: {
        type: "object",
        additionalProperties: true,
      },
    },
  },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(spec, null, 2));
console.log(`Wrote ${path.relative(ROOT, OUT)}`);
