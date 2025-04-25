import type { NextAdminOptions } from "@premieroctet/next-admin";

const options: NextAdminOptions = {
  title: "Mooxy admin",

  model: {
    User: {
      toString: (user) => `${user.name} (${user.email})`,
      title: "Users",
      icon: "UsersIcon",
      list: {
        search: ["name", "email"],
        filters: [
        ],
      },
    },
    Tenant: {
      toString: (tenant) => `${tenant.name}`,
      title: "Tenants",
    },
    Brand: {
      toString: (brand) => `${brand.name}`,
      title: "Brands",
    },
    TenantAccount: {
      toString: (tenantAccount) => `${tenantAccount.id}`,
      title: "TenantAccount",
    },
    TenantSettings: {
      toString: (tenantSettings) => `${tenantSettings.id}`,
      title: "TenantSettings",
    },
    BrandSettings: {
      toString: (brandSettings) => `${brandSettings.id}`,
      title: "BrandSettings",
    },
    Lead: {
      toString: (Lead) => `${Lead.id}`,
      title: "Lead",
    },
    Origins: {
      toString: (Origins) => `${Origins.id}`,
      title: "Origins",
    },
    Destinations: {
      toString: (Destinations) => `${Destinations.id}`,
      title: "Destinations",
    }
  }
}

export default options;
