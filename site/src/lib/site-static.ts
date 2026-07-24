export const site = {
  name: "Ramiyar Karanjia",
  tagline:
    "Zoroastrian religion, Avesta & Pahlavi, Iranian history, prayers, rituals, and the Shahnameh - written for clear reading.",
  contact: {
    name: "Dr. Ramiyar P. Karanjia",
    address:
      "Dadar Athornan Institute, 651-52, Firdausi Road, Mancherji Joshi Parsi Colony, Dadar (East), Mumbai 400 014, India",
    email: "ramiyark@gmail.com",
  },
} as const;

/** Homepage / SEO “Explore more about” phrases from the live WordPress site. */
export const linkWords: readonly { label: string; href: string }[] = [
  { label: "Ahura Mazda/Hormazd", href: "/article/ahura-mazda" },
  { label: "Zarathushtra/Zoroaster", href: "/article/prophet-zarathushtra" },
  { label: "Zoroastrian Religion", href: "/section/introduction" },
  { label: "Mazdayasna", href: "/section/introduction" },
  { label: "Ancient Iran/Persia", href: "/section/history" },
  { label: "Persian/Iranian history", href: "/article/history-of-iran-highlights" },
  { label: "Epic Shahnameh", href: "/section/shahnameh" },
  { label: "Iranian languages", href: "/article/iranian-languages-avesta-pahlavi-etc" },
  { label: "Avesta language and texts", href: "/article/avesta" },
  { label: "Gathas", href: "/article/prayers-for-5-gatha-days" },
  { label: "Pahlavi language and texts", href: "/article/pahlavi" },
  { label: "Zoroastrian Spirituality", href: "/article/spirituality" },
  { label: "Prayers", href: "/section/audio" },
  { label: "Rituals", href: "/section/rituals" },
  { label: "Customs", href: "/section/practices" },
  { label: "Ceremonies", href: "/section/rituals" },
];
