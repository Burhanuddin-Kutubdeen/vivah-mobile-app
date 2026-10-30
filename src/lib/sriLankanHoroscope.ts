/**
 * Sri Lankan Matrimony Horoscope & Heritage Definitions & Validation
 * Grounded in authentic Sri Lankan astrological tradition (විසි පොරොන්දම / කේන්ද්‍ර ගැලපීම).
 */

export const RELIGION_OPTIONS = [
  'Buddhist',
  'Christian',
  'Hindu',
  'Islam',
  'Agnostic',
  'Catholic',
  'None',
  'Other'
] as const;

export type ReligionType = typeof RELIGION_OPTIONS[number];

export const ETHNICITY_OPTIONS = [
  'Sinhalese',
  'Tamil',
  'Muslim',
  'Burgher',
  'Other'
] as const;

export type EthnicityType = typeof ETHNICITY_OPTIONS[number];

/**
 * The 12 Signs of the Zodiac (Rashis / රාශි 12)
 * Used for Lagna (Ascendant), Rashi (Moon Sign), and Navamshaya (නවාංශකය).
 */
export const SRI_LANKAN_ZODIAC_SIGNS = [
  { value: 'Mesha', label: 'Mesha (Aries / මේෂ)', sinhala: 'මේෂ', ruler: 'Kuja (Mars)' },
  { value: 'Vrushabha', label: 'Vrushabha (Taurus / වෘෂභ)', sinhala: 'වෘෂභ', ruler: 'Sukra (Venus)' },
  { value: 'Mithuna', label: 'Mithuna (Gemini / මිථුන)', sinhala: 'මිථුන', ruler: 'Budha (Mercury)' },
  { value: 'Kataka', label: 'Kataka (Cancer / කටක)', sinhala: 'කටක', ruler: 'Chandra (Moon)' },
  { value: 'Simha', label: 'Simha (Leo / සිංහ)', sinhala: 'සිංහ', ruler: 'Ravi (Sun)' },
  { value: 'Kanya', label: 'Kanya (Virgo / කන්‍යා)', sinhala: 'කන්‍යා', ruler: 'Budha (Mercury)' },
  { value: 'Thula', label: 'Thula (Libra / තුලා)', sinhala: 'තුලා', ruler: 'Sukra (Venus)' },
  { value: 'Vruschika', label: 'Vruschika (Scorpio / වෘශ්චික)', sinhala: 'වෘශ්චික', ruler: 'Kuja (Mars)' },
  { value: 'Dhanu', label: 'Dhanu (Sagittarius / ධනු)', sinhala: 'ධනු', ruler: 'Guru (Jupiter)' },
  { value: 'Makara', label: 'Makara (Capricorn / මකර)', sinhala: 'මකර', ruler: 'Shani (Saturn)' },
  { value: 'Kumbha', label: 'Kumbha (Aquarius / කුම්භ)', sinhala: 'කුම්භ', ruler: 'Shani (Saturn)' },
  { value: 'Meena', label: 'Meena (Pisces / මීන)', sinhala: 'මීන', ruler: 'Guru (Jupiter)' },
];

export const SRI_LANKAN_LAGNA_SIGNS = SRI_LANKAN_ZODIAC_SIGNS;
export const SRI_LANKAN_RASHI_SIGNS = SRI_LANKAN_ZODIAC_SIGNS;
export const SRI_LANKAN_NAVAMSHAYA_SIGNS = SRI_LANKAN_ZODIAC_SIGNS;

/**
 * 27 Sri Lankan Nakshathras (නැකත් 27) in traditional canonical order
 * Corrected with exact spellings:
 * - #4: Rehena / Rohini (රෙහෙණ / Rohini)
 * - #6: Ada / Aridra (අද / අද්‍රා / Ardra)
 * - #10: Maha or Makha (Magha / මා / මාඝ)
 * - Complete 1 through 27
 */
export interface NakshatraItem {
  id: number;
  number: string;
  name: string;
  sinhala: string;
  label: string;
  rashiSpan: string;
}

export const SRI_LANKAN_NEKATH_DETAILS: NakshatraItem[] = [
  { id: 1, number: '01', name: 'Aswida', sinhala: 'අස්විද', label: '01. Aswida (Ashwini / අස්විද)', rashiSpan: 'Mesha (1-4)' },
  { id: 2, number: '02', name: 'Berana', sinhala: 'බෙරණ', label: '02. Berana (Bharani / බෙරණ)', rashiSpan: 'Mesha (1-4)' },
  { id: 3, number: '03', name: 'Kethi', sinhala: 'කැති', label: '03. Kethi (Krittika / කැති)', rashiSpan: 'Mesha (1), Vrushabha (2-4)' },
  { id: 4, number: '04', name: 'Rehena / Rohini', sinhala: 'රෙහෙණ', label: '04. Rehena / Rohini (රෙහෙණ / Rohini)', rashiSpan: 'Vrushabha (1-4)' },
  { id: 5, number: '05', name: 'Muwasirisa', sinhala: 'මුවසිරස', label: '05. Muwasirisa (Mrigashira / මුවසිරස)', rashiSpan: 'Vrushabha (1-2), Mithuna (3-4)' },
  { id: 6, number: '06', name: 'Ada / Aridra', sinhala: 'අද / අද්‍රා', label: '06. Ada / Aridra (Ardra / අද / අද්‍රා)', rashiSpan: 'Mithuna (1-4)' },
  { id: 7, number: '07', name: 'Punawasa', sinhala: 'පුනාවස', label: '07. Punawasa (Punarvasu / පුනාවස)', rashiSpan: 'Mithuna (1-3), Kataka (4)' },
  { id: 8, number: '08', name: 'Pusa', sinhala: 'පුෂ', label: '08. Pusa (Pushya / පුෂ)', rashiSpan: 'Kataka (1-4)' },
  { id: 9, number: '09', name: 'Aslisa', sinhala: 'අස්ලිස', label: '09. Aslisa (Ashlesha / අස්ලිස)', rashiSpan: 'Kataka (1-4)' },
  { id: 10, number: '10', name: 'Maha or Makha', sinhala: 'මා / මාඝ', label: '10. Maha or Makha (Magha / මා / මාඝ)', rashiSpan: 'Simha (1-4)' },
  { id: 11, number: '11', name: 'Puwapal', sinhala: 'පුවපල්', label: '11. Puwapal (Purva Phalguni / පුවපල්)', rashiSpan: 'Simha (1-4)' },
  { id: 12, number: '12', name: 'Uthrapal', sinhala: 'උත්‍රපල්', label: '12. Uthrapal (Uttara Phalguni / උත්‍රපල්)', rashiSpan: 'Simha (1), Kanya (2-4)' },
  { id: 13, number: '13', name: 'Hatha', sinhala: 'හත', label: '13. Hatha (Hasta / හත)', rashiSpan: 'Kanya (1-4)' },
  { id: 14, number: '14', name: 'Chitha', sinhala: 'චිත', label: '14. Chitha (Chitra / චිත)', rashiSpan: 'Kanya (1-2), Thula (3-4)' },
  { id: 15, number: '15', name: 'Saa', sinhala: 'සා', label: '15. Saa (Swati / සා)', rashiSpan: 'Thula (1-4)' },
  { id: 16, number: '16', name: 'Wisa', sinhala: 'විසා', label: '16. Wisa (Vishakha / විසා)', rashiSpan: 'Thula (1-3), Vruschika (4)' },
  { id: 17, number: '17', name: 'Anura', sinhala: 'අනුර', label: '17. Anura (Anuradha / අනුර)', rashiSpan: 'Vruschika (1-4)' },
  { id: 18, number: '18', name: 'Deta', sinhala: 'දෙට', label: '18. Deta (Jyeshtha / දෙට)', rashiSpan: 'Vruschika (1-4)' },
  { id: 19, number: '19', name: 'Mula', sinhala: 'මුල', label: '19. Mula (Mula / මුල)', rashiSpan: 'Dhanu (1-4)' },
  { id: 20, number: '20', name: 'Puwasala', sinhala: 'පුවසල', label: '20. Puwasala (Purva Ashadha / පුවසල)', rashiSpan: 'Dhanu (1-4)' },
  { id: 21, number: '21', name: 'Uthrasala', sinhala: 'උත්‍රසල', label: '21. Uthrasala (Uttara Ashadha / උත්‍රසල)', rashiSpan: 'Dhanu (1), Makara (2-4)' },
  { id: 22, number: '22', name: 'Suwana', sinhala: 'සුවණ', label: '22. Suwana (Shravana / සුවණ)', rashiSpan: 'Makara (1-4)' },
  { id: 23, number: '23', name: 'Denata', sinhala: 'දෙනට', label: '23. Denata (Dhanishta / දෙනට)', rashiSpan: 'Makara (1-2), Kumbha (3-4)' },
  { id: 24, number: '24', name: 'Siyawasa', sinhala: 'සියාවස', label: '24. Siyawasa (Shatabhisha / සියාවස)', rashiSpan: 'Kumbha (1-4)' },
  { id: 25, number: '25', name: 'Puwaputupa', sinhala: 'පුවපුටුප', label: '25. Puwaputupa (Purva Bhadrapada / පුවපුටුප)', rashiSpan: 'Kumbha (1-3), Meena (4)' },
  { id: 26, number: '26', name: 'Uthraputupa', sinhala: 'උත්‍රපුටුප', label: '26. Uthraputupa (Uttara Bhadrapada / උත්‍රපුටුප)', rashiSpan: 'Meena (1-4)' },
  { id: 27, number: '27', name: 'Revathi', sinhala: 'රේවතී', label: '27. Revathi (Revati / රේවතී)', rashiSpan: 'Meena (1-4)' },
];

export const SRI_LANKAN_NEKATH = SRI_LANKAN_NEKATH_DETAILS.map(n => n.label);

/**
 * Nekatha Pada (පාදය 1-4)
 */
export const SRI_LANKAN_PADA_OPTIONS = [
  { value: 1, label: 'Pada 1 (1 වන පාදය)' },
  { value: 2, label: 'Pada 2 (2 වන පාදය)' },
  { value: 3, label: 'Pada 3 (3 වන පාදය)' },
  { value: 4, label: 'Pada 4 (4 වන පාදය)' },
];

/**
 * 9 Grahas (Planets) + Lagna for Sri Lankan Rashi Chakra (රාශි චක්‍රය / ලග්න කේන්ද්‍රය)
 */
export const SRI_LANKAN_GRAHAS = [
  { id: 'Lagna', name: 'Lagna', sinhala: 'ලග්නය', symbol: 'L' },
  { id: 'Ravi', name: 'Ravi (Sun)', sinhala: 'රවි', symbol: '☉' },
  { id: 'Chandra', name: 'Chandra (Moon)', sinhala: 'සඳු', symbol: '☽' },
  { id: 'Kuja', name: 'Kuja (Mars)', sinhala: 'කුජ', symbol: '♂' },
  { id: 'Budha', name: 'Budha (Mercury)', sinhala: 'බුධ', symbol: '☿' },
  { id: 'Guru', name: 'Guru (Jupiter)', sinhala: 'ගුරු', symbol: '♃' },
  { id: 'Sukra', name: 'Sukra (Venus)', sinhala: 'සිකුරු', symbol: '♀' },
  { id: 'Shani', name: 'Shani (Saturn)', sinhala: 'සෙනසුරු', symbol: '♄' },
  { id: 'Rahu', name: 'Rahu', sinhala: 'රාහු', symbol: '☊' },
  { id: 'Kethu', name: 'Kethu', sinhala: 'කේතු', symbol: '☋' },
];

/**
 * 12 Houses of Sri Lankan Kendraya (කොටු 12 / භාව 12)
 */
export const SRI_LANKAN_HOUSES = [
  { houseNumber: 1, name: '1st House (Lagna)', sinhala: '1 වන කොටුව (තනු / ලග්නය)' },
  { houseNumber: 2, name: '2nd House', sinhala: '2 වන කොටුව (ධන භාවය)' },
  { houseNumber: 3, name: '3rd House', sinhala: '3 වන කොටුව (සහජ භාවය)' },
  { houseNumber: 4, name: '4th House', sinhala: '4 වන කොටුව (බන්ධු භාවය)' },
  { houseNumber: 5, name: '5th House', sinhala: '5 වන කොටුව (පුත්‍ර භාවය)' },
  { houseNumber: 6, name: '6th House', sinhala: '6 වන කොටුව (ශත්‍රෘ භාවය)' },
  { houseNumber: 7, name: '7th House (Kalathra)', sinhala: '7 වන කොටුව (කලත්‍ර / විවාහ)' },
  { houseNumber: 8, name: '8th House (Ayur)', sinhala: '8 වන කොටුව (ආයුෂ භාවය)' },
  { houseNumber: 9, name: '9th House (Bhagya)', sinhala: '9 වන කොටුව (භාග්‍ය භාවය)' },
  { houseNumber: 10, name: '10th House (Karma)', sinhala: '10 වන කොටුව (කර්ම භාවය)' },
  { houseNumber: 11, name: '11th House (Labha)', sinhala: '11 වන කොටුව (ලාභ භාවය)' },
  { houseNumber: 12, name: '12th House (Vyaaya)', sinhala: '12 වන කොටුව (වැය භාවය)' },
];

/**
 * Common Sri Lankan Birth Districts / Cities
 */
export const SRI_LANKAN_BIRTH_PLACES = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
  'Other / International'
];

/**
 * Auto-derive Moon Sign (Rashi) from Nekatha (1-27) + Pada (1-4)
 * Traditional Vedic / Sri Lankan rule: 2.25 Nakshatras per Rashi (9 Padas per sign).
 */
export function deriveRashiFromNekathaAndPada(nekathaStr: string, padaNum: number): string | null {
  if (!nekathaStr || !padaNum || padaNum < 1 || padaNum > 4) return null;

  // Extract ID or name
  let nekId = 0;
  const matchNum = nekathaStr.match(/^(\d{1,2})\./);
  if (matchNum) {
    nekId = parseInt(matchNum[1], 10);
  } else {
    const item = SRI_LANKAN_NEKATH_DETAILS.find(n => nekathaStr.toLowerCase().includes(n.name.toLowerCase()));
    if (item) nekId = item.id;
  }

  if (nekId < 1 || nekId > 27) return null;

  // Total padas from 0 to 107
  const totalPadaIndex = (nekId - 1) * 4 + (padaNum - 1);
  const rashiIndex = Math.floor(totalPadaIndex / 9);

  if (rashiIndex >= 0 && rashiIndex < SRI_LANKAN_ZODIAC_SIGNS.length) {
    return SRI_LANKAN_ZODIAC_SIGNS[rashiIndex].value;
  }

  return null;
}

// Astrological keywords used in traditional Sri Lankan Kendraya (horoscope) matching
const SRI_LANKAN_ASTRO_KEYWORDS = [
  // Planets (Graha)
  'kuja', 'mars', 'ravi', 'sun', 'surya', 'chandra', 'moon', 'sanda', 'budha', 'mercury',
  'guru', 'brahaspathi', 'jupiter', 'shukra', 'sikuru', 'venus', 'shani', 'saturn', 'senasuru',
  'rahu', 'kethu', 'ketu',
  // Houses / Bhavas
  'lagna', 'lagnaya', 'rashi', 'rasi', 'bhava', 'house', 'kendra', 'thrikona', 'trikona',
  '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th',
  // Signs (Rashis)
  'mesha', 'vrushabha', 'mithuna', 'kataka', 'simha', 'kanya', 'thula', 'vruschika', 'dhanu', 'makara', 'kumbha', 'meena',
  // Nekath (Nakshatras)
  'aswida', 'berana', 'kethi', 'kathe', 'rehena', 'rohini', 'muwasirisa', 'muwasirasa', 'ada', 'aridra', 'punawasa', 'punavasa', 'pusa', 'pusha', 'aslisa',
  'ma', 'maha', 'makha', 'magha', 'puwapal', 'puvapal', 'uthrapal', 'hatha', 'chitha', 'saa', 'wisa', 'visa', 'anura', 'deta', 'mula',
  'puwasala', 'puvansala', 'uthrasala', 'suwana', 'suvana', 'denata', 'denatha', 'siyawasa', 'puwaputupa', 'uthraputupa', 'revathi',
  'nakshatra', 'nakshathra', 'nekatha',
  // Kendraya / Matching concepts
  'kendraya', 'kendra', 'porondam', 'porondama', 'porondam matching', 'gelapima',
  'pada', 'paada', 'padaya', 'dasa', 'dasha', 'mahadasha', 'anthardasha',
  'manglik', 'non-manglik', 'non manglik', 'dosha', 'kuja dosha', 'shani dosha',
  'subha', 'yoma', 'yoga', 'ashtama', 'kendradhipathi', 'navamsha', 'navamshaya', 'navamshaka'
];

/**
 * Validates Sri Lankan horoscope text.
 * Since horoscope entry is optional, empty text is considered valid.
 * When text is entered, it must contain recognizable Sri Lankan horoscope / Kendraya terminology,
 * planetary placements, or traditional astrological notes.
 */
export function validateSriLankanHoroscopeText(text: string): { isValid: boolean; message?: string } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isValid: true };
  }

  // Minimum length check
  if (trimmed.length < 3) {
    return {
      isValid: false,
      message: 'Please provide meaningful horoscope notes or leave blank if not applicable.'
    };
  }

  // Check if text contains Sinhala characters commonly found in Kendraya notes
  const hasSinhalaChars = /[\u0D80-\u0DFF]/.test(trimmed);
  if (hasSinhalaChars) {
    return { isValid: true };
  }

  // Check for common house/planet notation like "7th house", "Kuja in 7", "H7", "Mars 7", etc.
  const hasAstroPattern = /\b(house\s*\d{1,2}|\d{1,2}(st|nd|rd|th)\s*house|[1-9]|1[0-2])\b/i.test(trimmed) &&
    /\b(kuja|mars|shani|saturn|guru|jupiter|ravi|sun|moon|rahu|kethu|venus|mercury|lagna|sign)\b/i.test(trimmed);

  if (hasAstroPattern) {
    return { isValid: true };
  }

  // Lowercase normalized check against recognized Sri Lankan astrological vocabulary
  const lower = trimmed.toLowerCase();
  const matchedKeyword = SRI_LANKAN_ASTRO_KEYWORDS.find((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lower);
  });

  if (matchedKeyword) {
    return { isValid: true };
  }

  return {
    isValid: false,
    message: 'Please enter valid Sri Lankan astrological/Kendraya details (e.g. Lagna, planetary positions like "Kuja in 7, Shani in 8", Nekatha, or Porondam notes) or leave blank.'
  };
}
