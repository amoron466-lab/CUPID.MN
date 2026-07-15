export type SiteConfig = {
  question: string;
  yesButtonText: string;
  noButtonText: string;
  successMessage: string;
  psMessage: string;
  location: string;
  date: string;
  time: string;
  mapsUrl: string;
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  question: "Надтай болзоонд явах уу?",
  yesButtonText: "ТЭГЬЕ💅",
  noButtonText: "ГҮЙ ШҮҮ🖕",
  successMessage: "Цагаа бариарай, царайлгаа",
  psMessage: "Хоцорвол хоёр үнсэлт😌",
  location: "Улаанбаатар хот",
  date: "2026.08.15",
  time: "19:00",
  mapsUrl: "https://maps.google.com/?q=Ulaanbaatar",
};
