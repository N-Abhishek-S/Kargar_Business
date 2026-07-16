export interface GtagConfigParams {
  send_page_view?: boolean;
  page_path?: string;
  page_title?: string;
  page_location?: string;
  [key: string]: unknown;
}

export interface GtagEventParams {
  page_path?: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
}

export type GtagArgs = 
  | [command: 'js', date: Date]
  | [command: 'config', targetId: string, config?: GtagConfigParams]
  | [command: 'event', eventName: string, eventParams?: GtagEventParams]
  | [command: 'set', config: Record<string, unknown>]
  | [command: 'consent', consentArg: string, consentParams: Record<string, unknown>];

export type GtagFunction = (...args: GtagArgs) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}
