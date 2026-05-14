export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  icon: string;
  color: string;
  author: string;
  readTime: string;
}

export const EDUCATIONAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Bahaya Mikroplastik',
    excerpt: 'Partikel plastik kecil yang mencemari lautan dan rantai makanan kita.',
    content: `Mikroplastik adalah partikel plastik yang berukuran kurang dari 5 milimeter. Meskipun kecil, dampaknya terhadap lingkungan sangatlah besar. \n\n**Asal Mikroplastik:**\nAda dua jenis mikroplastik: primer (seperti microbeads dalam kosmetik) dan sekunder (pecahan dari botol plastik atau pakaian sintetis).\n\n**Dampak Buruk:**\n1. Mencemari Lautan: Dikonsumsi oleh plankton dan ikan.\n2. Rantai Makanan: Masuk ke tubuh manusia melalui makanan laut.\n3. Kesehatan: Dapat menyebabkan peradangan dan paparan bahan kimia berbahaya.\n\nMari kita kurangi penggunaan plastik sekali pakai mulai hari ini!`,
    icon: 'Droplets',
    color: 'blue',
    author: 'Dr. Hijau',
    readTime: '3 min'
  },
  {
    id: '2',
    title: 'Kompos Mandiri',
    excerpt: 'Cara mengubah sampah dapur menjadi emas hitam untuk tanaman Anda.',
    content: `Membuat kompos sendiri di rumah adalah cara terbaik untuk mengurangi beban TPA dan menutrisi tanah lapis bawah.\n\n**Bahan Hijau (Kaya Nitrogen):**\nSisa sayuran, buah-buahan, dan ampas kopi.\n\n**Bahan Cokelat (Kaya Karbon):**\nDaun kering, kardus, dan ranting kecil.\n\n**Cara Membuat:**\n1. Sediakan wadah berventilasi.\n2. Campur bahan hijau dan cokelat (rasio 1:2).\n3. Jaga kelembapan (seperti spons basah).\n4. Aduk secara berkala untuk sirkulasi udara.\n\nHasilnya adalah pupuk organik berkualitas tinggi yang disebut 'Emas Hitam'.`,
    icon: 'Leaf',
    color: 'green',
    author: 'Tukang Kebun',
    readTime: '5 min'
  },
  {
    id: '3',
    title: 'Ekosistem Karbon',
    excerpt: 'Hubungan antara pengelolaan sampah dan pemanasan global.',
    content: `Sampah yang menumpuk di TPA tanpa oksigen menghasilkan gas metana, yang 25 kali lebih kuat dari CO2 dalam memerangkap panas di atmosfer.\n\n**Data Penting:**\nPemanasan global saat ini sangat dipengaruhi oleh emisi dari limbah makanan. Jika limbah makanan adalah sebuah negara, maka ia akan menjadi penghasil emisi terbesar ketiga di dunia.\n\n**Solusi Kita:**\n- Memisahkan sampah dari rumah.\n- Mengurangi limbah makanan.\n- Menggunakan kembali barang-barang layak pakai.\n\nSetiap kilogram sampah yang didaur ulang membantu menurunkan suhu Bumi.`,
    icon: 'TrendingDown',
    color: 'amber',
    author: 'Eco Researcher',
    readTime: '4 min'
  },
  {
    id: '4',
    title: 'Ekonomi Sirkular',
    excerpt: 'Bagaimana model bisnis masa depan berputar pada penggunaan kembali sumber daya.',
    content: `Ekonomi sirkular adalah model ekonomi yang bertujuan meminimalkan limbah dengan mendesain produk yang bisa dipakai kembali, diperbaiki, dan didaur ulang.\n\n**Prinsip Utama:**\n1. Desain dari awal untuk masa pakai lama.\n2. Pertahankan produk dalam penggunaan selama mungkin.\n3. Regenerasi sistem alam.\n\nContoh penerapan: sistem isi ulang botol sabun, penyewaan alat rumah tangga, dan industri fashion yang menggunakan kain dari serat daur ulang.\n\nEkonomi sirkular bukan hanya tentang pengelolaan sampah, tapi tentang mengubah cara kita mengonsumsi barang.`,
    icon: 'Recycle',
    color: 'emerald',
    author: 'Future Thinker',
    readTime: '6 min'
  },
  {
    id: '5',
    title: 'Upcycling Kreatif',
    excerpt: 'Ubah barang bekas menjadi dekorasi rumah yang estetik dan fungsional.',
    content: `Upcycling adalah tingkat lanjutan dari daur ulang, di mana kita meningkatkan nilai suatu barang bekas menjadi sesuatu yang lebih bernilai.\n\n**Ide Upcycling Populer:**\n1. **Botol Plastik**: Pot tanaman gantung atau wadah alat tulis.\n2. **Kain Perca**: Tote bag atau sarung bantal unik.\n3. **Kardus Bekas**: Organizer meja atau mainan edukasi anak.\n\n**Kenapa Upcycling?**\nSelain mengurangi sampah, upcycling mengasah kreativitas dan menghemat pengeluaran untuk perabotan rumah tangga.\n\nMulailah melihat barang bekas sebagai bahan baku seni, bukan limbah!`,
    icon: 'Sprout',
    color: 'indigo',
    author: 'Art & Eco',
    readTime: '5 min'
  },
  {
    id: '6',
    title: 'Zero-Waste 101',
    excerpt: 'Langkah mudah memulai gaya hidup tanpa sampah untuk pemula.',
    content: `Memulai gaya hidup zero-waste tidak harus langsung sempurna. Kuncinya adalah konsistensi dalam langkah kecil.\n\n**5R Prinsip Utama:**\n1. **Refuse**: Tolak plastik sekali pakai (sedotan, kantong).\n2. **Reduce**: Kurangi konsumsi barang yang tidak perlu.\n3. **Reuse**: Gunakan kembali barang yang masih layak.\n4. **Recycle**: Daur ulang jika tidak bisa ditolak atau dikurangi.\n5. **Rot**: Komposkan sisa organik.\n\n**Starter Kit:**\nBawa botol minum sendiri, tas belanja kain, dan wadah makan saat bepergian. Perubahan besar dimulai dari tas belanja Anda!`,
    icon: 'ShoppingBag',
    color: 'rose',
    author: 'Zero Hero',
    readTime: '4 min'
  },
  {
    id: '7',
    title: 'Waspada Limbah B3',
    excerpt: 'Mengenal sampah berbahaya di rumah dan cara menanganinya dengan aman.',
    content: `B3 adalah singkatan dari Bahan Berbahaya dan Beracun. Membuangnya sembarangan dapat mencemari air tanah secara permanen.\n\n**Contoh Limbah B3 Rumah Tangga:**\n- Baterai bekas dan power bank.\n- Lampu neon/LED.\n- Botol obat dan pestisida.\n- Elektronik rusak (e-waste).\n\n**Cara Menangani:**\n1. Jangan campur dengan sampah biasa.\n2. Simpan dalam wadah khusus yang kering.\n3. Cari titik kumpul limbah B3 atau e-waste terdekat (gunakan fitur Map di NeuroCycle).\n\nLindungi keluarga dan lingkungan dari racun tersembunyi!`,
    icon: 'AlertTriangle',
    color: 'red',
    author: 'Safety Expert',
    readTime: '6 min'
  },
  {
    id: '8',
    title: 'Daur Ulang Kertas',
    excerpt: 'Menyelamatkan pohon dengan mengelola limbah kertas secara benar.',
    content: `Setiap ton kertas yang didaur ulang dapat menyelamatkan sekitar 17 pohon dewasa. Kertas adalah bahan yang sangat mudah didaur ulang.\n\n**Proses Daur Ulang Kertas:**\n1. Pemilahan: Pisahkan kertas dari plastik atau kawat.\n2. Pencacahan: Potong kertas menjadi bagian kecil.\n3. Pembuatan Bubur: Campur dengan air untuk menjadi pulp.\n4. Pencetakan: Ratakan dan keringkan menjadi lembaran baru.\n\n**Tips Penting:**\nKertas yang terkena minyak (seperti kotak pizza) tidak bisa didaur ulang. Robek bagian yang bersih untuk didaur ulang, sisanya masukkan ke kompos!`,
    icon: 'Trees',
    color: 'emerald',
    author: 'Forest Guard',
    readTime: '3 min'
  }
];
