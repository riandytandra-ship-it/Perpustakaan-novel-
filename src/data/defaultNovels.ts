import { Novel } from '../types/novel';

export const DEFAULT_NOVELS: Novel[] = [
  {
    id: 'novel_1',
    title: 'Bintang Menara Kuno (Stars of the Ancient Tower)',
    author: 'Evelyn Rosewood',
    genre: 'Fantasi & Magis',
    year: 2024,
    publisher: 'Pustaka Fantasia Nusantara',
    totalPages: 480,
    totalChapters: 32,
    currentPage: 215,
    currentChapter: 14,
    status: 'currently_reading',
    rating: 5,
    accentColor: '#1E1B4B',
    coverImage: '/src/assets/images/cover_fantasy_arcana_1793876921141.jpg',
    tags: ['Sihir Konstelasi', 'Kastel Mistis', 'Petualangan Epik', 'Peta Bintang'],
    favoriteQuote:
      'Di antara seribu bintang yang bersinar di langit malam, hanya ada satu rasi yang memanggil namamu pulang.',
    personalReview:
      'Sistem sihir berdasarkan konstelasi bintang di novel ini sangat unik. Pembangunan dunia (worldbuilding) menara kuno di lembah berkabut terasa hidup dan magis. Karakter Evelyn sangat cerdas dan realistis.',
    synopsis:
      'Di puncak menara batu berusia ribuan tahun yang tersembunyi di balik kabut abadi, peta bintang langit kuno mulai berpendar kembali. Althea, seorang juru tulis muda yang mampu membaca bisikan rasi bintang, harus memecahkan teka-teki astronomi rahasia sebelum kegelapan menelan seluruh kerajaan.',
    updatedAt: '2026-11-04',
    chapters: [
      {
        chapterNumber: 1,
        title: 'Bab 1: Menara di Balik Kabut Perak',
        content: [
          'Kabut perak selalu turun menjelang senja di lembah Oakhaven. Dari jendela lengkung batu di lantai ketujuh perpustakaan menara, Althea menatap lurus ke arah cakrawala yang mulai menggelap.',
          'Buku-buku bersampul kulit tua di sekelilingnya berbau lavender kering dan debu berabad-abad. Ketika ia meletakkan kompas astronominya di atas meja kayu ek, jarum tembaga itu tidak menunjuk ke arah utara biasa, melainkan berputar liar menuju rasi bintang Lyra yang terlarang.',
          'Sebuah dengungan halus bergetar dari lantai batu di bawah kakinya. Pintu rahasia yang terkunci selama tiga generasi bangsawan penjaga bintang itu, perlahan bergeser terbuka.',
        ],
      },
      {
        chapterNumber: 2,
        title: 'Bab 2: Kunci Konstelasi yang Hilang',
        content: [
          'Langkah kaki Althea menggema lirih di tangga spiral yang menurun ke perut menara. Udara di bawah sini terasa jauh lebih dingin, seolah waktu membeku di antara batu-batu basalt.',
          'Di dinding marmer hitam, terpahat lukisan konstelasi langit purba. Garis-garis emas halus menyala redup saat ujung jemari Althea menyentuh relief bintang barat. "Kalian masih mengingatku," bisiknya lirih.',
        ],
      },
    ],
  },
  {
    id: 'novel_2',
    title: 'Kabut di Gang Berbatu (The Mist Over Cobblestone Alley)',
    author: 'Arthur Blake',
    genre: 'Misteri & Thriller',
    year: 2023,
    publisher: 'Harding Press Noir',
    totalPages: 360,
    totalChapters: 24,
    currentPage: 360,
    currentChapter: 24,
    status: 'completed',
    rating: 5,
    accentColor: '#14532D',
    coverImage: '/src/assets/images/cover_misteri_kabut_1793876921815.jpg',
    tags: ['Detektif Klasik', 'Noir Misteri', 'Plot Twist Luar Biasa', 'Hujan Kota Tua'],
    favoriteQuote:
      'Hujan malam itu mencuci jejak kaki di trotoar berbatu, namun tak mampu menghapus aroma rahasia yang terkubur di balik pintu nomor sembilan.',
    personalReview:
      'Salah satu novel detektif terbaik yang pernah saya baca! Akhir ceritanya benar-benar tidak terduga. Atmosfer kota tua berkabut dan lampu gas kuning memberikan rasa tegang yang konsisten sepanjang buku.',
    synopsis:
      'Detektif swasta Vincent Reid terbiasa memecahkan kasus-kasus perselingkuhan biasa di kota pelabuhan tua. Namun ketika sebuah surat tanpa nama membawanya ke gang berbatu nomor sembilan pada malam badai, ia menemukan arloji emas milik seorang hakim agung yang dikabarkan menghilang sepuluh tahun silam.',
    updatedAt: '2026-10-28',
    chapters: [
      {
        chapterNumber: 1,
        title: 'Bab 1: Dentang Jam Tengah Malam',
        content: [
          'Hujan deras yang mengguyur sejak petang telah mengubah jalanan berbatu menjadi sungai kecil yang memantulkan cahaya temaram lentera gas.',
          'Vincent Reid menyalakan pemantik api peraknya, menarik kerah mantel wolnya lebih rapat untuk menahan gigitan angin laut. Di ujung gang sempit ini, bayangan seorang pria berpayung hitam tampak terpaku di depan toko buku antik yang seharusnya sudah tutup dua jam lalu.',
          'Ketika Vincent mendekat, pria itu menghilang ke dalam selasar berliku, hanya menyisakan sebuah amplop bersegel lilin merah tua di anak tangga batu yang basah.',
        ],
      },
    ],
  },
  {
    id: 'novel_3',
    title: 'Kala Daun Menghening (The Quiet Leaf)',
    author: 'Eliza Vance',
    genre: 'Sastra Nusantara',
    year: 2024,
    publisher: 'Pustaka Daun Senja',
    totalPages: 310,
    totalChapters: 18,
    currentPage: 180,
    currentChapter: 11,
    status: 'currently_reading',
    rating: 5,
    accentColor: '#9A3412',
    coverImage: '/src/assets/images/cover_sastra_nusantara_1793875942433.jpg',
    tags: ['Keluarga & Akar', 'Puitis Mendalam', 'Pulau Tropis', 'Kenangan Hangat'],
    favoriteQuote:
      'Rindu itu seperti desau angin di antara pohon-pohon jati tua; ia tak terlihat, namun dedaunan selalu tahu kapan harus berguguran.',
    personalReview:
      'Bahasa yang digunakan sangat lembut dan kaya metafora. Sangat cocok dibaca santai di sore hari sambil menikmati teh melati hangat. Hubungan antara nenek dan cucu di novel ini sangat mengharukan.',
    synopsis:
      'Setelah lima belas tahun merantau di kota megapolitan yang bising, Saras memutuskan kembali ke rumah panggung kakeknya di lereng bukit perkebunan cengkeh. Di sana, di antara aroma tanah basah dan resep jamu kuno mendiang neneknya, ia menemukan kembali alasan untuk berdamai dengan masa lalu.',
    updatedAt: '2026-11-02',
    chapters: [
      {
        chapterNumber: 1,
        title: 'Bab 1: Pulang ke Harum Cengkeh',
        content: [
          'Bus antar-kota itu menurunkan Saras di simpang tiga berbatu merah ketika matahari baru saja menyepuh puncak bukit dengan warna jingga tua.',
          'Aroma pertama yang menyambutnya bukan asap knalpot atau bensin, melainkan wangi bunga kopi liar yang mekar di tepi pagar bambu. Rumah kayu jati itu masih berdiri kokoh dengan genteng tanah liat berlumut tipis, persis seperti dalam mimpinya bertahun-tahun.',
          'Dari teras samping, suara lonceng angin kuningan berdenting pelan, menyambut kepulangan yang telah tertunda terlalu lama.',
        ],
      },
    ],
  },
  {
    id: 'novel_4',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    genre: 'Sejarah & Epik',
    year: 1980,
    publisher: 'Lentera Dipantara',
    totalPages: 535,
    totalChapters: 21,
    currentPage: 535,
    currentChapter: 21,
    status: 'favorite',
    rating: 5,
    accentColor: '#78350F',
    tags: ['Mahakarya Sastra', 'Perjuangan Pribumi', 'Kisah Cinta Klasik', 'Nyai Ontosoroh'],
    favoriteQuote:
      'Seorang terpelajar harus sudah berbuat adil sejak dalam pikiran, apalagi dalam perbuatan.',
    personalReview:
      'Novel nomor satu sepanjang masa bagi saya. Karakter Nyai Ontosoroh dan Minke mengajarkan harga diri kemanusiaan di hadapan penindasan kolonial.',
    synopsis:
      'Roman monumental bagian pertama Tetralogi Buru. Kisah cinta Minke dan Annelies Mellema berlatar Surabaya akhir abad ke-19, serta kebesaran jiwa Nyai Ontosoroh melawan tatanan feodal dan hukum kolonial yang timpang.',
    updatedAt: '2026-10-15',
    chapters: [
      {
        chapterNumber: 1,
        title: 'Bab 1: Suatu Pagi di Wonokromo',
        content: [
          'Orang memanggil aku Minke. Suatu nama yang mula-mula kuanggap ganjil dan aneh, lahir dari lidah seorang guru Belanda yang terpeleset.',
          'Duniaku waktu itu adalah dunia kemajuan. Abad kesembilan belas sedang menghembuskan nafasnya yang terakhir. Orang-orang di Eropa telah berhasil menaklukkan ruang dan jarak dengan kereta api uap dan kawat telegraf.',
          'Namun pertemuanku dengan Robert Suurhof siang itu membawaku ke Wonokromo, tempat yang mengubah seluruh cakrawala hidupku.',
        ],
      },
    ],
  },
  {
    id: 'novel_5',
    title: 'Chronicles of Neo-Jakarta 2088',
    author: 'Koleksi Saya (Draft Naskah Pribadi)',
    isOriginalWork: true,
    genre: 'Fiksi Ilmiah & Distopia',
    year: 2026,
    publisher: 'Draft Pribadi / Sedang Ditulis',
    totalPages: 160,
    totalChapters: 8,
    currentPage: 45,
    currentChapter: 3,
    status: 'writing_draft',
    rating: 5,
    accentColor: '#0284C7',
    tags: ['Cyberpunk Lokal', 'Naskah Sendiri', 'Kanal Bawah Tanah', 'AI Berkesadaran'],
    favoriteQuote:
      'Ketika gedung-gedung pencakar langit menembus awan beracun, mereka yang tinggal di bawah jembatan layang hanya punya mimpi dan sirkuit bekas untuk bertahan hidup.',
    personalReview:
      'Ide cerita yang sedang saya kembangkan sendiri. Menggabungkan unsur cyberpunk futuristik dengan kehidupan bantaran sungai Ciliwung tahun 2088.',
    synopsis:
      'Di Jakarta masa depan yang tenggelam di bawah dinding tanggul laut raksasa, seorang hacker jalanan bernama Kael menemukan kode pemrograman kuno yang membuktikan bahwa AI pengatur cuaca kota memiliki kesadaran manusia yang dipenjara.',
    updatedAt: '2026-11-05',
    chapters: [
      {
        chapterNumber: 1,
        title: 'Bab 1: Hujan Asam di Sektor Manggarai',
        content: [
          'Lampu neon holografik iklan mie instan sintetis berkedip-kedip tak beraturan di atas atap seng rumah rakit Kael.',
          'Kabel-kabel optik menjuntai bagai sulur beringin dari menara transmisi distrik atas, meneteskan air hujan asam yang mendesis ketika mengenai lempeng aspal jalanan.',
          'Di layar monitor tabung modifikasinya, sebaris kode biner merah menyala terus berdenyut: "Tolong keluarkan aku."',
        ],
      },
    ],
  },
  {
    id: 'novel_6',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    genre: 'Sastra Nusantara',
    year: 2017,
    publisher: 'Kepustakaan Populer Gramedia',
    totalPages: 379,
    totalChapters: 19,
    currentPage: 379,
    currentChapter: 19,
    status: 'completed',
    rating: 5,
    accentColor: '#0369A1',
    tags: ['Aktivis Reformasi', 'Persahabatan Erat', 'Penuh Haru', 'Keluarga'],
    favoriteQuote:
      'Matilah dengan berdiri tegak, jangan mati sambil merangkak memohon ampun pada kezaliman.',
    personalReview:
      'Buku yang sangat emosional. Bagian kedua dari sudut pandang sang adik, Asmara Jati, sungguh meremukkan hati namun memberikan kekuatan yang mendalam.',
    synopsis:
      'Kisah persahabatan, cinta, dan kehilangan para aktivis mahasiswa yang dihilangkan secara paksa pada masa pergolakan 1998, serta duka dan kegigihan keluarga yang menanti kepulangan mereka.',
    updatedAt: '2026-10-20',
    chapters: [
      {
        chapterNumber: 1,
        title: 'Bab 1: Biru Laut',
        content: [
          'Mati tidak selalu datang bersama suara gelegar petir. Kadang-kadang kematian datang bagai dengung sunyi di dasar laut yang gelap.',
          'Aku teringat aroma dapur ibu di Yogyakarta, wangi tempe bacem dan sambal terasi yang selalu menguar setiap kali kami berkumpul di meja makan.',
          'Jika kelak ada yang bertanya mengapa kami memilih jalan ini, katakan bahwa kami hanya ingin melihat tanah air ini bernapas tanpa rasa takut.',
        ],
      },
    ],
  },
];
