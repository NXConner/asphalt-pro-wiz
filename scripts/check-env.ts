#!/usr/bin/env tsx
/**
 * Comprehensive environment audit used in pre-commit and CI to guarantee that
 * Lovable previews, Supabase connectivity, and observability hooks have the
 * configuration they need. The script is intentionally strict and fails fast
 * when a required variable is missing or misconfigured.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { config as loadEnv } from 'dotenv';

type Severity = 'error' | 'warn' | 'info';

interface CheckResult {
  key: string;
  message: string;
  severity: Severity;
}

interface EnvCheck {
  key: string;
  description: string;
  required: boolean;
  category:
    | 'routing'
    | 'supabase'
    | 'secrets'
    | 'observability'
    | 'ai'
    | 'external'
    | 'feature-flags'
    | 'tooling'
    | 'meta'
    | 'hud';
  validate?: (value: string | undefined, context: AuditContext) => CheckResult[];
}

interface AuditContext {
  envName: string;
  strict: boolean;
  precommit: boolean;
}

const args = new Set(process.argv.slice(2));

const context: AuditContext = {
  envName: resolveEnvName(),
  strict: args.has('--strict') || args.has('--ci'),
  precommit: args.has('--precommit'),
};

bootstrapEnv(context.envName);

const checks: EnvCheck[] = [
  {
    key: 'APP_ENV',
    description: 'Deployment environment identifier (development/test/staging/production)',
    required: true,
    category: 'meta',
  },
  {
    key: 'VITE_ENVIRONMENT',
    description: 'Frontend environment label used for telemetry and feature flags',
    required: true,
    category: 'meta',
  },
  {
    key: 'VITE_APP_VERSION',
    description: 'Build version string reported in telemetry',
    required: true,
    category: 'meta',
  },
  {
    key: 'VITE_BASE_PATH',
    description: 'Vite build base path (must be relative for Lovable previews)',
    required: true,
    category: 'routing',
    validate: validateBasePath,
  },
  {
    key: 'VITE_BASE_NAME',
    description: 'React Router basename (leave `/` to enable Lovable detection)',
    required: true,
    category: 'routing',
    validate: (value) => {
      if (value && value !== '/' && !value.startsWith('/')) {
        return [
          {
            key: 'VITE_BASE_NAME',
            message: 'Basename should either be `/` or start with `/` (e.g. `/preview`) to avoid routing mismatches.',
            severity: 'warn',
          },
        ];
      }
      return [];
    },
  },
  {
    key: 'VITE_BASE_URL',
    description: 'Canonical URL for generated links',
    required: true,
    category: 'routing',
  },
  {
    key: 'VITE_ENABLE_WEB_VITALS',
    description: 'Enable web vitals instrumentation (true/false)',
    required: true,
    category: 'observability',
  },
  {
    key: 'VITE_ENABLE_FEATURE_TELEMETRY',
    description: 'Enable feature telemetry payloads',
    required: true,
    category: 'observability',
  },
  {
    key: 'VITE_OBSERVABILITY_EXPORTER_URL',
    description: 'HTTP exporter endpoint for observability payload forwarding',
    required: true,
    category: 'observability',
  },
  {
    key: 'VITE_OBSERVABILITY_SAMPLE_RATE',
    description: 'Sample rate for observability events (0-1)',
    required: true,
    category: 'observability',
  },
  {
    key: 'OTEL_EXPORTER_OTLP_ENDPOINT',
    description: 'OTel collector endpoint for metrics/log export',
    required: false,
    category: 'observability',
    validate: (value, ctx) => missingInStrict(value, ctx, 'OTEL_EXPORTER_OTLP_ENDPOINT'),
  },
  {
    key: 'OTEL_EXPORTER_OTLP_PROTOCOL',
    description: 'OTel exporter protocol (grpc|http|protobuf)',
    required: false,
    category: 'observability',
    validate: (value, ctx) => missingInStrict(value, ctx, 'OTEL_EXPORTER_OTLP_PROTOCOL'),
  },
  {
    key: 'VITE_SUPABASE_URL',
    description: 'Supabase project URL (publishable)',
    required: true,
    category: 'supabase',
  },
  {
    key: 'VITE_SUPABASE_PUBLISHABLE_KEY',
    description: 'Supabase anon/publishable key (safe for client usage)',
    required: true,
    category: 'supabase',
  },
  {
    key: 'SUPABASE_URL',
    description: 'Supabase project URL (server-side)',
    required: true,
    category: 'supabase',
  },
  {
    key: 'SUPABASE_ANON_KEY',
    description: 'Supabase anon key mirrored for server utilities',
    required: true,
    category: 'supabase',
  },
  {
    key: 'SUPABASE_PROJECT_REF',
    description: 'Supabase project reference used by CLI tooling',
    required: true,
    category: 'supabase',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (must be present before migration/seed runs)',
    required: false,
    category: 'secrets',
    validate: (value, ctx) => {
      if (!value && ctx.strict) {
        return [
          {
            key: 'SUPABASE_SERVICE_ROLE_KEY',
            message: 'Service role key missing. Required for migrations/seeds in CI environments.',
            severity: 'error',
          },
        ];
      }
      return [];
    },
  },
  {
    key: 'SECRET_PROVIDER',
    description: 'Secret manager provider identifier (env|doppler|vault|aws-secrets-manager)',
    required: false,
    category: 'secrets',
    validate: (value) => {
      if (!value) return [];
      const normalized = value.trim().toLowerCase();
      const allowed = ['env', 'doppler', 'vault', 'aws', 'aws-secrets', 'aws-secretsmanager', 'aws-secrets-manager'];
      if (!allowed.includes(normalized)) {
        return [
          {
            key: 'SECRET_PROVIDER',
            message: `Unrecognised secret provider "${value}". Supported values: env, doppler, vault, aws-secrets-manager.`,
            severity: 'warn',
          },
        ];
      }
      if (normalized !== 'env') {
        return [
          {
            key: 'SECRET_PROVIDER',
            message: `Secrets will be resolved via ${normalized}. Ensure config/secrets guidance is followed.`,
            severity: 'info',
          },
        ];
      }
      return [];
    },
  },
  {
    key: 'DATABASE_URL',
    description: 'PostgreSQL connection string for migrations and scripts',
    required: false,
    category: 'secrets',
    validate: (value, ctx) => missingInStrict(value, ctx, 'DATABASE_URL'),
  },
  {
    key: 'ADMIN_EMAIL',
    description: 'Primary administrator email for onboarding flows',
    required: false,
    category: 'meta',
    validate: (value, ctx) => missingInStrict(value, ctx, 'ADMIN_EMAIL'),
  },
  {
    key: 'VITE_LOG_BEACON_URL',
    description: 'Observability beacon endpoint',
    required: true,
    category: 'observability',
  },
  {
    key: 'OBSERVABILITY_API_KEY',
    description: 'Key for secure log ingestion (server-side)',
    required: false,
    category: 'observability',
    validate: (value, ctx) => missingInStrict(value, ctx, 'OBSERVABILITY_API_KEY'),
  },
  {
    key: 'VITE_GEMINI_PROXY_URL',
    description: 'Gemini AI proxy endpoint',
    required: true,
    category: 'ai',
  },
  {
    key: 'GEMINI_API_KEY',
    description: 'Gemini API key (secure)',
    required: false,
    category: 'ai',
    validate: (value, ctx) => missingInStrict(value, ctx, 'GEMINI_API_KEY'),
  },
  {
    key: 'LOVABLE_API_KEY',
    description: 'Lovable API key for automated deploy previews',
    required: false,
    category: 'ai',
    validate: (value) =>
      value
        ? []
        : [
            {
              key: 'LOVABLE_API_KEY',
              message: 'Lovable API key not present. Automated preview management will be disabled.',
              severity: 'warn',
            },
          ],
  },
  {
    key: 'VITE_GOOGLE_MAPS_API_KEY',
    description: 'Google Maps API key (restricted client key)',
    required: false,
    category: 'external',
    validate: (value, ctx) => missingInStrict(value, ctx, 'VITE_GOOGLE_MAPS_API_KEY'),
  },
  {
    key: 'VITE_FLAG_COMMANDCENTER',
    description: 'Feature flag baseline sanity check',
    required: true,
    category: 'feature-flags',
  },
  {
    key: 'VITE_FLAG_HUD_MULTI_MONITOR',
    description: 'Enable HUD multi-monitor orchestration',
    required: true,
    category: 'feature-flags',
  },
  {
    key: 'VITE_FLAG_HUD_GESTURES',
    description: 'Enable HUD gesture controls',
    required: true,
    category: 'feature-flags',
  },
  {
    key: 'VITE_FLAG_HUD_KEYBOARD_NAV',
    description: 'Enable HUD keyboard navigation shortcuts',
    required: true,
    category: 'feature-flags',
  },
  {
    key: 'VITE_FLAG_HUD_ANIMATIONS',
    description: 'Enable HUD animation system',
    required: true,
    category: 'feature-flags',
  },
  {
    key: 'VITE_FLAG_HUD_CONFIG_SYNC',
    description: 'Enable HUD config sync/export workflows',
    required: true,
    category: 'feature-flags',
  },
  {
    key: 'GITHUB_TOKEN',
    description: 'Token used by ingestion scripts (optional locally)',
    required: false,
    category: 'tooling',
  },
  {
    key: 'VITE_HUD_DEFAULT_ANIMATION_PRESET',
    description: 'Default HUD animation preset identifier',
    required: false,
    category: 'hud',
    validate: (value, ctx) => missingInStrict(value, ctx, 'VITE_HUD_DEFAULT_ANIMATION_PRESET'),
  },
  {
    key: 'VITE_HUD_ANIMATION_PRESETS_PATH',
    description: 'Path to HUD animation presets JSON',
    required: false,
    category: 'hud',
    validate: (value, ctx) => missingInStrict(value, ctx, 'VITE_HUD_ANIMATION_PRESETS_PATH'),
  },
  {
    key: 'VITE_HUD_GESTURE_SENSITIVITY',
    description: 'HUD gesture sensitivity tuning (conservative|standard|aggressive)',
    required: false,
    category: 'hud',
    validate: (value, ctx) => missingInStrict(value, ctx, 'VITE_HUD_GESTURE_SENSITIVITY'),
  },
  {
    key: 'VITE_HUD_MULTI_MONITOR_STRATEGY',
    description: 'HUD multi-monitor strategy (auto|single|persist-latest)',
    required: false,
    category: 'hud',
    validate: (value, ctx) => missingInStrict(value, ctx, 'VITE_HUD_MULTI_MONITOR_STRATEGY'),
  },
  {
    key: 'VITE_HUD_CONFIG_EXPORT_FORMAT',
    description: 'HUD configuration export format (json|yaml)',
    required: false,
    category: 'hud',
    validate: (value, ctx) => missingInStrict(value, ctx, 'VITE_HUD_CONFIG_EXPORT_FORMAT'),
  },
  {
    key: 'VITE_HUD_CONFIG_EXPORT_ENDPOINT',
    description: 'Optional endpoint to push HUD archives to (Supabase Edge/S3)',
    required: false,
    category: 'hud',
  },
  {
    key: 'HUD_CONFIG_EXPORT_SIGNING_KEY',
    description: 'Signing key used to authenticate HUD exports',
    required: false,
    category: 'secrets',
    validate: (value, ctx) => missingInStrict(value, ctx, 'HUD_CONFIG_EXPORT_SIGNING_KEY'),
  },
  {
    key: 'HUD_CONFIG_EXPORT_ENCRYPTION_KEY',
    description: 'Encryption key securing HUD archive payloads',
    required: false,
    category: 'secrets',
    validate: (value, ctx) => missingInStrict(value, ctx, 'HUD_CONFIG_EXPORT_ENCRYPTION_KEY'),
  },
  {
    key: 'HUD_CONFIG_EXPORT_BUCKET',
    description: 'Object storage bucket for HUD configuration archives',
    required: false,
    category: 'secrets',
    validate: (value, ctx) => missingInStrict(value, ctx, 'HUD_CONFIG_EXPORT_BUCKET'),
  },
];

const outcomes: CheckResult[] = [];

for (const check of checks) {
  const value = process.env[check.key];

  if (!value || value.length === 0) {
    if (check.required) {
      outcomes.push({
        key: check.key,
        message: `Missing required variable: ${check.description}`,
        severity: 'error',
      });
    } else if (context.strict) {
      outcomes.push({
        key: check.key,
        message: `Missing variable (${check.category}). Provide before running CI/deployment.`,
        severity: 'warn',
      });
    }
  }

  if (check.validate) {
    outcomes.push(...check.validate(value, context));
  }
}

summarize(outcomes, context);

const fatalErrors = outcomes.filter((outcome) => outcome.severity === 'error');
if (fatalErrors.length > 0) {
  process.exitCode = 1;
}

function resolveEnvName(): string {
  const fromArg = [...args].find((arg) => arg.startsWith('--env='));
  if (fromArg) {
    return fromArg.split('=')[1] ?? 'development';
  }
  return process.env.APP_ENV ?? 'development';
}

function bootstrapEnv(envName: string) {
  const candidateFiles = [
    '.env',
    `.env.${envName}`,
    '.env.local',
    `.env.${envName}.local`,
  ];

  for (const file of candidateFiles) {
    const absolute = path.resolve(process.cwd(), file);
    if (fs.existsSync(absolute)) {
      loadEnv({ path: absolute, override: false });
    }
  }
}

function validateBasePath(value: string | undefined, ctx: AuditContext): CheckResult[] {
  if (!value) return [];

  const results: CheckResult[] = [];
  const isAbsolute = value.startsWith('/') && value !== './';
  if (isAbsolute) {
    results.push({
      key: 'VITE_BASE_PATH',
      message:
        'Absolute base paths break Lovable nested previews. Use `./` or omit the variable entirely.',
      severity: ctx.strict || ctx.precommit ? 'error' : 'warn',
    });
  }

  if (value === '/' && (ctx.strict || ctx.precommit)) {
    results.push({
      key: 'VITE_BASE_PATH',
      message:
        'Base path set to `/`. This causes asset 404s on Lovable. Set to `./` for production builds.',
      severity: ctx.strict || ctx.precommit ? 'error' : 'warn',
    });
  }
  return results;
}

function missingInStrict(
  value: string | undefined,
  ctx: AuditContext,
  key: string,
): CheckResult[] {
  if (!value) {
    if (ctx.strict) {
      return [
        {
          key,
          message: `${key} missing in strict mode. Populate via secrets manager before CI/deploy.`,
          severity: 'error',
        },
      ];
    }

    if (ctx.precommit) {
      return [
        {
          key,
          message: `${key} missing. Pre-commit continues but populate before pushing.`,
          severity: 'warn',
        },
      ];
    }
  }
  return [];
}

function summarize(results: CheckResult[], ctx: AuditContext) {
  const bySeverity: Record<Severity, CheckResult[]> = {
    error: [],
    warn: [],
    info: [],
  };

  for (const result of results) {
    bySeverity[result.severity].push(result);
  }

  const header = `🔍 Environment audit (${ctx.envName}) – strict=${ctx.strict ? 'true' : 'false'} precommit=${ctx.precommit ? 'true' : 'false'}`;
  console.log(header);
  console.log('-'.repeat(header.length));

  const printGroup = (severity: Severity, label: string) => {
    const group = bySeverity[severity];
    if (group.length === 0) return;
    console.log(`${label} (${group.length})`);
    for (const { key, message } of group) {
      console.log(`  • ${key}: ${message}`);
    }
    console.log('');
  };

  printGroup('error', '❌ Errors');
  printGroup('warn', '⚠️  Warnings');
  printGroup('info', 'ℹ️  Info');

  if (results.length === 0) {
    console.log('✅ All required environment variables detected.');
  }
}
