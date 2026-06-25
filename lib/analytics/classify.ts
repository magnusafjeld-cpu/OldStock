import type { ProductCategory } from "@/types/domain";

/**
 * Heuristic classification of free-text article names into the product
 * categories Elkjøp cares about for old-stock analysis.
 *
 * The export contains the whole store assortment, so the classifier must:
 *  1. Strip accessories first (a "ZAGG Case iPhone 17" is an accessory, not a
 *     phone) so the focus categories represent actual devices.
 *  2. Detect tablets / watches / phones, in that order (avoids iPad↔iPhone and
 *     "watch strap" false positives).
 *
 * Classification is transparent and intentionally conservative — it is exposed
 * in the UI and never silently changes the underlying figures.
 */

// Accessory / non-device markers (incl. common case & strap brands seen in data).
const ACCESSORY =
  /\b(case|cover|folio|wallet|strap|bands?|keyboard|screen ?prot|clrprtct|prtct|protector|protection|tempered|glass|charger|charging|cable|adapter|sleeve|stand|grip|holder|mount|skin|magsafe|qi2?|pen|stylus|dock|cradle|lens|tripod|gimbal|powerbank|power bank)\b|\b(zagg|mujjo|dbramante|db1928|lynge|greenland|roskilde|targus|spigen|otterbox|nudient|holdit|gear4|tech21|sandstr|peak design|belkin|cygnett)\b/i;

const TABLET =
  /\bipad\b|galaxy tab|\btab s\d|\btab a\d|lenovo tab|\btablet\b|matepad|\bpad \d|fire (hd|7|8|10)|\bxiaomi pad\b|doro tablet/i;

const WATCH =
  /apple watch|galaxy watch|watch ultra|watch se\b|watch series|watch fit|\bwatch\d|watch \d|pixel watch|\bgarmin\b|\bfitbit\b|amazfit|withings|huawei watch|smartwatch|watch gt|forerunner|\bvivo(active|fit|move)\b|\bvenu\b|\bfenix\b|\binstinct\b|\bepix\b|demo watch|rdu watch|doro watch|running ?watch|\bpolar (pacer|vantage|grit|ignite|unite|m\d|v\d)/i;

const PHONE =
  /\biphone\b|galaxy s\d|galaxy a\d|galaxy z (fold|flip)|\bz fold|\bz flip|samsung s\d{2}|samsung a\d{2}|\bpixel \d|\bredmi\b|\bpoco\b|xiaomi \d|oneplus|nothing phone|motorola|moto g|moto e|sony xperia|\bxperia\b|\bhonor \d|\boppo |\bsmartphone\b|fairphone|\bdoro \d{3,}/i;

export function classifyCategory(name: string): ProductCategory {
  const s = ` ${name} `;
  if (ACCESSORY.test(s)) return "Other";
  if (TABLET.test(s)) return "Tablet";
  if (WATCH.test(s)) return "Smartwatch";
  if (PHONE.test(s)) return "Smartphone";
  return "Other";
}

const BRAND_PATTERNS: [RegExp, string][] = [
  [/\biphone\b|\bipad\b|\bmacbook\b|\bairpods\b|apple watch|\bmac\b|\bimac\b|^apple|\bapple\b/i, "Apple"],
  [/samsung|galaxy/i, "Samsung"],
  [/\bpixel\b|\bgoogle\b/i, "Google"],
  [/\bgarmin\b/i, "Garmin"],
  [/\bpolar\b/i, "Polar"],
  [/\bfitbit\b/i, "Fitbit"],
  [/amazfit|\bhuami\b/i, "Amazfit"],
  [/xiaomi|redmi|\bpoco\b/i, "Xiaomi"],
  [/oneplus/i, "OnePlus"],
  [/nothing phone/i, "Nothing"],
  [/motorola|moto [ge]/i, "Motorola"],
  [/\bsony\b|xperia/i, "Sony"],
  [/\bhonor\b/i, "Honor"],
  [/\boppo\b/i, "Oppo"],
  [/\bnokia\b/i, "Nokia"],
  [/\bdoro\b/i, "Doro"],
  [/\blenovo\b/i, "Lenovo"],
  [/\bhuawei\b/i, "Huawei"],
  [/fairphone/i, "Fairphone"],
  [/withings/i, "Withings"],
];

export function detectBrand(name: string): string {
  for (const [pattern, brand] of BRAND_PATTERNS) {
    if (pattern.test(name)) return brand;
  }
  return "Other";
}

export function detectFlags(name: string): {
  outlet: boolean;
  demo: boolean;
  used: boolean;
} {
  const s = name.toLowerCase();
  return {
    outlet: /\boutlet\b|^outlet-/i.test(name),
    demo: /\bdemo\b|\brdu\b|\bdummy\b|display unit/i.test(s),
    used: /\bused\b|\bbrukt\b|\brefurb/i.test(s),
  };
}
