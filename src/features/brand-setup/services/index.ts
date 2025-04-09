import { BrandSetupService } from "./brand-setup-service";

// Export a singleton instance of the brand setup service
export const brandSetupService = new BrandSetupService();

// Re-export the service class
export { BrandSetupService };
