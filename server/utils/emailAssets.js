/**
 * Email Assets Utility
 * Provides company branding assets for email templates
 */

// Returns primary email asset URLs and company info
export const getEmailAssets = () => {
  const currentYear = new Date().getFullYear();
  
  return {
    // Support team image (Cloudinary or fallback)
    supportTeamImage:
      process.env.SUPPORT_TEAM_IMAGE_URL ||
      "https://res.cloudinary.com/dlcdjkgwl/image/upload/v1761574698/Screenshot_From_2025-07-11_11-58-03_u1r3xr.png",

    // Support link
    supportLink: process.env.SUPPORT_URL || "https://portfolio-nine-drab-jhsaity53z.vercel.app/#contact",

    // Company info
    companyName: process.env.COMPANY_NAME || "KwetuShop",
    companyWebsite: process.env.COMPANY_WEBSITE || "https://portfolio-nine-drab-jhsaity53z.vercel.app/",

    // Frontend URLs for verification links
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    adminUrl: process.env.ADMIN_URL || "http://localhost:5174",
    
    // Current year for footer
    currentYear: currentYear
  };
};

// Provides fallback assets in case of runtime/environment errors
export const getFallbackAssets = () => {
  const currentYear = new Date().getFullYear();
  
  return {
    supportTeamImage:
      "https://res.cloudinary.com/dlcdjkgwl/image/upload/v1761574698/Screenshot_From_2025-07-11_11-58-03_u1r3xr.png",
    supportLink: "https://portfolio-nine-drab-jhsaity53z.vercel.app/#contact",
    companyName: "KwetuShop",
    companyWebsite: "https://portfolio-nine-drab-jhsaity53z.vercel.app/",
    frontendUrl: "http://localhost:5173",
    adminUrl: "http://localhost:5174",
    currentYear: currentYear
  };
};

export default {
  getEmailAssets,
  getFallbackAssets
};