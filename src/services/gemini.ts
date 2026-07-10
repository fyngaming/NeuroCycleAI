import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || '';

const genAI = new GoogleGenerativeAI(apiKey);
export { genAI };

export interface WasteAnalysis {
  name: string;
  category: "Organik" | "Anorganik" | "B3" | "Kertas" | "Plastik" | "Logam";
  composition: {
    material: string;
    percentage: number;
    description?: string;
  }[];
  disposalGuide: string;
  recyclable: boolean;
  accuracy: number;
  tips: string;
  environmentalImpact: string;
  creativeIdeas: string[];
  impactStats: {
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
  };
}

const IMAGE_ANALYSIS_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-2.5-pro",
];

let localVisionModelPromise: Promise<any> | null = null;
let cocoModelPromise: Promise<any> | null = null;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const ID_LABEL_MAP: Record<string, string> = {
  'botol plastik': 'Botol Plastik',
  'botol kaca': 'Botol Kaca',
  'galon plastik': 'Galon Plastik',
  'kantong plastik': 'Kantong Plastik',
  'kantong kertas': 'Kantong Kertas',
  'kardus': 'Kardus',
  'kotak karton': 'Kotak Karton',
  'buku': 'Buku',
  'buku tulis': 'Buku Tulis',
  'amplop': 'Amplop',
  'koran': 'Koran',
  'majalah': 'Majalah',
  'tisu': 'Tisu',
  'tisu toilet': 'Tisu Toilet',
  'handuk kertas': 'Handuk Kertas',
  'serbet': 'Serbet',
  'kaleng aluminium': 'Kaleng Aluminium',
  'kaleng': 'Kaleng',
  'kaleng soda': 'Kaleng Soda',
  'kaleng bir': 'Kaleng Bir',
  'kaleng minuman': 'Kaleng Minuman',
  'tutup botol': 'Tutup Botol',
  'gelas kaca': 'Gelas Kaca',
  'mangkuk/cangkir': 'Mangkuk/Cangkir',
  'mug': 'Mug',
  'teko': 'Teko',
  'teko listrik': 'Teko Listrik',
  'garpu': 'Garpu',
  'sendok': 'Sendok',
  'pisau': 'Pisau',
  'peralatan makan': 'Peralatan Makan',
  'piring': 'Piring',
  'wajan': 'Wajan',
  'panci': 'Panci',
  'panggangan': 'Panggangan',
  'mixer': 'Mixer',
  'blender': 'Blender',
  'microwave': 'Microwave',
  'kulkas': 'Kulkas',
  'mesin cuci': 'Mesin Cuci',
  'tv': 'TV',
  'monitor': 'Monitor',
  'keyboard': 'Keyboard',
  'mouse': 'Mouse',
  'remote': 'Remote',
  'hp': 'HP',
  'iphone': 'iPhone',
  'charger': 'Charger',
  'kabel': 'Kabel',
  'baterai': 'Baterai',
  'bohlam': 'Bohlam',
  'lampu': 'Lampu',
  'lilin': 'Lilin',
  'pena': 'Pena',
  'pensil': 'Pensil',
  'spidol': 'Spidol',
  'penghapus': 'Penghapus',
  'stapler': 'Stapler',
  'gunting': 'Gunting',
  'pita lakban': 'Pita Lakban',
  'lem': 'Lem',
  'cat': 'Cat',
  'semprotan cat': 'Semprotan Cat',
  'aerosol': 'Aerosol',
  'obat': 'Obat',
  'obat kaplet': 'Obat Kaplet',
  'perban': 'Perban',
  'suntikan': 'Suntikan',
  'termometer': 'Termometer',
  'cermin': 'Cermin',
  'bingkai foto': 'Bingkai Foto',
  'foto': 'Foto',
  'vas': 'Vas',
  'pot bunga': 'Pot Bunga',
  'jam': 'Jam',
  'jam tangan': 'Jam Tangan',
  'kacamata': 'Kacamata',
  'payung': 'Payung',
  'sepatu': 'Sepatu',
  'sepatu boot': 'Sepatu Boot',
  'sandal': 'Sandal',
  'sandal kaos': 'Sandal Kaos',
  'tas ransel': 'Tas Ransel',
  'tas': 'Tas',
  'dompet': 'Dompet',
  'ikat pinggang': 'Ikat Pinggang',
  'topi': 'Topi',
  'kaus kaki': 'Kaus Kaki',
  'dasi': 'Dasi',
  'kemeja': 'Kemeja',
  'celana': 'Celana',
  'jeans': 'Jeans',
  'gaun': 'Gaun',
  'rok': 'Rok',
  'jaket': 'Jaket',
  'mantel': 'Mantel',
  'sweater': 'Sweater',
  'hoodie': 'Hoodie',
  'handuk': 'Handuk',
  'selimut': 'Selimut',
  'bantal': 'Bantal',
  'bantal sofa': 'Bantal Sofa',
  'tirai': 'Tirai',
  'karpet': 'Karpet',
  'keranjang': 'Keranjang',
  'ember': 'Ember',
  'ember pel': 'Ember Pel',
  'tempat sampah': 'Tempat Sampah',
  'mainan': 'Mainan',
  'boneka': 'Boneka',
  'bola': 'Bola',
  'balon': 'Balon',
  'layang layang': 'Layang-layang',
  'buku komik': 'Buku Komik',
  'kamus': 'Kamus',
  'kalender': 'Kalender',
  'peta': 'Peta',
  'globe': 'Globe',
  'layar': 'Layar',
  'printer': 'Printer',
  'scanner': 'Scanner',
  'speaker': 'Speaker',
  'headphone': 'Headphone',
  'mikrofon': 'Mikrofon',
  'kamera': 'Kamera',
  'teropong': 'Teropong',
  'teleskop': 'Teleskop',
  'mikroskop': 'Mikroskop',
  'cincin': 'Cincin',
  'kalung': 'Kalung',
  'gelang': 'Gelang',
  'anting': 'Anting',
  'lencana': 'Lencana',
  'medali': 'Medali',
  'piala': 'Piala',
  'mahkota': 'Mahkota',
  'topeng': 'Topeng',
  'helm': 'Helm',
  'syal': 'Syal',
  'sarung tangan': 'Sarung Tangan',
  'kipas angin': 'Kipas Angin',
  'ac': 'AC',
  'pemanas': 'Pemanas',
  'vacuum': 'Vacuum',
  'sapu': 'Sapu',
  'pel': 'Pel',
  'spons': 'Spons',
  'sikat': 'Sikat',
  'sisir': 'Sisir',
  'sikat gigi': 'Sikat Gigi',
  'sikat rambut': 'Sikat Rambut',
  'timbangan': 'Timbangan',
  'penggaris': 'Penggaris',
  'meteran': 'Meteran',
  'lidah': 'Lidah',
  'ingkung': 'Ingkung',
  'obeng': 'Obeng',
  'palu': 'Palu',
  'kapak': 'Kapak',
  'gergaji': 'Gergaji',
  'bor': 'Bor',
  'tang': 'Tang',
  'senter': 'Senter',
  'lentera': 'Lentera',
  'korek api': 'Korek Api',
  'bara api': 'Bara Api',
  'asbak': 'Asbak',
  'tembakau': 'Tembakau',
  'rokok': 'Rokok',
  'vape': 'Vape',
  'pipa': 'Pipa',
  'shisha': 'Shisha',
  'pisang': 'Pisang',
  'apel': 'Apel',
  'jeruk': 'Jeruk',
  'jeruk lemon': 'Jeruk Lemon',
  'jeruk nipis': 'Jeruk Nipis',
  'stroberi': 'Stroberi',
  'nanas': 'Nanas',
  'semangka': 'Semangka',
  'kelapa': 'Kelapa',
  'jagung': 'Jagung',
  'wortel': 'Wortel',
  'kentang': 'Kentang',
  'jamur': 'Jamur',
  'telur': 'Telur',
  'roti': 'Roti',
  'keju': 'Keju',
  'pizza': 'Pizza',
  'burger': 'Burger',
  'hotdog': 'Hotdog',
  'es krim': 'Es Krim',
  'kue': 'Kue',
  'kopi': 'Kopi',
  'espresso': 'Espresso',
  'teh': 'Teh',
  'jus': 'Jus',
  'air': 'Air',
  'anggur': 'Anggur',
  'bir': 'Bir',
  'soda': 'Soda',
  'susu': 'Susu',
  'yoghurt': 'Yoghurt',
  'maduu': 'Madu',
  'gula': 'Gula',
  'garam': 'Garam',
  'lada': 'Lada',
  'minyak': 'Minyak',
  'saus': 'Saus',
  'saus tomat': 'Saus Tomat',
  'mustard': 'Mustard',
  'dressing': 'Dressing',
  'sup': 'Sup',
  'salad': 'Salad',
  'sushi': 'Sushi',
  'ramen': 'Ramen',
  'mie': 'Mie',
  'pasta': 'Pasta',
  'nasi': 'Nasi',
  'steak': 'Steak',
  'ayam': 'Ayam',
  'ikan': 'Ikan',
  'udang': 'Udang',
  'kepiting': 'Kepiting',
  'lobster': 'Lobster',
  'penyu': 'Penyu',
  'ular': 'Ular',
  'kadal': 'Kadal',
  'katak': 'Katak',
  'buaya': 'Buaya',
  'dinosaurus': 'Dinosaurus',
  'burung': 'Burung',
  'kakatua': 'Kakatua',
  'elang': 'Elang',
  'burung hantu': 'Burung Hantu',
  'penguin': 'Penguin',
  'flamin-go': 'Flamin-go',
  'angsa': 'Angsa',
  'bebek': 'Bebek',
  'kalkun': 'Kalkun',
  'ayam jantan': 'Ayam Jantan',
  'ayam betina': 'Ayam Betina',
  'sarang': 'Sarang',
  'laba-laba': 'Laba-laba',
  'serangga': 'Serangga',
  'semut': 'Semut',
  'lebah': 'Lebah',
  'kupu-kupu': 'Kupu-kupu',
  'ngengat': 'Ngengat',
  'capung': 'Capung',
  'kumbang': 'Kumbang',
  'kumbang cinderella': 'Kumbang Cinderella',
  'jangkrik': 'Jangkrik',
  'belalang': 'Belalang',
  'kecoa': 'Kecoa',
  'lalat': 'Lalat',
  'nyamuk': 'Nyamuk',
  'kutu': 'Kutu',
  'cacing': 'Cacing',
  'siput': 'Siput',
  'bintang laut': 'Bintang Laut',
   'karang': 'Karang',
  'ubur-ubur': 'Ubur-ubur',
  'gurita': 'Gurita',
  'cumi': 'Cumi',
  'kerang': 'Kerang',
  'tiram': 'Tiram',
  'cacing tanah': 'Cacing Tanah',
  'lintah': 'Lintah',
  'anemon laut': 'Anemon Laut',
  'bulu babi': 'Bulu Babi',
  'teripang': 'Teripang',
};

function formatLabel(label: string): string {
  const cleaned = label
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  if (!cleaned) return "Sampah Visual";

  const direct = ID_LABEL_MAP[cleaned];
  if (direct) return direct;

  const words = cleaned.split(' ');

  for (const word of words) {
    const translated = ID_LABEL_MAP[word];
    if (translated) return translated;
  }

  const titleCase = words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return titleCase || "Sampah Visual";
}

function normalizeWasteAnalysis(analysis: WasteAnalysis, confidence: number): WasteAnalysis {
  const validCategories = ["Organik", "Anorganik", "B3", "Kertas", "Plastik", "Logam"] as const;
  const category = validCategories.includes(analysis.category) ? analysis.category : "Anorganik";

  return {
    ...analysis,
    category,
    accuracy: clamp(confidence || analysis.accuracy || 0.5, 0.4, 0.96),
    composition: analysis.composition.length > 0
      ? analysis.composition.map(item => ({
          ...item,
          percentage: clamp(Number(item.percentage) || 0, 1, 100),
        }))
      : [{ material: "Material visual", percentage: 100 }],
    creativeIdeas: analysis.creativeIdeas.length > 0
      ? analysis.creativeIdeas.slice(0, 3)
      : ["Kumpulkan sesuai jenis material.", "Bersihkan sebelum digunakan ulang.", "Setor ke titik daur ulang terdekat."],
    impactStats: {
      co2Saved: Math.max(0, Number(analysis.impactStats.co2Saved) || 0),
      waterSaved: Math.max(0, Number(analysis.impactStats.waterSaved) || 0),
      energySaved: Math.max(0, Number(analysis.impactStats.energySaved) || 0),
    },
  };
}

const TEMPLATES: Record<string, WasteAnalysis> = {
  b3: {
    name: "Limbah B3",
    category: "B3",
    composition: [
      { material: "Limbah B3/rumah tangga berbahaya", percentage: 100, description: "Objek terdeteksi sebagai benda yang berpotensi berbahaya, seperti baterai, elektronik kecil, obat, atau kemasan kimia." },
    ],
    disposalGuide: "Jangan campurkan dengan sampah daur ulang. Simpan di wadah aman, tutup rapat, dan serahkan ke dropbox limbah B3 atau titik pengumpulan resmi.",
    recyclable: false,
    accuracy: 0.55,
    tips: "Hindari membuka, menusuk, membakar, atau membuang limbah B3 ke saluran air dan tempat sampah umum.",
    environmentalImpact: "Penyerahan limbah B3 ke titik resmi mencegah pencemaran tanah, air, dan udara.",
    creativeIdeas: [
      "Jangan gunakan ulang kemasan B3 untuk makanan atau minuman.",
      "Kumpulkan baterai bekas dalam wadah kering terpisah.",
      "Serahkan ke dropbox B3 terdekat sebelum menyetor sampah lain.",
    ],
    impactStats: { co2Saved: 5, waterSaved: 2, energySaved: 1 },
  },
  organic: {
    name: "Sampah Organik",
    category: "Organik",
    composition: [
      { material: "Bahan organik alami", percentage: 90, description: "Sisa makanan, kulit buah, daun, atau material alami yang mudah terurai." },
      { material: "Kotoran/kemasan kecil", percentage: 10, description: "Bagian non-organik yang sebaiknya dipisahkan sebelum pengolahan." },
    ],
    disposalGuide: "Pisahkan dari plastik dan logam. Gunakan untuk kompos, eco-enzyme, atau kumpulkan di titik sampah organik terdekat.",
    recyclable: true,
    accuracy: 0.55,
    tips: "Potong menjadi ukuran kecil agar proses pengomposan lebih cepat dan tidak menimbulkan bau.",
    environmentalImpact: "Mengolah sampah organik menjadi kompos mengurangi emisi metana dari TPA.",
    creativeIdeas: [
      "Kulit buah bisa diolah menjadi eco-enzyme pembersih alami.",
      "Sisa sayur dan daun kering bisa menjadi bahan kompos rumah.",
      "Ampas kopi atau teh dapat dicampur ke media tanam sebagai pupuk ringan.",
    ],
    impactStats: { co2Saved: 45, waterSaved: 18, energySaved: 4 },
  },
  paper: {
    name: "Sampah Kertas",
    category: "Kertas",
    composition: [
      { material: "Serat kertas/kardus", percentage: 88, description: "Material berbasis kertas yang dapat didaur ulang jika bersih dan kering." },
      { material: "Tinta, lem, atau lapisan tipis", percentage: 12, description: "Bagian yang dapat mengurangi kualitas daur ulang jika terlalu banyak." },
    ],
    disposalGuide: "Lipat agar rapi, jaga tetap kering, dan pisahkan dari sampah basah, minyak, atau plastik laminasi.",
    recyclable: true,
    accuracy: 0.55,
    tips: "Kertas yang bersih dan kering memiliki nilai daur ulang lebih tinggi daripada kertas basah atau berminyak.",
    environmentalImpact: "Mendaur ulang kertas membantu mengurangi penebangan pohon dan penggunaan air produksi.",
    creativeIdeas: [
      "Kardus bekas bisa dijadikan kotak organizer meja.",
      "Kertas bekas dapat dijadikan kertas daur ulang dengan tekstur unik.",
      "Gulungan kertas atau kardus bisa dibuat menjadi pot kecil untuk semai tanaman.",
    ],
    impactStats: { co2Saved: 75, waterSaved: 42, energySaved: 7 },
  },
  metal: {
    name: "Sampah Logam",
    category: "Logam",
    composition: [
      { material: "Logam/aluminium/baja", percentage: 90, description: "Material logam yang bernilai tinggi untuk didaur ulang." },
      { material: "Cat, label, atau sisa isi", percentage: 10, description: "Bersihkan sisa isi agar lebih aman dan layak daur ulang." },
    ],
    disposalGuide: "Kosongkan dan bilas jika ada sisa makanan/minuman. Kumpulkan kaleng atau logam kecil dalam wadah terpisah.",
    recyclable: true,
    accuracy: 0.55,
    tips: "Tekan kaleng ringan untuk menghemat ruang, tetapi hati-hati jika bagian logam tajam.",
    environmentalImpact: "Daur ulang aluminium dan baja dapat menghemat energi produksi material baru.",
    creativeIdeas: [
      "Kaleng bekas dapat dijadikan pot mini setelah tepinya dilindungi.",
      "Tutup botol logam bisa dikumpulkan untuk proyek mosaik sederhana.",
      "Sendok atau garpu rusak dapat dijadikan gantungan dekoratif jika aman digunakan.",
    ],
    impactStats: { co2Saved: 170, waterSaved: 55, energySaved: 24 },
  },
  glass: {
    name: "Sampah Kaca",
    category: "Anorganik",
    composition: [
      { material: "Kaca", percentage: 92, description: "Wadah kaca, botol kaca, atau pecahan kaca yang tidak mudah terurai." },
      { material: "Tutup, label, atau sisa cairan", percentage: 8, description: "Pisahkan tutup logam/plastik dan bersihkan sebelum didaur ulang." },
    ],
    disposalGuide: "Bungkus pecahan kaca dengan kertas tebal sebelum dibuang. Untuk botol utuh, bilas dan pisahkan tutupnya.",
    recyclable: true,
    accuracy: 0.55,
    tips: "Jangan mencampur pecahan kaca dengan plastik atau kertas karena berisiko melukai petugas pemilah.",
    environmentalImpact: "Daur ulang kaca mengurangi kebutuhan bahan baku pasir, soda ash, dan energi peleburan.",
    creativeIdeas: [
      "Botol kaca bisa dijadikan vas mini atau tempat lilin dengan pinggiran aman.",
      "Toples kaca bekas cocok untuk wadah bumbu atau penyimpanan kering.",
      "Pecahan kaca yang sudah dibungkus aman dapat diserahkan ke titik daur ulang kaca.",
    ],
    impactStats: { co2Saved: 95, waterSaved: 24, energySaved: 8 },
  },
  mixed: {
    name: "Sampah Campuran",
    category: "Anorganik",
    composition: [
      { material: "Material campuran", percentage: 70, description: "Objek tampak mengandung lebih dari satu jenis material." },
      { material: "Plastik/kertas/logam/kaca", percentage: 30, description: "Pilah bagian terbesar sesuai material sebelum disetor." },
    ],
    disposalGuide: "Pisahkan komponen yang terlihat: plastik, kertas, logam, atau kaca. Kumpulkan bagian terbersih untuk daur ulang.",
    recyclable: true,
    accuracy: 0.55,
    tips: "Foto objek dari sisi paling jelas dan pisahkan kemasan berlapis agar hasil analisis lebih akurat.",
    environmentalImpact: "Memilah material campuran meningkatkan peluang tiap bagian untuk didaur ulang.",
    creativeIdeas: [
      "Gunakan bagian terbersih untuk proyek daur ulang sederhana.",
      "Pisahkan komponen kecil agar lebih mudah disetor ke bank sampah.",
      "Simpan material yang masih layak pakai sebelum memutuskan mendaur ulang.",
    ],
    impactStats: { co2Saved: 55, waterSaved: 20, energySaved: 5 },
  },
  plastic: {
    name: "Sampah Plastik",
    category: "Plastik",
    composition: [
      { material: "Plastik", percentage: 85, description: "Wadah, kemasan, botol, atau benda plastik yang dapat dikumpulkan untuk daur ulang." },
      { material: "Sisa isi/kotoran", percentage: 15, description: "Bersihkan sebelum disetor agar lebih aman dan layak daur ulang." },
    ],
    disposalGuide: "Kosongkan dan bilas jika ada sisa isi. Pipihkan jika memungkinkan dan kumpulkan bersama sampah plastik sejenis.",
    recyclable: true,
    accuracy: 0.55,
    tips: "Plastik bersih dan kering lebih mudah diterima di bank sampah daripada plastik yang masih berisi sisa makanan atau cairan.",
    environmentalImpact: "Mendaur ulang plastik mengurangi penggunaan bahan baku minyak bumi dan beban sampah di TPA.",
    creativeIdeas: [
      "Botol plastik bisa dijadikan pot vertikal untuk tanaman kecil.",
      "Kemasan plastik tebal dapat dijadikan ecobrick jika diisi padat dan kering.",
      "Wadah plastik bersih dapat dipakai ulang untuk menyimpan barang non-makanan.",
    ],
    impactStats: { co2Saved: 120, waterSaved: 32, energySaved: 12 },
  },
};

const COCO_CLASS_TO_WASTE: Record<string, { templateKey: keyof typeof TEMPLATES; label: string }> = {
  'bottle': { templateKey: 'plastic', label: 'Botol Plastik' },
  'wine glass': { templateKey: 'glass', label: 'Gelas Kaca' },
  'cup': { templateKey: 'glass', label: 'Mangkuk/Cangkir' },
  'bowl': { templateKey: 'glass', label: 'Mangkuk' },
  'banana': { templateKey: 'organic', label: 'Pisang' },
  'apple': { templateKey: 'organic', label: 'Apel' },
  'sandwich': { templateKey: 'organic', label: 'Roti/Sandwich' },
  'orange': { templateKey: 'organic', label: 'Jeruk' },
  'broccoli': { templateKey: 'organic', label: 'Brokoli' },
  'carrot': { templateKey: 'organic', label: 'Wortel' },
  'hot dog': { templateKey: 'organic', label: 'Hotdog' },
  'pizza': { templateKey: 'organic', label: 'Pizza' },
  'donut': { templateKey: 'organic', label: 'Donat' },
  'cake': { templateKey: 'organic', label: 'Kue' },
  'book': { templateKey: 'paper', label: 'Buku' },
  'scissors': { templateKey: 'metal', label: 'Gunting' },
  'fork': { templateKey: 'metal', label: 'Garpu' },
  'knife': { templateKey: 'metal', label: 'Pisau' },
  'spoon': { templateKey: 'metal', label: 'Sendok' },
  'keyboard': { templateKey: 'b3', label: 'Keyboard Elektronik' },
  'mouse': { templateKey: 'b3', label: 'Mouse Elektronik' },
  'remote': { templateKey: 'b3', label: 'Remote Elektronik' },
  'cell phone': { templateKey: 'b3', label: 'HP Elektronik' },
  'microwave': { templateKey: 'b3', label: 'Microwave Elektronik' },
  'oven': { templateKey: 'b3', label: 'Oven Elektronik' },
  'toaster': { templateKey: 'b3', label: 'Toaster Elektronik' },
  'refrigerator': { templateKey: 'b3', label: 'Kulkas Elektronik' },
  'tv': { templateKey: 'b3', label: 'TV Elektronik' },
  'laptop': { templateKey: 'b3', label: 'Laptop Elektronik' },
  'hair drier': { templateKey: 'b3', label: 'Pengering Rambut Elektronik' },
  'toothbrush': { templateKey: 'plastic', label: 'Sikat Gigi' },
  'backpack': { templateKey: 'plastic', label: 'Tas Ransel' },
  'umbrella': { templateKey: 'plastic', label: 'Payung' },
  'handbag': { templateKey: 'plastic', label: 'Tas' },
  'suitcase': { templateKey: 'plastic', label: 'Koper' },
  'frisbee': { templateKey: 'plastic', label: 'Frisbee' },
  'skis': { templateKey: 'plastic', label: 'Ski' },
  'snowboard': { templateKey: 'plastic', label: 'Snowboard' },
  'sports ball': { templateKey: 'plastic', label: 'Bola' },
  'kite': { templateKey: 'paper', label: 'Layang-layang' },
  'baseball bat': { templateKey: 'metal', label: 'Tongkat Baseball' },
  'skateboard': { templateKey: 'plastic', label: 'Skateboard' },
  'surfboard': { templateKey: 'plastic', label: 'Papan Selancar' },
  'tennis racket': { templateKey: 'mixed', label: 'Raket Tennis' },
  'chair': { templateKey: 'mixed', label: 'Kursi' },
  'couch': { templateKey: 'mixed', label: 'Sofa' },
  'potted plant': { templateKey: 'organic', label: 'Tanaman Pot' },
  'bed': { templateKey: 'mixed', label: 'Tempat Tidur' },
  'dining table': { templateKey: 'mixed', label: 'Meja Makan' },
  'clock': { templateKey: 'mixed', label: 'Jam' },
  'vase': { templateKey: 'glass', label: 'Vas' },
  'teddy bear': { templateKey: 'mixed', label: 'Boneka' },
};

function classifyWasteType(label: string): keyof typeof TEMPLATES {
  const text = label.toLowerCase();

  if (/(battery|baterai|charger|cable|wire|plug|electronic|phone|mouse|keyboard|medicine|pill|chemical|spray|paint|cleaner|cosmetic|tube|light[\s-]?bulb|bulb|thermometer|toner|ink|pesticide)/.test(text)) return "b3";
  if (/(banana|apple|orange|fruit|vegetable|leaf|plant|food|cake|bread|rice|eggshell|peel|flower|grass|corn|potato|avocado|strawberry|pineapple|lettuce|cucumber|carrot|mushroom)/.test(text)) return "organic";
  if (/(paper[\s-]?towel|toilet[\s-]?tissue|notebook|envelope|cardboard|box|newspaper|book|receipt|paper[\s-]?bag|paper|carton|tissue|napkin|menu|poster)/.test(text)) return "paper";
  if (/\b(metal|can|aluminum|tin[\s-]?foil|foil|spoon|fork|knife|key|scissors|nail|screw|chain|padlock|wok|\bpot\b|frying[\s-]?pan|saucepan|staple|wire)\b/i.test(text) && !/(cable|charger|plug|electronic)/.test(text)) return "metal";
  if (/(wine[\s-]?bottle|beer[\s-]?bottle|glass[\s-]?bottle|vase|jar|wineglass|cocktail[\s-]?shaker|cup|glass)/.test(text)) return "glass";
  if (/(pop[\s-]?bottle|plastic[\s-]?bag|bottle|cup|container|package|wrapper|straw|bucket|basket|toy|chair|table|comb|ladle|tray|pitcher|jug|backpack|handbag|purse|sock|sandal|slipper|remote[\s-]?control)/.test(text)) return "plastic";

  return "mixed";
}

function getDominantColor(base64Image: string): Promise<{ r: number; g: number; b: number; brightness: number; saturation: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ r: 180, g: 180, b: 180, brightness: 0.7, saturation: 0.1 });
          return;
        }

        ctx.drawImage(image, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 125) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count += 1;
        }

        if (count === 0) {
          resolve({ r: 180, g: 180, b: 180, brightness: 0.7, saturation: 0.1 });
          return;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        const max = Math.max(r, g, b) / 255;
        const min = Math.min(r, g, b) / 255;
        const saturation = max === 0 ? 0 : (max - min) / max;

        resolve({ r, g, b, brightness: max, saturation });
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = reject;
    image.src = `data:image/jpeg;base64,${base64Image}`;
  });
}

async function analyzeWasteWithCoco(base64Image: string): Promise<{ name: string; templateKey: keyof typeof TEMPLATES } | null> {
  try {
    const model = await loadCocoSsdModel();
    const image = await loadImageElement(`data:image/jpeg;base64,${base64Image}`);
    const predictions = await model.detect(image, 5);

    if (predictions.length === 0) return null;

    const best = predictions[0];
    const cocoClass = best.class.toLowerCase();
    const waste = COCO_CLASS_TO_WASTE[cocoClass];

    if (waste) {
      return {
        name: waste.label,
        templateKey: waste.templateKey,
      };
    }

    return null;
  } catch (error) {
    console.warn('COCO-SSD detection failed:', error);
    return null;
  }
}

function heuristicWasteType(color: { r: number; g: number; b: number; brightness: number; saturation: number }): keyof typeof TEMPLATES {
  const { r, g, b, brightness, saturation } = color;

  // Bright Green = Organic (vegetables/fruits)
  if (g > r * 1.2 && g > b * 1.1 && saturation > 0.3 && brightness > 0.4) return "organic";
  
  // Dark/Near Black = Mixed (ambiguous objects)  
  if (brightness < 0.25) return "mixed";
  
  // Blue dominant = Glass
  if (b > r * 1.3 && b > g * 1.1 && saturation > 0.15) return "glass";
  
  // Yellow/Orange = Paper (newspapers, cardboard)
  if (r > 170 && g > 130 && b < 100 && saturation > 0.25) return "paper";
  
  // Gray/Silver = Metal
  if (saturation < 0.1 && brightness > 0.3 && brightness < 0.7) return "metal";
  
  // High brightness with color = Mixed
  return "mixed";
}

async function analyzeWasteLocally(base64Image: string): Promise<WasteAnalysis> {
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  try {
    const cocoResult = await analyzeWasteWithCoco(base64Image);
    if (cocoResult) {
      const template = TEMPLATES[cocoResult.templateKey] || TEMPLATES.mixed;
      return normalizeWasteAnalysis({
        ...template,
        name: cocoResult.name,
        accuracy: 0.75,
      }, 0.75);
    }

    const image = await loadImageElement(dataUrl);
    const model = await loadLocalVisionModel();
    const predictions = await model.classify(image, 5);
    const bestPrediction = predictions[0];

    if (!bestPrediction) {
      return getFallbackAnalysis(base64Image);
    }

    const label = bestPrediction.className;
    const confidence = clamp(bestPrediction.probability || 0.48, 0.45, 0.92);
    const type = classifyWasteType(label);
    const template = TEMPLATES[type] || TEMPLATES.mixed;
    const translatedName = formatLabel(label) || template.name;

    return normalizeWasteAnalysis({
      ...template,
      name: translatedName,
      accuracy: confidence,
    }, confidence);
  } catch (error) {
    console.warn("Local vision model gagal, menggunakan heuristik warna:", error);
    return getFallbackAnalysis(base64Image);
  }
}

async function getFallbackAnalysis(base64Image: string): Promise<WasteAnalysis> {
  try {
    const color = await getDominantColor(base64Image);
    const type = heuristicWasteType(color);
    const template = TEMPLATES[type] || TEMPLATES.mixed;
    return normalizeWasteAnalysis({
      ...template,
      name: template.name,
      accuracy: 0.5,
    }, 0.5);
  } catch {
    return normalizeWasteAnalysis(TEMPLATES.mixed, 0.5);
  }
}

async function loadLocalVisionModel(): Promise<any> {
  if (!localVisionModelPromise) {
    localVisionModelPromise = mobilenet.load({ version: 2, alpha: 1.0 });
  }
  return localVisionModelPromise;
}

async function loadCocoSsdModel(): Promise<any> {
  if (!cocoModelPromise) {
    cocoModelPromise = cocoSsd.load({ base: 'mobilenet_v2' });
  }
  return cocoModelPromise;
}

function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function parseWasteAnalysis(text: string): WasteAnalysis {
  const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleanedText) as WasteAnalysis;
  } catch (e) {
    console.error("Gagal parse JSON:", cleanedText);
    throw new Error("Format hasil analisis tidak sesuai. Silakan coba lagi.");
  }
}

async function analyzeWasteWithGemini(base64Image: string): Promise<WasteAnalysis> {
  const prompt = `You are a professional waste analyzer. Analyze this waste photo and identify the visible object accurately.
  IMPORTANT: Food waste MUST be classified as "Organik".
  Classify it strictly into ONE of these categories: Organik, Anorganik, B3, Kertas, Plastik, or Logam.
  Use the actual object in the photo to create HIGHLY ACCURATE composition percentages based on the visual materials. Provide a realistic disposal guide, creative upcycling ideas, tips, environmental impact, and impact stats.
  If the object is unclear, infer the most likely material from visual cues instead of saying it is undetected.
  You must return the result as a JSON object with this exact structure:
  {
    "name": "string (Specific name of the waste)",
    "category": "Organik | Anorganik | B3 | Kertas | Plastik | Logam",
    "composition": [{"material": "string", "percentage": number, "description": "string"}],
    "disposalGuide": "string",
    "recyclable": boolean,
    "accuracy": number (between 0.7 and 0.99),
    "tips": "string",
    "environmentalImpact": "string",
    "creativeIdeas": ["string", "string", "string"],
    "impactStats": {"co2Saved": number, "waterSaved": number, "energySaved": number}
  }`;

  const parts: Part[] = [
    {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    },
    { text: prompt },
  ];

  const errors: string[] = [];

  for (const modelName of IMAGE_ANALYSIS_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" } 
      });
      const result = await model.generateContent(parts);
      const text = result.response.text().trim();
      if (!text) throw new Error("No analysis result received from AI");
      return normalizeWasteAnalysis(parseWasteAnalysis(text), 0.82);
    } catch (e: any) {
      errors.push(`${modelName}: ${e?.message || e}`);
    }
  }

  throw new Error(`Gemini gagal: ${errors.join(' | ')}`);
}

export async function analyzeWaste(base64Image: string): Promise<WasteAnalysis> {
  if (!base64Image || base64Image.length < 100) {
    throw new Error('Gambar tidak valid atau terlalu kecil untuk dianalisis.');
  }

  let geminiError: Error | null = null;

  try {
    const geminiResult = await Promise.race([
      analyzeWasteWithGemini(base64Image),
      delay(20000).then(() => { throw new Error('Gemini timeout'); }),
    ]);
    return geminiResult;
  } catch (error: any) {
    geminiError = error instanceof Error ? error : new Error(String(error));
    console.warn('Gemini gagal/timeout, menggunakan analisis lokal:', geminiError.message);
  }

  const localResult = await analyzeWasteLocally(base64Image);
  return localResult;
}
