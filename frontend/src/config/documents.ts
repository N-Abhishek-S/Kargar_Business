export type DocumentKey = "companyProfile" | "brochure";
export type DocumentCategory = "company" | "service" | "case-study" | "certificate" | "policy";

export interface DocumentAnalyticsContext {
  page: string;
  category?: string;
  service?: string;
  source?: string;
  ctaPosition?: string;
  campaign?: string;
  device?: string;
  referrer?: string;
}

export interface DocumentDefinition {
  id: string;
  title: string;
  description: string;
  filename: string;
  file: string;
  fileSize: string;
  fileType: string;
  category: DocumentCategory;
  thumbnail?: string;
  available: boolean;
  downloadName: string;
  content: {
    version: string;
    lastUpdated: string;
    status: "published" | "draft" | "archived";
  };
  previewEnabled: boolean;
  downloadEnabled: boolean;
  shareEnabled: boolean;
}

export const documentRegistry: Record<DocumentKey, DocumentDefinition> = {
  companyProfile: {
    id: "company-profile",
    title: "Company Profile",
    description: "Professional overview of Kargar Business Services, our history, services, and capabilities.",
    filename: "Company Profile.pdf",
    file: "/assets/documents/Company%20Profile.pdf",
    fileSize: "2.4 MB",
    fileType: "PDF",
    category: "company",
    available: true,
    downloadName: "Kargar-Company-Profile.pdf",
    content: {
      version: "v1.2",
      lastUpdated: "2026-07-15",
      status: "published",
    },
    previewEnabled: true,
    downloadEnabled: true,
    shareEnabled: true,
  },
  brochure: {
    id: "brochure",
    title: "Company Brochure",
    description: "Explore our complete facility management solutions and service portfolio.",
    filename: "Company Brochure.pdf",
    file: "/assets/documents/Company%20Brochure.pdf",
    fileSize: "3.1 MB",
    fileType: "PDF",
    category: "company",
    available: true,
    downloadName: "Kargar-Company-Brochure.pdf",
    content: {
      version: "v1.0",
      lastUpdated: "2026-07-15",
      status: "published",
    },
    previewEnabled: true,
    downloadEnabled: true,
    shareEnabled: true,
  }
};
