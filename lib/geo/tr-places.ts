/**
 * Mapbox API key olmadığında kullanılan yerel TR şehir/ilçe veritabanı.
 * 81 il merkezi + büyük şehirlerin önemli ilçeleri.
 * Koordinatlar yaklaşık merkez (lng, lat).
 */

export interface TrPlace {
  id: string;
  name: string; // gösterilen: "Kadıköy, İstanbul"
  city: string; // il adı: "İstanbul"
  district: string | null; // ilçe adı: "Kadıköy" veya null (il merkezi)
  lng: number;
  lat: number;
  keywords: string; // arama için normalize edilmiş
}

function k(...parts: (string | null)[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");
}

interface Raw {
  city: string;
  lng: number;
  lat: number;
  districts?: Array<{ name: string; lng: number; lat: number }>;
}

const RAW: Raw[] = [
  {
    city: "Adana",
    lng: 35.3213,
    lat: 37.0,
    districts: [
      { name: "Seyhan", lng: 35.3289, lat: 37.0 },
      { name: "Yüreğir", lng: 35.4, lat: 36.97 },
      { name: "Çukurova", lng: 35.32, lat: 37.06 },
      { name: "Sarıçam", lng: 35.43, lat: 37.07 },
      { name: "Ceyhan", lng: 35.82, lat: 37.02 },
    ],
  },
  {
    city: "Adıyaman",
    lng: 38.2786,
    lat: 37.7648,
    districts: [
      { name: "Merkez", lng: 38.2786, lat: 37.7648 },
      { name: "Kahta", lng: 38.62, lat: 37.78 },
    ],
  },
  {
    city: "Afyonkarahisar",
    lng: 30.5567,
    lat: 38.7569,
    districts: [
      { name: "Merkez", lng: 30.5567, lat: 38.7569 },
      { name: "Sandıklı", lng: 30.27, lat: 38.46 },
    ],
  },
  {
    city: "Ağrı",
    lng: 43.0509,
    lat: 39.7191,
  },
  {
    city: "Aksaray",
    lng: 34.0254,
    lat: 38.3687,
  },
  {
    city: "Amasya",
    lng: 35.8353,
    lat: 40.6499,
  },
  {
    city: "Ankara",
    lng: 32.8597,
    lat: 39.9334,
    districts: [
      { name: "Çankaya", lng: 32.85, lat: 39.91 },
      { name: "Yenimahalle", lng: 32.78, lat: 39.96 },
      { name: "Keçiören", lng: 32.86, lat: 39.98 },
      { name: "Mamak", lng: 32.92, lat: 39.93 },
      { name: "Etimesgut", lng: 32.66, lat: 39.96 },
      { name: "Sincan", lng: 32.58, lat: 39.97 },
      { name: "Altındağ", lng: 32.87, lat: 39.95 },
      { name: "Pursaklar", lng: 32.9, lat: 40.04 },
      { name: "Gölbaşı", lng: 32.81, lat: 39.79 },
      { name: "Polatlı", lng: 32.15, lat: 39.58 },
    ],
  },
  {
    city: "Antalya",
    lng: 30.7133,
    lat: 36.8841,
    districts: [
      { name: "Muratpaşa", lng: 30.72, lat: 36.87 },
      { name: "Konyaaltı", lng: 30.63, lat: 36.86 },
      { name: "Kepez", lng: 30.7, lat: 36.93 },
      { name: "Alanya", lng: 31.99, lat: 36.54 },
      { name: "Manavgat", lng: 31.44, lat: 36.79 },
      { name: "Side", lng: 31.39, lat: 36.77 },
      { name: "Kemer", lng: 30.56, lat: 36.6 },
      { name: "Belek", lng: 31.06, lat: 36.86 },
      { name: "Kaş", lng: 29.64, lat: 36.2 },
      { name: "Serik", lng: 31.1, lat: 36.92 },
    ],
  },
  {
    city: "Ardahan",
    lng: 42.7022,
    lat: 41.1105,
  },
  {
    city: "Artvin",
    lng: 41.8202,
    lat: 41.1828,
  },
  {
    city: "Aydın",
    lng: 27.8456,
    lat: 37.8444,
    districts: [
      { name: "Efeler", lng: 27.85, lat: 37.85 },
      { name: "Kuşadası", lng: 27.26, lat: 37.86 },
      { name: "Didim", lng: 27.27, lat: 37.37 },
      { name: "Nazilli", lng: 28.32, lat: 37.91 },
    ],
  },
  {
    city: "Balıkesir",
    lng: 27.8826,
    lat: 39.6484,
    districts: [
      { name: "Altıeylül", lng: 27.91, lat: 39.65 },
      { name: "Karesi", lng: 27.89, lat: 39.65 },
      { name: "Bandırma", lng: 27.97, lat: 40.35 },
      { name: "Edremit", lng: 27.02, lat: 39.6 },
      { name: "Ayvalık", lng: 26.69, lat: 39.31 },
      { name: "Burhaniye", lng: 26.97, lat: 39.5 },
      { name: "Gönen", lng: 27.65, lat: 40.1 },
    ],
  },
  {
    city: "Bartın",
    lng: 32.3375,
    lat: 41.6358,
  },
  {
    city: "Batman",
    lng: 41.1351,
    lat: 37.8812,
  },
  {
    city: "Bayburt",
    lng: 40.2249,
    lat: 40.2552,
  },
  {
    city: "Bilecik",
    lng: 29.9833,
    lat: 40.15,
    districts: [
      { name: "Merkez", lng: 29.98, lat: 40.15 },
      { name: "Bozüyük", lng: 30.04, lat: 39.9 },
      { name: "Söğüt", lng: 30.18, lat: 40.02 },
    ],
  },
  {
    city: "Bingöl",
    lng: 40.4979,
    lat: 38.8847,
  },
  {
    city: "Bitlis",
    lng: 42.1234,
    lat: 38.4011,
  },
  {
    city: "Bolu",
    lng: 31.6089,
    lat: 40.7392,
    districts: [
      { name: "Merkez", lng: 31.61, lat: 40.74 },
      { name: "Gerede", lng: 32.2, lat: 40.79 },
    ],
  },
  {
    city: "Burdur",
    lng: 30.2887,
    lat: 37.7203,
  },
  {
    city: "Bursa",
    lng: 29.0611,
    lat: 40.1828,
    districts: [
      { name: "Osmangazi", lng: 29.06, lat: 40.19 },
      { name: "Nilüfer", lng: 28.95, lat: 40.21 },
      { name: "Yıldırım", lng: 29.13, lat: 40.2 },
      { name: "Gemlik", lng: 29.16, lat: 40.43 },
      { name: "Mudanya", lng: 28.88, lat: 40.38 },
      { name: "İnegöl", lng: 29.51, lat: 40.08 },
      { name: "Mustafakemalpaşa", lng: 28.41, lat: 40.04 },
    ],
  },
  {
    city: "Çanakkale",
    lng: 26.4142,
    lat: 40.1553,
    districts: [
      { name: "Merkez", lng: 26.41, lat: 40.16 },
      { name: "Biga", lng: 27.24, lat: 40.23 },
      { name: "Gelibolu", lng: 26.67, lat: 40.41 },
      { name: "Ezine", lng: 26.34, lat: 39.79 },
    ],
  },
  {
    city: "Çankırı",
    lng: 33.6134,
    lat: 40.6013,
  },
  {
    city: "Çorum",
    lng: 34.9533,
    lat: 40.5506,
  },
  {
    city: "Denizli",
    lng: 29.0875,
    lat: 37.7765,
    districts: [
      { name: "Pamukkale", lng: 29.13, lat: 37.79 },
      { name: "Merkezefendi", lng: 29.06, lat: 37.78 },
      { name: "Sarayköy", lng: 28.91, lat: 37.92 },
    ],
  },
  {
    city: "Diyarbakır",
    lng: 40.2306,
    lat: 37.9144,
    districts: [
      { name: "Bağlar", lng: 40.21, lat: 37.93 },
      { name: "Kayapınar", lng: 40.18, lat: 37.93 },
      { name: "Yenişehir", lng: 40.21, lat: 37.92 },
      { name: "Sur", lng: 40.23, lat: 37.91 },
    ],
  },
  {
    city: "Düzce",
    lng: 31.1565,
    lat: 40.8438,
  },
  {
    city: "Edirne",
    lng: 26.5557,
    lat: 41.6818,
    districts: [
      { name: "Merkez", lng: 26.56, lat: 41.68 },
      { name: "Keşan", lng: 26.62, lat: 40.85 },
      { name: "Uzunköprü", lng: 26.69, lat: 41.27 },
    ],
  },
  {
    city: "Elazığ",
    lng: 39.2226,
    lat: 38.681,
  },
  {
    city: "Erzincan",
    lng: 39.4905,
    lat: 39.7464,
  },
  {
    city: "Erzurum",
    lng: 41.2769,
    lat: 39.9043,
    districts: [
      { name: "Yakutiye", lng: 41.27, lat: 39.91 },
      { name: "Palandöken", lng: 41.27, lat: 39.88 },
      { name: "Aziziye", lng: 41.21, lat: 39.91 },
    ],
  },
  {
    city: "Eskişehir",
    lng: 30.5256,
    lat: 39.7767,
    districts: [
      { name: "Tepebaşı", lng: 30.51, lat: 39.79 },
      { name: "Odunpazarı", lng: 30.54, lat: 39.76 },
    ],
  },
  {
    city: "Gaziantep",
    lng: 37.3833,
    lat: 37.0662,
    districts: [
      { name: "Şahinbey", lng: 37.38, lat: 37.05 },
      { name: "Şehitkamil", lng: 37.39, lat: 37.09 },
      { name: "Nizip", lng: 37.79, lat: 37.01 },
    ],
  },
  {
    city: "Giresun",
    lng: 38.3895,
    lat: 40.9128,
  },
  {
    city: "Gümüşhane",
    lng: 39.4814,
    lat: 40.4602,
  },
  {
    city: "Hakkari",
    lng: 43.7407,
    lat: 37.5744,
  },
  {
    city: "Hatay",
    lng: 36.1611,
    lat: 36.2,
    districts: [
      { name: "Antakya", lng: 36.16, lat: 36.2 },
      { name: "İskenderun", lng: 36.17, lat: 36.59 },
      { name: "Defne", lng: 36.16, lat: 36.18 },
      { name: "Dörtyol", lng: 36.22, lat: 36.84 },
    ],
  },
  {
    city: "Iğdır",
    lng: 44.045,
    lat: 39.9237,
  },
  {
    city: "Isparta",
    lng: 30.5566,
    lat: 37.7648,
  },
  {
    city: "İstanbul",
    lng: 28.9784,
    lat: 41.0082,
    districts: [
      { name: "Kadıköy", lng: 29.03, lat: 40.99 },
      { name: "Üsküdar", lng: 29.02, lat: 41.02 },
      { name: "Beşiktaş", lng: 29.0, lat: 41.04 },
      { name: "Şişli", lng: 28.99, lat: 41.06 },
      { name: "Beyoğlu", lng: 28.97, lat: 41.03 },
      { name: "Fatih", lng: 28.94, lat: 41.02 },
      { name: "Bakırköy", lng: 28.87, lat: 40.98 },
      { name: "Maltepe", lng: 29.13, lat: 40.94 },
      { name: "Kartal", lng: 29.18, lat: 40.91 },
      { name: "Pendik", lng: 29.23, lat: 40.88 },
      { name: "Tuzla", lng: 29.3, lat: 40.82 },
      { name: "Ataşehir", lng: 29.13, lat: 40.99 },
      { name: "Ümraniye", lng: 29.11, lat: 41.02 },
      { name: "Sancaktepe", lng: 29.23, lat: 41.0 },
      { name: "Çekmeköy", lng: 29.18, lat: 41.04 },
      { name: "Esenyurt", lng: 28.68, lat: 41.03 },
      { name: "Avcılar", lng: 28.72, lat: 40.98 },
      { name: "Beylikdüzü", lng: 28.63, lat: 41.0 },
      { name: "Küçükçekmece", lng: 28.78, lat: 41.0 },
      { name: "Bağcılar", lng: 28.85, lat: 41.04 },
      { name: "Bahçelievler", lng: 28.85, lat: 41.0 },
      { name: "Sarıyer", lng: 29.05, lat: 41.17 },
      { name: "Beykoz", lng: 29.09, lat: 41.13 },
      { name: "Eyüpsultan", lng: 28.93, lat: 41.05 },
      { name: "Gaziosmanpaşa", lng: 28.91, lat: 41.07 },
      { name: "Sultangazi", lng: 28.87, lat: 41.1 },
      { name: "Esenler", lng: 28.88, lat: 41.05 },
      { name: "Zeytinburnu", lng: 28.9, lat: 40.99 },
      { name: "Güngören", lng: 28.88, lat: 41.02 },
      { name: "Başakşehir", lng: 28.8, lat: 41.09 },
      { name: "Arnavutköy", lng: 28.74, lat: 41.18 },
      { name: "Silivri", lng: 28.25, lat: 41.07 },
      { name: "Çatalca", lng: 28.46, lat: 41.14 },
      { name: "Şile", lng: 29.61, lat: 41.18 },
      { name: "Adalar", lng: 29.09, lat: 40.87 },
    ],
  },
  {
    city: "İzmir",
    lng: 27.142,
    lat: 38.4192,
    districts: [
      { name: "Konak", lng: 27.13, lat: 38.42 },
      { name: "Karşıyaka", lng: 27.1, lat: 38.46 },
      { name: "Bornova", lng: 27.21, lat: 38.47 },
      { name: "Buca", lng: 27.18, lat: 38.39 },
      { name: "Bayraklı", lng: 27.17, lat: 38.46 },
      { name: "Gaziemir", lng: 27.13, lat: 38.32 },
      { name: "Çiğli", lng: 27.07, lat: 38.49 },
      { name: "Karabağlar", lng: 27.13, lat: 38.4 },
      { name: "Balçova", lng: 27.07, lat: 38.39 },
      { name: "Narlıdere", lng: 27.02, lat: 38.4 },
      { name: "Urla", lng: 26.76, lat: 38.32 },
      { name: "Çeşme", lng: 26.31, lat: 38.32 },
      { name: "Foça", lng: 26.75, lat: 38.67 },
      { name: "Aliağa", lng: 26.97, lat: 38.8 },
      { name: "Menemen", lng: 27.07, lat: 38.61 },
      { name: "Torbalı", lng: 27.36, lat: 38.16 },
      { name: "Selçuk", lng: 27.37, lat: 37.95 },
      { name: "Bergama", lng: 27.18, lat: 39.12 },
      { name: "Tire", lng: 27.74, lat: 38.09 },
      { name: "Ödemiş", lng: 27.96, lat: 38.23 },
    ],
  },
  {
    city: "Kahramanmaraş",
    lng: 36.9264,
    lat: 37.5858,
    districts: [
      { name: "Dulkadiroğlu", lng: 36.93, lat: 37.59 },
      { name: "Onikişubat", lng: 36.92, lat: 37.58 },
      { name: "Elbistan", lng: 37.2, lat: 38.21 },
    ],
  },
  {
    city: "Karabük",
    lng: 32.6204,
    lat: 41.2061,
  },
  {
    city: "Karaman",
    lng: 33.215,
    lat: 37.1815,
  },
  {
    city: "Kars",
    lng: 43.0976,
    lat: 40.6013,
  },
  {
    city: "Kastamonu",
    lng: 33.7763,
    lat: 41.388,
  },
  {
    city: "Kayseri",
    lng: 35.4787,
    lat: 38.7312,
    districts: [
      { name: "Kocasinan", lng: 35.46, lat: 38.74 },
      { name: "Melikgazi", lng: 35.49, lat: 38.72 },
      { name: "Talas", lng: 35.55, lat: 38.69 },
      { name: "İncesu", lng: 35.18, lat: 38.65 },
    ],
  },
  {
    city: "Kırıkkale",
    lng: 33.5153,
    lat: 39.8468,
  },
  {
    city: "Kırklareli",
    lng: 27.2255,
    lat: 41.7333,
    districts: [
      { name: "Merkez", lng: 27.23, lat: 41.73 },
      { name: "Lüleburgaz", lng: 27.36, lat: 41.4 },
    ],
  },
  {
    city: "Kırşehir",
    lng: 34.1709,
    lat: 39.1425,
  },
  {
    city: "Kilis",
    lng: 37.115,
    lat: 36.7184,
  },
  {
    city: "Kocaeli",
    lng: 29.945,
    lat: 40.8533,
    districts: [
      { name: "İzmit", lng: 29.95, lat: 40.85 },
      { name: "Gebze", lng: 29.43, lat: 40.8 },
      { name: "Darıca", lng: 29.38, lat: 40.77 },
      { name: "Çayırova", lng: 29.38, lat: 40.81 },
      { name: "Gölcük", lng: 29.83, lat: 40.71 },
      { name: "Derince", lng: 29.83, lat: 40.76 },
      { name: "Körfez", lng: 29.78, lat: 40.77 },
      { name: "Kandıra", lng: 30.16, lat: 41.06 },
    ],
  },
  {
    city: "Konya",
    lng: 32.4833,
    lat: 37.8667,
    districts: [
      { name: "Selçuklu", lng: 32.49, lat: 37.92 },
      { name: "Meram", lng: 32.46, lat: 37.83 },
      { name: "Karatay", lng: 32.51, lat: 37.87 },
      { name: "Ereğli", lng: 34.05, lat: 37.51 },
      { name: "Akşehir", lng: 31.42, lat: 38.36 },
    ],
  },
  {
    city: "Kütahya",
    lng: 29.9833,
    lat: 39.4167,
  },
  {
    city: "Malatya",
    lng: 38.3552,
    lat: 38.3552,
    districts: [
      { name: "Battalgazi", lng: 38.34, lat: 38.4 },
      { name: "Yeşilyurt", lng: 38.31, lat: 38.3 },
    ],
  },
  {
    city: "Manisa",
    lng: 27.4267,
    lat: 38.6191,
    districts: [
      { name: "Şehzadeler", lng: 27.43, lat: 38.62 },
      { name: "Yunusemre", lng: 27.4, lat: 38.61 },
      { name: "Akhisar", lng: 27.85, lat: 38.92 },
      { name: "Salihli", lng: 28.14, lat: 38.48 },
      { name: "Turgutlu", lng: 27.7, lat: 38.5 },
    ],
  },
  {
    city: "Mardin",
    lng: 40.7245,
    lat: 37.3122,
  },
  {
    city: "Mersin",
    lng: 34.6415,
    lat: 36.8121,
    districts: [
      { name: "Akdeniz", lng: 34.63, lat: 36.79 },
      { name: "Toroslar", lng: 34.65, lat: 36.84 },
      { name: "Yenişehir", lng: 34.6, lat: 36.79 },
      { name: "Mezitli", lng: 34.53, lat: 36.74 },
      { name: "Tarsus", lng: 34.89, lat: 36.92 },
      { name: "Erdemli", lng: 34.31, lat: 36.6 },
      { name: "Silifke", lng: 33.93, lat: 36.38 },
    ],
  },
  {
    city: "Muğla",
    lng: 28.3667,
    lat: 37.2153,
    districts: [
      { name: "Menteşe", lng: 28.36, lat: 37.22 },
      { name: "Bodrum", lng: 27.43, lat: 37.03 },
      { name: "Fethiye", lng: 29.13, lat: 36.62 },
      { name: "Marmaris", lng: 28.27, lat: 36.85 },
      { name: "Milas", lng: 27.78, lat: 37.31 },
      { name: "Datça", lng: 27.69, lat: 36.73 },
      { name: "Ortaca", lng: 28.77, lat: 36.83 },
      { name: "Dalaman", lng: 28.79, lat: 36.77 },
    ],
  },
  {
    city: "Muş",
    lng: 41.4949,
    lat: 38.7432,
  },
  {
    city: "Nevşehir",
    lng: 34.7167,
    lat: 38.6244,
    districts: [
      { name: "Merkez", lng: 34.72, lat: 38.62 },
      { name: "Ürgüp", lng: 34.91, lat: 38.63 },
      { name: "Avanos", lng: 34.85, lat: 38.71 },
    ],
  },
  {
    city: "Niğde",
    lng: 34.6857,
    lat: 37.9667,
  },
  {
    city: "Ordu",
    lng: 37.8764,
    lat: 40.9836,
    districts: [
      { name: "Altınordu", lng: 37.87, lat: 40.99 },
      { name: "Ünye", lng: 37.28, lat: 41.13 },
      { name: "Fatsa", lng: 37.49, lat: 41.04 },
    ],
  },
  {
    city: "Osmaniye",
    lng: 36.2469,
    lat: 37.213,
  },
  {
    city: "Rize",
    lng: 40.5234,
    lat: 41.0201,
  },
  {
    city: "Sakarya",
    lng: 30.4046,
    lat: 40.7833,
    districts: [
      { name: "Adapazarı", lng: 30.4, lat: 40.78 },
      { name: "Serdivan", lng: 30.37, lat: 40.77 },
      { name: "Akyazı", lng: 30.62, lat: 40.69 },
    ],
  },
  {
    city: "Samsun",
    lng: 36.33,
    lat: 41.2867,
    districts: [
      { name: "İlkadım", lng: 36.33, lat: 41.29 },
      { name: "Atakum", lng: 36.27, lat: 41.31 },
      { name: "Canik", lng: 36.36, lat: 41.27 },
      { name: "Bafra", lng: 35.91, lat: 41.57 },
    ],
  },
  {
    city: "Siirt",
    lng: 41.9333,
    lat: 37.9333,
  },
  {
    city: "Sinop",
    lng: 35.1554,
    lat: 42.0231,
  },
  {
    city: "Sivas",
    lng: 37.0166,
    lat: 39.7477,
  },
  {
    city: "Şanlıurfa",
    lng: 38.7956,
    lat: 37.1591,
    districts: [
      { name: "Haliliye", lng: 38.79, lat: 37.18 },
      { name: "Eyyübiye", lng: 38.78, lat: 37.14 },
      { name: "Karaköprü", lng: 38.78, lat: 37.21 },
      { name: "Viranşehir", lng: 39.76, lat: 37.23 },
    ],
  },
  {
    city: "Şırnak",
    lng: 42.4595,
    lat: 37.5164,
  },
  {
    city: "Tekirdağ",
    lng: 27.5167,
    lat: 40.9833,
    districts: [
      { name: "Süleymanpaşa", lng: 27.52, lat: 40.98 },
      { name: "Çorlu", lng: 27.81, lat: 41.16 },
      { name: "Çerkezköy", lng: 28.0, lat: 41.29 },
      { name: "Kapaklı", lng: 27.99, lat: 41.32 },
      { name: "Ergene", lng: 27.95, lat: 41.21 },
      { name: "Marmaraereğlisi", lng: 27.96, lat: 40.97 },
    ],
  },
  {
    city: "Tokat",
    lng: 36.5544,
    lat: 40.314,
  },
  {
    city: "Trabzon",
    lng: 39.7178,
    lat: 41.0015,
    districts: [
      { name: "Ortahisar", lng: 39.72, lat: 41.0 },
      { name: "Akçaabat", lng: 39.57, lat: 41.02 },
    ],
  },
  {
    city: "Tunceli",
    lng: 39.5439,
    lat: 39.1079,
  },
  {
    city: "Uşak",
    lng: 29.4058,
    lat: 38.6823,
  },
  {
    city: "Van",
    lng: 43.4083,
    lat: 38.4942,
    districts: [
      { name: "İpekyolu", lng: 43.39, lat: 38.49 },
      { name: "Tuşba", lng: 43.4, lat: 38.51 },
      { name: "Edremit", lng: 43.32, lat: 38.41 },
      { name: "Erciş", lng: 43.36, lat: 38.97 },
    ],
  },
  {
    city: "Yalova",
    lng: 29.2769,
    lat: 40.6549,
    districts: [
      { name: "Merkez", lng: 29.28, lat: 40.65 },
      { name: "Çınarcık", lng: 29.13, lat: 40.65 },
      { name: "Çiftlikköy", lng: 29.32, lat: 40.66 },
    ],
  },
  {
    city: "Yozgat",
    lng: 34.8086,
    lat: 39.8181,
  },
  {
    city: "Zonguldak",
    lng: 31.7984,
    lat: 41.4564,
    districts: [
      { name: "Merkez", lng: 31.8, lat: 41.46 },
      { name: "Ereğli", lng: 31.42, lat: 41.28 },
    ],
  },
];

function build(): TrPlace[] {
  const out: TrPlace[] = [];
  for (const r of RAW) {
    out.push({
      id: `il-${r.city}`,
      name: r.city,
      city: r.city,
      district: null,
      lng: r.lng,
      lat: r.lat,
      keywords: k(r.city),
    });
    for (const d of r.districts ?? []) {
      out.push({
        id: `ilce-${r.city}-${d.name}`,
        name: `${d.name}, ${r.city}`,
        city: r.city,
        district: d.name,
        lng: d.lng,
        lat: d.lat,
        keywords: k(d.name, r.city),
      });
    }
  }
  return out;
}

export const TR_PLACES: TrPlace[] = build();

export function searchTrPlaces(query: string, limit = 7): TrPlace[] {
  const q = k(query).trim();
  if (!q) return [];
  const matches: Array<{ p: TrPlace; score: number }> = [];
  for (const p of TR_PLACES) {
    const idx = p.keywords.indexOf(q);
    if (idx < 0) continue;
    // başlangıç eşleşmesine bonus + ilçeleri üste taşıma
    let score = 1000 - idx * 2;
    if (idx === 0) score += 500;
    if (p.district) score += 50;
    matches.push({ p, score });
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit).map((m) => m.p);
}
