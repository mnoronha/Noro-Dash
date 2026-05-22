export const APP_NAME = "Noro Dash";

export const USER_ROLES = [
  "super_admin",
  "agency_admin",
  "agency_manager",
  "client_admin",
  "client_viewer",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const INTEGRATION_PROVIDERS = [
  "meta_ads",
  "google_ads",
  "ga4",
  "gsc",
  "merchant_center",
  "shopify",
  "nuvemshop",
  "vnda",
] as const;

export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];
