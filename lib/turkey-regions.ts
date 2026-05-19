export type Region =
  | "marmara"
  | "ege"
  | "akdeniz"
  | "ic_anadolu"
  | "karadeniz"
  | "dogu_anadolu"
  | "guneydogu_anadolu";

export const REGION_LABELS: Record<Region, string> = {
  marmara: "Marmara",
  ege: "Ege",
  akdeniz: "Akdeniz",
  ic_anadolu: "İç Anadolu",
  karadeniz: "Karadeniz",
  dogu_anadolu: "Doğu Anadolu",
  guneydogu_anadolu: "Güneydoğu Anadolu",
};

export const REGION_OPTIONS: ReadonlyArray<{ value: Region; label: string }> = [
  { value: "marmara", label: REGION_LABELS.marmara },
  { value: "ege", label: REGION_LABELS.ege },
  { value: "akdeniz", label: REGION_LABELS.akdeniz },
  { value: "ic_anadolu", label: REGION_LABELS.ic_anadolu },
  { value: "karadeniz", label: REGION_LABELS.karadeniz },
  { value: "dogu_anadolu", label: REGION_LABELS.dogu_anadolu },
  { value: "guneydogu_anadolu", label: REGION_LABELS.guneydogu_anadolu },
];

const CITY_TO_REGION: Record<string, Region> = {
  // Marmara
  istanbul: "marmara",
  edirne: "marmara",
  kirklareli: "marmara",
  tekirdag: "marmara",
  canakkale: "marmara",
  balikesir: "marmara",
  bursa: "marmara",
  bilecik: "marmara",
  yalova: "marmara",
  kocaeli: "marmara",
  sakarya: "marmara",
  // Ege
  izmir: "ege",
  manisa: "ege",
  aydin: "ege",
  mugla: "ege",
  denizli: "ege",
  usak: "ege",
  kutahya: "ege",
  afyon: "ege",
  afyonkarahisar: "ege",
  // Akdeniz
  antalya: "akdeniz",
  burdur: "akdeniz",
  isparta: "akdeniz",
  mersin: "akdeniz",
  adana: "akdeniz",
  osmaniye: "akdeniz",
  hatay: "akdeniz",
  kahramanmaras: "akdeniz",
  // İç Anadolu
  ankara: "ic_anadolu",
  konya: "ic_anadolu",
  eskisehir: "ic_anadolu",
  kayseri: "ic_anadolu",
  yozgat: "ic_anadolu",
  cankiri: "ic_anadolu",
  kirikkale: "ic_anadolu",
  kirsehir: "ic_anadolu",
  nevsehir: "ic_anadolu",
  aksaray: "ic_anadolu",
  nigde: "ic_anadolu",
  karaman: "ic_anadolu",
  sivas: "ic_anadolu",
  // Karadeniz
  sinop: "karadeniz",
  samsun: "karadeniz",
  amasya: "karadeniz",
  tokat: "karadeniz",
  corum: "karadeniz",
  ordu: "karadeniz",
  giresun: "karadeniz",
  trabzon: "karadeniz",
  rize: "karadeniz",
  artvin: "karadeniz",
  gumushane: "karadeniz",
  bayburt: "karadeniz",
  bartin: "karadeniz",
  karabuk: "karadeniz",
  zonguldak: "karadeniz",
  bolu: "karadeniz",
  duzce: "karadeniz",
  kastamonu: "karadeniz",
  // Doğu Anadolu
  erzurum: "dogu_anadolu",
  erzincan: "dogu_anadolu",
  agri: "dogu_anadolu",
  ardahan: "dogu_anadolu",
  igdir: "dogu_anadolu",
  kars: "dogu_anadolu",
  bingol: "dogu_anadolu",
  bitlis: "dogu_anadolu",
  elazig: "dogu_anadolu",
  hakkari: "dogu_anadolu",
  malatya: "dogu_anadolu",
  mus: "dogu_anadolu",
  tunceli: "dogu_anadolu",
  van: "dogu_anadolu",
  // Güneydoğu Anadolu
  gaziantep: "guneydogu_anadolu",
  adiyaman: "guneydogu_anadolu",
  batman: "guneydogu_anadolu",
  diyarbakir: "guneydogu_anadolu",
  kilis: "guneydogu_anadolu",
  mardin: "guneydogu_anadolu",
  siirt: "guneydogu_anadolu",
  sanliurfa: "guneydogu_anadolu",
  urfa: "guneydogu_anadolu",
  sirnak: "guneydogu_anadolu",
};

function normalizeCity(input: string): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function regionForCity(city: string | null | undefined): Region | null {
  if (!city) return null;
  const key = normalizeCity(city);
  return CITY_TO_REGION[key] ?? null;
}

export function labelForRegion(region: Region | null | undefined): string | null {
  if (!region) return null;
  return REGION_LABELS[region];
}
