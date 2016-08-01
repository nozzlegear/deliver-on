
const env: {[index: string]: string} = process.env;

export const OptionalProps = [
    "Port",
    "Host",
    "StripePublishableKey",
    "StripeSecretKey",
    "SparkpostKey",
    "EmailDomain",
    "NgrokDomain",
]

/**
 * Whether the server is running in a live (production) environment.
 */
export const isLive = env["NODE_ENV"] === "production"

/**
 * An ngrok URL used during testing with `gulp watch`.
 */
export const NgrokDomain = env["gearworks-ngrokDomain"];

/**
 * A salt encryption string for Yar cookies.
 */
export const YarSalt: string = env["gearworks-yarSalt"] || env["yarSalt"];

/**
 * A random encryption signature string
 */
export const EncryptionSignature = env["gearworks-encryptionSignature"] || env["encryptionSignature"];

/**
 * The connection URL to your PouchDB-compatible database.
 */
export const DatabaseUrl: string = env["gearworks-couchUrl"] || env["couchUrl"];

/**
 * Your server app's port. Typically set automatically by your host with the PORT environment variable.
 */
export const Port = 8080;

/**
 * Your server app's host domain. Typically set automatically by your host with the HOST environment variable. Use 0.0.0.0 when running in a Docker container.
 */
export const Host = "0.0.0.0";

/**
 * Your app's full domain, e.g. example.com or www.example.com.
 */
export const Domain = env["gearworks-domain"] || env["domain"]

/**
 * Your app's name.
 */
export const AppName = env["gearworks-appName"] || env["appName"];

/**
 * Your Shopify app's secret key.
 */
export const ShopifySecretKey = env["gearworks-shopifySecretKey"] || env["shopifySecretKey"];

/**
 * Your Shopify app's public API key.
 */
export const ShopifyApiKey = env["gearworks-shopifyApiKey"] || env["shopifyApiKey"];

/**
 * Optional. Your Stripe publishable key.
 */
export const StripePublishableKey = env["gearworks-stripePublishableKey"] || env["stripePublishableKey"];

/**
 * Optional. Your Stripe secret key.
 */
export const StripeSecretKey = env["gearworks-stripeSecretKey"] || env["stripeSecretKey"];

/**
 * Optional. Your Sparkpost (https://www.sparkpost.com) API key, used for sending password reset emails.
 */
export const SparkpostKey = env["gearworks-sparkpostKey"] || env["sparkpostKey"];

/**
 * Optional. The domain to send emails from, e.g. example.com. Domain must be verified in your Sparkpost account.
 */
export const EmailDomain = env["gearworks-emailDomain"] || env["emailDomain"];