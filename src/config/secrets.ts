import { runtimeEnv } from '@/lib/runtimeEnv';

type KnownSecretProvider = 'env' | 'doppler' | 'vault' | 'aws-secrets-manager';

const providerHints: Record<KnownSecretProvider, string> = {
  env: 'Environment variables (default) – suitable for local development only.',
  doppler: 'Doppler – configure a Doppler project and sync secrets via doppler.yaml.',
  vault: 'HashiCorp Vault – see config/secrets/vault.env.template for policy scaffolding.',
  'aws-secrets-manager':
    'AWS Secrets Manager – reference config/secrets/aws-secrets-manager.json.example for IAM policy guidance.',
};

const rawProvider =
  (runtimeEnv.SECRET_PROVIDER as string | undefined) ??
  (runtimeEnv.SECRETS_PROVIDER as string | undefined) ??
  (runtimeEnv.VITE_SECRET_PROVIDER as string | undefined) ??
  'env';

const normaliseProvider = (input: string | undefined): KnownSecretProvider => {
  const candidate = (input ?? '').trim().toLowerCase();
  switch (candidate) {
    case 'doppler':
      return 'doppler';
    case 'vault':
    case 'hashicorp-vault':
      return 'vault';
    case 'aws':
    case 'aws-secrets':
    case 'aws-secretsmanager':
    case 'aws-secrets-manager':
      return 'aws-secrets-manager';
    default:
      return 'env';
  }
};

const provider = normaliseProvider(rawProvider);

export const secretsProvider = {
  value: provider,
  description: providerHints[provider],
};

export interface SecretFetchOptions {
  required?: boolean;
  fallback?: string;
  allowEmpty?: boolean;
  description?: string;
}

const readEnvValue = (key: string): string | undefined => {
  const value = runtimeEnv?.[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof process !== 'undefined' && process.env) {
    const procValue = process.env[key];
    if (procValue !== undefined) return procValue;
  }
  return undefined;
};

const formatMissingMessage = (key: string, description?: string): string => {
  const details = description ? ` (${description})` : '';
  if (provider === 'env') {
    return `[secrets] Missing required secret ${key}${details}. Populate it in your environment or secrets manager.`;
  }
  return `[secrets] Secret ${key}${details} not resolved from provider "${provider}". Configure the integration as described in config/secrets/README.md.`;
};

const ensureValue = (
  key: string,
  value: string | undefined,
  { required = true, allowEmpty = false, fallback, description }: SecretFetchOptions,
): string | undefined => {
  if (value === undefined || value === null || (!allowEmpty && value === '')) {
    if (fallback !== undefined) return fallback;
    if (!required) return undefined;
    const message = formatMissingMessage(key, description);
    if (typeof window === 'undefined') {
      throw new Error(message);
    }
    console.warn(message);
    return undefined;
  }
  return value;
};

/**
 * Resolve a secret value from the configured provider.
 * Currently env-based secrets are supported directly, while Doppler, Vault, and AWS placeholders
 * surface actionable errors that reference the project scaffolding under config/secrets/.
 */
export function getSecret(key: string, options: SecretFetchOptions = {}): string | undefined {
  const envValue = readEnvValue(key);
  if (provider === 'env') {
    return ensureValue(key, envValue, options);
  }

  // Placeholder integrations – future providers should hydrate here.
  const message = formatMissingMessage(key, options.description);
  if (typeof window === 'undefined') {
    throw new Error(message);
  }
  console.warn(message);
  return ensureValue(key, envValue, { ...options, required: false });
}

/**
 * Convenience helper that throws if the secret is not present.
 */
export function requireSecret(key: string, options: SecretFetchOptions = {}): string {
  const value = getSecret(key, { ...options, required: true });
  if (value === undefined) {
    throw new Error(formatMissingMessage(key, options.description));
  }
  return value;
}

/**
 * Surface guidance for the active secrets provider (used in logging and documentation).
 */
export function describeSecretProvider(): string {
  return providerHints[provider];
}
