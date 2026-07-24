export type NavItem = {
  title: string;
  slug: string;
  children?: NavItem[];
};

export type Section = {
  id: string;
  title: string;
  blurb: string;
  items: NavItem[];
};

/** Information architecture from ramiyarkaranjia.com menus - content only, no invented pages. */
export const sections: Section[] = [
  {
    id: "introduction",
    title: "Zoroastrianism - An Introduction",
    blurb: "Start here: God, the Prophet, teachings, ethics, and daily spiritual life.",
    items: [
      { title: "Zoroastrianism - An Introduction", slug: "lets-understand-zoroastrianism-mar-sep-2016" },
      { title: "Necessity to Understand Religion", slug: "need-to-understand-religioneligion" },
      { title: "Ahura Mazda", slug: "ahura-mazda" },
      { title: "Prophet Zarathushtra", slug: "prophet-zarathushtra" },
      { title: "Teachings and World View", slug: "world-view-and-teachings" },
      { title: "Zoroastrian Ethics and Virtues", slug: "zoroastrian-ethics-and-virtues" },
      { title: "Human Being - Concept and Composition", slug: "human-being-concept-and-composition" },
      { title: "Zoroastrian Priests", slug: "zoroastrian-priests" },
      { title: "Manthra Prayers", slug: "manthra-prayers" },
      { title: "Spirituality", slug: "spirituality" },
    ],
  },
  {
    id: "correcting-misinformation",
    title: "Correcting Misinformation",
    blurb: "Clarifications on commonly misunderstood topics.",
    items: [
      {
        title: "Resurrection in Zoroastrianism",
        slug: "resurrection-in-the-zoroastrian-apocalyptic-tradition",
      },
    ],
  },
  {
    id: "life-story",
    title: "Zarathushtra Spitama’s Life Story",
    blurb: "The life of the Prophet, told in full.",
    items: [
      { title: "Zarathushtra Spitama’s Life Story", slug: "prophet-zarathushtra-spitama-life-story" },
    ],
  },
  {
    id: "divine-beings",
    title: "Zoroastrian Divine Beings",
    blurb: "Roj, Mah, and the divine beings of the religion.",
    items: [{ title: "Zoroastrian Divine Beings (Roj & Mah)", slug: "zoroastrian-divine-beings" }],
  },
  {
    id: "rituals",
    title: "Zoroastrian Rituals",
    blurb: "From Kasti and Navjot to Yasna, Vendidad, and death rituals.",
    items: [
      { title: "Zoroastrian Rituals - Overview", slug: "rituals-in-zoroastrianism" },
      { title: "Kasti ritual", slug: "kasti-ritual" },
      { title: "Nahan and Bareshnum", slug: "nahan-and-bareshnum-rituals" },
      { title: "Afringan, Jashan and Faresta", slug: "afringan-jashan-and-faresta-rituals" },
      { title: "Stum and Farokhshi", slug: "stum-and-farokhshi-rituals" },
      { title: "Bāj-dharna (Dron-Yasht)", slug: "the-baj-dharna-dron-yasht-ritual" },
      { title: "Death rituals", slug: "death-rituals" },
      { title: "Wedding customs and ritual", slug: "marriage-customs-and-ritual" },
      { title: "Navjot ritual", slug: "navjot-ritual" },
      { title: "Navar and Maratab", slug: "navar-and-maratab-rituals" },
      { title: "Yasna", slug: "yasna-ritual" },
      { title: "Vendidad", slug: "vendidad-ritual" },
      { title: "Nirang-din", slug: "nirang-din-ritual" },
      { title: "Boi", slug: "boi-ritual" },
    ],
  },
  {
    id: "festivals",
    title: "Zoroastrian Festivals",
    blurb: "The calendar of festivals and holy days.",
    items: [{ title: "Festivals of Zoroastrians", slug: "festivals-of-zoroastrians" }],
  },
  {
    id: "practices",
    title: "Practices & Customs",
    blurb: "Daily practice, prayers, Kasti, Muktad, and the Ses.",
    items: [
      { title: "Practices and Customs", slug: "zoroastrian-daily-life-practices-and-customs" },
      { title: "Prayers - Which, When and Why", slug: "prayers-which-when-and-why" },
      { title: "Prayers During Muktad Days", slug: "muktad-prayers" },
      { title: "Significance of Ses", slug: "significance-of-ses" },
      { title: "How to Do the Kasti Ritual", slug: "how-to-do-the-kasti-ritual" },
      { title: "Muktad or Farvardegan", slug: "muktad-or-farvardegan" },
    ],
  },
  {
    id: "languages",
    title: "Avesta, Pahlavi, Pazand & Persian",
    blurb: "The languages and texts of the tradition.",
    items: [
      { title: "Iranian Languages - Overview", slug: "iranian-languages-avesta-pahlavi-etc" },
      { title: "Avesta", slug: "avesta" },
      { title: "Old Persian", slug: "old-persian" },
      { title: "Pahlavi", slug: "pahlavi" },
      { title: "Pazand", slug: "pazand" },
      { title: "Persian", slug: "persian" },
      { title: "Gatha Days Prayers", slug: "prayers-for-5-gatha-days" },
    ],
  },
  {
    id: "tamam-khordeh-avesta",
    title: "Tamam Khordeh Avesta - Shahenshahi",
    blurb: "Full Shahenshahi Khordeh Avesta prayers and text.",
    items: [
      {
        title: "Tamam Khordeh Avesta (Shahenshahi)",
        slug: "tamam-khordeh-avesta-shahenshahi",
      },
    ],
  },
  {
    id: "audio",
    title: "Prayers - Audio & Texts",
    blurb: "Listen and read: Kasti, Sarosh Baj, 101 Names, and more.",
    items: [
      { title: "Prayers - Audio", slug: "audio-prayers" },
      { title: "Kasti Prayers", slug: "navjote-prayers" },
      { title: "Sarosh Baj", slug: "sarosh-baj" },
      { title: "101 Names of God", slug: "101-names-of-god" },
      { title: "Doa Tandarosti", slug: "doa-tandarosti" },
      { title: "Cherag-no-Namaskar", slug: "cherag-no-namaskar" },
      { title: "Names of Roj, Mah, Geh, Gatha and Gahambar", slug: "names-of-roj-mah-etc" },
      { title: "Framraot Ha (Muktad days 1-5)", slug: "framraot-ha-for-days-1-to-5-of-muktad" },
    ],
  },
  {
    id: "yashts",
    title: "Yashts - An Understanding",
    blurb: "Explanations of the major Yashts.",
    items: [
      { title: "Yashts - An Understanding", slug: "yashts-2" },
      { title: "Hormazd Yasht", slug: "hormazd-yasht-2" },
      { title: "Haptan Yasht", slug: "haptan-yasht" },
      { title: "Ardibahesht Yasht", slug: "ardibahesht-yasht" },
      { title: "Farvardin Yasht", slug: "farvardin-yasht" },
      { title: "Avan Yasht", slug: "avan-yasht" },
      { title: "Behram Yasht", slug: "behram-yasht" },
      { title: "Hom and Vanant Yashts", slug: "hom-and-vanant-yashts" },
      { title: "Siroza Yasht", slug: "siroza-yasht" },
    ],
  },
  {
    id: "time",
    title: "Gehs & Nyāsh",
    blurb: "The five watches of the day and the five Nyāsh.",
    items: [
      { title: "5 Gehs - An Understanding", slug: "5-gehs-an-understanding" },
      { title: "5 Nyāsh - An Understanding", slug: "5-nyash-an-understanding" },
    ],
  },
  {
    id: "history",
    title: "Ancient Iranian History",
    blurb: "From the Peshdadian kings through the Sasanian empire.",
    items: [
      { title: "History of Iran - Highlights", slug: "history-of-iran-highlights" },
      { title: "I Peshdad", slug: "827-2" },
      { title: "II Kayan", slug: "ii-kayan" },
      { title: "III Achaemenian / Hakhamanish", slug: "iii-achaemenian-hakhamanish" },
      { title: "IV Arshkan / Parthian", slug: "iv-arshkan-parthian" },
      { title: "V Sasan", slug: "v-sasan" },
    ],
  },
  {
    id: "shahnameh",
    title: "Shahnameh & Stories",
    blurb: "Epic tales: Jamshed, Faridun, Rustam, Behram, and more.",
    items: [
      { title: "Stories from the Shahnameh", slug: "stories-from-the-shahnameh" },
      { title: "King Hoshang and the Divinity of Fire", slug: "king-hoshang-and-divinity-of-fire" },
      { title: "The Rise and Fall of King Jamshed", slug: "the-rise-and-fall-of-king-jamshed" },
      { title: "Faridun and Zohak", slug: "faridun-and-zohak-the-victory-of-good-over-evil" },
      { title: "Marriage of Zal and Rodabeh", slug: "marriage-of-zal-and-rodabeh" },
      { title: "Sohrab and Rustam", slug: "sohrab-and-rustam-the-tragic-story" },
      { title: "Behram Gur Defeats Lions", slug: "behram-gur-defeats-lions-to-become-the-king" },
      { title: "The Justice of King Nosherwan", slug: "the-justice-of-king-nosherwan" },
      { title: "Buzorg-Meher and the Game of Chess", slug: "buzorg-meher-and-the-game-of-chess" },
    ],
  },
  {
    id: "pedia",
    title: "Zarthoshti-Pedia",
    blurb: "A mini encyclopedia of Zoroastrian and Iranian terms.",
    items: [
      {
        title: "Zarthoshti-Pedia - Mini Encyclopedia",
        slug: "zarthoshti-pedia-a-mini-encyclopedia-for-zoroastrian-and-iranian-terms",
      },
    ],
  },
  {
    id: "faqs",
    title: "Tell Me Why - FAQs",
    blurb: "Plain answers to common questions, topic by topic.",
    items: [
      { title: "Tell Me Why - Index", slug: "tell-me-why" },
      { title: "1. QA about Ahura Mazda", slug: "1-qa-about-ahura-mazda" },
      { title: "2. QA about Prophet Zarathushtra", slug: "qa-about-prophet-zaratushtra" },
      { title: "3. QA about Religion", slug: "3-qa-about-religion" },
      { title: "4. QA about Divine Beings", slug: "4-qa-about-divine-beings-yazads-etc" },
      { title: "5. QA about Creation & the Two Worlds", slug: "creation-the-2-worlds" },
      { title: "6. QA about Fire & Fire Temples", slug: "6-qa-about-fire-fire-temples" },
      { title: "7. QA about Navjot, Sadra & Kasti", slug: "7-qa-about-navjot-sadra-kasti" },
      { title: "8. QA about Prayers", slug: "8-qa-about-prayers" },
      { title: "9. QA about Rituals", slug: "9-qa-about-rituals" },
      { title: "10. QA about Zoroastrian History", slug: "10-qa-about-history" },
      { title: "11. QA about Muktad", slug: "11-qa-about-muktad" },
      { title: "12. QA about Zoroastrian Practices", slug: "12-qa-about-zoroastrian-practices" },
      { title: "13. QA about Iranian Geography", slug: "13-qa-about-geography" },
      { title: "14. QA about Great Zoroastrians", slug: "14-qa-about-great-zoroastrians" },
      { title: "15. QA about Priests", slug: "15-qa-about-priests" },
      { title: "16. QA about Death and Dokhmenashini", slug: "16-qa-about-death-and-dokhmenashini" },
      { title: "17. QA about Religious Literature", slug: "17-qa-about-zoroastrian-religious-literature" },
      { title: "18. QA about Animals", slug: "18-qa-about-animals-in-zoroastrian-religion" },
      { title: "19. QA about Other Religions", slug: "19-qa-about-zoroastrianism-other-religions" },
      { title: "20. QA about Numbers", slug: "20-qa-about-zoroastrianism-numbers" },
    ],
  },
  {
    id: "quotes",
    title: "Quotes",
    blurb: "Passages from Zoroastrian texts.",
    items: [{ title: "Quotes from Zoroastrian Texts", slug: "quotes-from-zoroastrian-texts" }],
  },
  {
    id: "books",
    title: "Books",
    blurb: "Links to books by Dr. Karanjia and related works.",
    items: [{ title: "Links to Books", slug: "books-on-zoroastrian-religion" }],
  },
  {
    id: "series",
    title: "Sasanian History Series",
    blurb: "Serial essays on the Sasanian dynasty, from founding kings to the last emperors.",
    items: [
      {
        title: "SSS 41. Yazdezerd III - Part 4",
        slug: "sss-41-yazdezerd-iii-yazdezerd-sheheryar-the-last-sasanian-emperor-part-4",
      },
      {
        title: "SSS 40. Yazdezerd III - Part 3",
        slug: "sss-40-yazdezerd-iii-yazdezerd-sheheryar-the-last-sasanian-emperor-part-3",
      },
      {
        title: "SSS 39. Yazdezerd III - Part 2",
        slug: "sss-39-yazdezerd-iii-yazdezerd-sheheryar-the-last-sasanian-emperor-part-2",
      },
      {
        title: "SSS 38. Yazdezerd III - Part 1",
        slug: "sss-38-yazdezerd-sheheryar-yazdezerd-iii-the-last-sasanian-emperor-part-1",
      },
      {
        title: "SSS 37. Ten Rulers in Eight Years - Part 2",
        slug: "sss-37-10-rulers-in-8-years-before-the-last-sasanian-emperor-part-2",
      },
      {
        title: "SSS 36. Ten Rulers in Eight Years - Part 1",
        slug: "sss-36-10-rulers-in-8-years-628-635before-the-last-sasanian-emperor-part-1",
      },
      {
        title: "SSS 35. King Kobad II / Shiroy (Feb 628 - Nov 628)",
        slug: "sss-35-king-kobad-ii-shiroy-feb-628-nov-628",
      },
      {
        title: "SSS 34. King Khushru Parviz - Part 11 (last)",
        slug: "sss-34-king-khushru-parviz-khushru-cosroe-ii-591-628-part-11-last",
      },
      {
        title: "SSS 33. King Khushru Parviz - Part 10",
        slug: "sss-33-king-khushru-parviz-khushru-cosroe-ii-591-628-part-10",
      },
      {
        title: "SSS 32. King Khushru Parviz - Part 9",
        slug: "sss-32-king-khushru-parviz-khushru-cosroe-ii-591-628-part-9",
      },
      {
        title: "SSS 31. King Khushru Parviz - Part 8",
        slug: "sss-31-king-khushru-parviz-khushru-cosroe-ii-591-628-part-8",
      },
      {
        title: "SSS 30. King Khushru Parviz - Part 7",
        slug: "sss-30-king-khushru-parviz-khushru-cosroe-ii-591-628-part-7",
      },
      {
        title: "SSS 29. King Khushru Parviz - Part 6",
        slug: "sss-29-king-khushru-parviz-khushru-cosroe-ii-591-628-part-6",
      },
      {
        title: "SSS 28. King Khushru Parviz - Part 5",
        slug: "sss-28-king-khushru-parviz-khushru-cosroe-ii-591-628-part-5",
      },
      {
        title: "SSS 27. King Khushru Parviz - Part 4",
        slug: "sss-27-king-khushru-parviz-khushru-cosroe-ii-591-628-part-4",
      },
      {
        title: "SSS 26. King Khushru Parviz - Part 3",
        slug: "sss-26-king-khushru-parviz-khushru-cosroe-ii-591-628-part-3",
      },
      {
        title: "SSS 25. King Khushru Parviz - Part 2",
        slug: "sss-24-king-khushru-parviz-khushru-cosroe-ii-591-628-part-2",
      },
      {
        title: "SSS 24. King Khushru Parviz - Part 1",
        slug: "sss-24-king-khushru-parviz-khushru-cosroe-ii-591-628-part-1",
      },
      {
        title: "SSS 23. King Hormazd IV - Part 2",
        slug: "sss-23-king-hormazd-iv-579-591-part-2",
      },
      {
        title: "SSS 22. King Hormazd IV - Part 1",
        slug: "sss-22-king-hormazd-iv-579-591-part-1",
      },
      {
        title: "SSS 21. King Khushru / Nosherwan Ādel - Part 7 (last)",
        slug: "sss-21-king-khushru-cosroe-i-nosherwan-adel-531-579-part-7-last",
      },
      {
        title: "SSS 20. King Khushru / Nosherwan Ādel - Part 6",
        slug: "sss-20-king-khushru-cosroe-i-nosherwan-adel-531-579-part-6",
      },
      {
        title: "SSS 19. King Khushru / Nosherwan Ādel - Part 5",
        slug: "sss-19-king-khushru-cosroe-i-nosherwan-adel-531-579-part-5",
      },
      {
        title: "SSS 18. King Khushru / Nosherwan Ādel - Part 4",
        slug: "sss18-king-khushru-cosroe-i-nosherwan-adel-531-579-part-4",
      },
      {
        title: "SSS 17. King Khushru / Nosherwan Ādel - Part 3",
        slug: "sss17-king-khushru-cosroe-i-nosherwan-adel-531-579-part-3",
      },
      {
        title: "SSS 16. King Khushru / Nosherwan Ādel - Part 2",
        slug: "sss15-king-khushru-cosroe-i-nosherwan-adel-531-579-part-2",
      },
      {
        title: "SSS 15. King Khushru / Nosherwan Ādel - Part 1",
        slug: "sss15-king-khushru-cosroe-i-nosherwan-adel-531-579-part-i",
      },
      {
        title: "SSS 14. Kings Balāsh, Kobād I and Jamasp",
        slug: "sss14-kings-balash-palash-484-487-kobad-i-487-496-498-591-and-jamasp-496-498",
      },
      {
        title: "SSS 13. Kings Yazdezard II, Hormazd III & Piruz I",
        slug: "sss13-kings-yazdezard-ii-440-457-hormazd-iii-457-458-piruz-i-458-484",
      },
      {
        title: "SSS 12. King Behram V, Behram-gur - Part 4",
        slug: "sss12-king-behram-v-behram-gur-419-439-part-4-concluded",
      },
      {
        title: "SSS 11. King Behram V, Behram-gur - Part 3",
        slug: "sss11-king-behram-v-behram-gur-part-3",
      },
      {
        title: "SSS 10. King Behram V, Behram-gur - Part 2",
        slug: "sss10-king-behram-v-behram-gur-part-2",
      },
      {
        title: "SSS 9. King Behram V, Behram-gur - Part 1",
        slug: "sss9-king-behram-v-behram-gur-part-1",
      },
      {
        title: "SSS 8. Yazdezerd I (Athil) and 3 kings before him",
        slug: "sss7-yazdezerd-i-athil-and-3-kings-before-him",
      },
      {
        title: "SSS 7. Shahpur II, The Great - Part 2",
        slug: "sss6-shahpur-ii-the-great-part-2",
      },
      {
        title: "SSS 6. Shahpur II, The Great - Part 1",
        slug: "sss6-shahpur-ii-the-great-1",
      },
      {
        title: "SSS 5. Shahpur I",
        slug: "sss5-shahpur-i",
      },
      {
        title: "SSS 4. Ardeshir Bābekān - Part 3",
        slug: "sss4-ardeshir-babekan-part-3-concluded",
      },
      {
        title: "SSS 3. Ardeshir Bābekān - Part 2",
        slug: "sss3-ardeshir-babekanpart-2",
      },
      {
        title: "SSS 2. Ardeshir Bābekān - Part 1",
        slug: "sss2-ardeshir-babekan-papakan-226-240-ce",
      },
      {
        title: "SSS 1. Sasanian Dynasty (224-651 CE)",
        slug: "sss1-sasanian-dynasty-224-651-ce",
      },
    ],
  },
];

export function findSectionForSlug(slug: string): Section | undefined {
  return sections.find((s) => s.items.some((i) => i.slug === slug));
}

export function breadcrumbsForSlug(slug: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
  ];
  const section = findSectionForSlug(slug);
  if (section) {
    crumbs.push({ label: section.title, href: `/section/${section.id}` });
    const item = section.items.find((i) => i.slug === slug);
    if (item) crumbs.push({ label: item.title, href: `/article/${slug}` });
  } else if (slug === "about") {
    crumbs.push({ label: "About", href: "/article/about" });
  }
  return crumbs;
}

export const homeFeatured = [
  "lets-understand-zoroastrianism-mar-sep-2016",
  "prophet-zarathushtra",
  "navjot-ritual",
  "how-to-do-the-kasti-ritual",
  "festivals-of-zoroastrians",
  "tell-me-why",
  "history-of-iran-highlights",
  "stories-from-the-shahnameh",
] as const;
