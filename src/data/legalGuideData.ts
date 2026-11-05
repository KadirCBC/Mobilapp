/**
 * Koleksiyonerlik Mevzuatı & Tescil Rehberi Veri Modeli
 * 2863 Sayılı Kültür ve Tabiat Varlıklarını Koruma Kanunu,
 * Müzeler Envanter Yönetmeliği ve UNESCO 1970 Sözleşmesi Kriterleri.
 */

export interface LegalCardItem {
  id: string;
  category: 'license' | 'inventory' | 'unesco';
  badge: string;
  badgeIcon: string;
  title: string;
  summary: string;
  lawReference: string;
  keyPoints: {
    title: string;
    desc: string;
    icon: string;
  }[];
  alertNotice?: string;
  alertType?: 'warning' | 'info' | 'success';
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  tag: string;
  lawArticle?: string;
}

export interface ChecklistStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  requiredDocuments: string[];
  department: string;
  timeline: string;
}

export interface OfficialContact {
  title: string;
  description: string;
  phone?: string;
  website?: string;
  icon: string;
  actionText: string;
  actionUrl: string;
}

// 1. KURUMSAL BİLGİ KARTLARI
export const LEGAL_CARDS: LegalCardItem[] = [
  {
    id: 'legal-card-license',
    category: 'license',
    badge: 'T.C. KÜLTÜR VE TURİZM BAKANLIĞI',
    badgeIcon: 'ribbon-outline',
    title: 'Koleksiyonculuk Belgesi Nasıl Alınır?',
    summary:
      'Türkiye sınırları içinde yasal olarak taşınır kültür varlığı sikke bulundurabilmek için Bakanlık izin belgesi almak kanuni bir zorunluluktur.',
    lawReference: '2863 Sayılı Kanun Madde 26 • Korunması Gerekli Taşınır Kültür ve Tabiat Varlıkları Yönetmeliği',
    keyPoints: [
      {
        title: 'Kişisel Yeterlilik ve Başvuru Şartları',
        desc: 'Türkiye Cumhuriyeti vatandaşı olmak, medeni hakları kullanma ehliyetine sahip bulunmak ve kaçakçılık, zimmet, hırsızlık gibi yüz kızartıcı suçlardan hüküm giymemiş olmak şarttır.',
        icon: 'person-circle-outline',
      },
      {
        title: 'Mekan ve Güvenlik Zorunlulukları',
        desc: 'Koleksiyonun sergileneceği veya saklanacağı adreste; yangına dayanıklı kilitli çelik para kasası, duman dedektörü, hırsızlık alarmı veya kamera gözetim sistemi bulunmalıdır.',
        icon: 'shield-checkmark-outline',
      },
      {
        title: 'Müze Uzman Heyeti İncelemesi',
        desc: 'İkametgahın bağlı bulunduğu yetkili Müze Müdürlüğü uzmanları mekanda fiziki inceleme yaparak güvenlik uygunluk raporu tanzim eder ve Bakanlığa onay için sunar.',
        icon: 'document-text-outline',
      },
      {
        title: 'Ticaret Yasağı (Hobi Statüsü)',
        desc: 'Koleksiyoncu belgesi kesinlikle ticari amaçla devredilemez veya dükkân faaliyeti olarak kullanılamaz. Belgeler şahsa münhasır tescil edilir.',
        icon: 'ban-outline',
      },
    ],
    alertNotice:
      'Önemli İkaz: Koleksiyonculuk İzin Belgesi almadan kültür varlığı niteliğindeki antik sikkeleri tasarrufunda bulundurmak, 2863 sayılı kanun uyarınca adli soruşturma ve hapis cezası gerektirir.',
    alertType: 'warning',
  },
  {
    id: 'legal-card-inventory',
    category: 'inventory',
    badge: 'MÜZELER GENEL MÜDÜRLÜĞÜ',
    badgeIcon: 'library-outline',
    title: 'Müzeye Bildirim ve Envanter Tescil Süreci',
    summary:
      'Koleksiyona yeni giren veya devralınan her eserin yasal menşei ispatlanmalı ve 15 günlük süre zarfında kayıtlı olunan müzeye bildirilmelidir.',
    lawReference: 'Taşınır Kültür Varlıkları Envanter ve Denetim Yönergesi (Madde 11-18)',
    keyPoints: [
      {
        title: '15 Günlük Yasal Bildirim Kuralı',
        desc: 'Yasal müzayede, faturalı alım veya kayıtlı koleksiyoncu devri ile edinilen her sikke, edinme tarihinden itibaren en geç 15 gün içinde müzeye teslim edilerek tescil talep edilmelidir.',
        icon: 'calendar-outline',
      },
      {
        title: 'Çift Nüsha Onaylı Envanter Defteri',
        desc: 'Müze Müdürlüğü tarafından her sayfası resmi olarak mühürlenmiş iki nüsha defter düzenlenir; biri koleksiyoncuda, asıl nüshası ise müze arşivinde saklanır.',
        icon: 'book-outline',
      },
      {
        title: 'Nümizmatik Fiş & Spektro-Makro Kayıt',
        desc: 'Sikkenin ön yüz (avers) ve arka yüz (revers) fotoğrafları, metal saflığı, gram hassasiyetindeki net ağırlığı (±0.01 g), çapı, darphanesi ve kondisyon notu fişe işlenir.',
        icon: 'camera-outline',
      },
      {
        title: 'Müzenin Öncelikli Satın Alma Hakkı',
        desc: 'Müze uzman heyeti tescil sırasında ünik, devlete ait olması gereken müzelik nadirlikteki eserleri rayiç bedelini ödeyerek devlet adına satın alma hakkını saklı tutar.',
        icon: 'storefront-outline',
      },
      {
        title: 'Yıllık Periyodik Sayım Denetimi',
        desc: 'Müze uzmanları her takvim yılında en az bir kez koleksiyoncu adresinde envanterdeki eserlerin fiziki sayımını ve mühür kontrollerini yerinde denetler.',
        icon: 'checkmark-done-circle-outline',
      },
    ],
    alertNotice:
      'Tescil Edilmemiş Eser Bulundurulamaz: Koleksiyon mekanında envanter defterine kaydedilmemiş hiçbir yabancı kültür varlığı sikke barındırılamaz.',
    alertType: 'info',
  },
  {
    id: 'legal-card-unesco',
    category: 'unesco',
    badge: 'ULUSLARARASI KÜLTÜR HUKUKU',
    badgeIcon: 'globe-outline',
    title: 'Uluslararası UNESCO ve Kültür Varlıkları Koruma Kuralları',
    summary:
      'Kültür varlığı kaçakçılığının önlenmesi, yasa dışı kazıların engellenmesi ve uluslararası menşei (provenans) şeffaflığı kriterleri.',
    lawReference: '1970 UNESCO Sözleşmesi • UNIDROIT Sözleşmesi • 2863 Sayılı Kanun Madde 32',
    keyPoints: [
      {
        title: 'Yurtdışına Çıkarma (İhracat) Kesin Yasağı',
        desc: 'Türkiye sınırları içindeki tescilli taşınır kültür varlıklarının yurtdışına çıkarılması kanunen kesinlikle yasaktır (2863 SK Madde 32). İhlal edenler hakkında ağır hapis cezası uygulanır.',
        icon: 'airplane-outline',
      },
      {
        title: 'Provenans (Menşe Zinciri) Şeffaflığı',
        desc: 'Eserin geçmiş müzayede lot numaraları, eski katalog kayıtları ve önceki sahiplik zinciri (provenance) eksiksiz belgelenmelidir.',
        icon: 'trail-sign-outline',
      },
      {
        title: 'ICOM Kırmızı Liste Koruması',
        desc: 'Uluslararası Müzeler Konseyi (ICOM) Tehlike Altındaki Kültür Varlıkları Kırmızı Listesi uyarınca savaş veya kaçak kazı bölgelerinden çıkan belgesiz sikkeler müsadere edilir.',
        icon: 'alert-circle-outline',
      },
      {
        title: 'Yasal İthalat ve Gümrük Tescili',
        desc: 'Yurtdışındaki saygın müzayedelerden fatura ve CITES/ihraç izinleriyle yasal olarak satın alınan sikkeler, Türk gümrüğünde beyan edilerek ülkeye ithal edilebilir ve yerel envantere kaydedilebilir.',
        icon: 'file-tray-full-outline',
      },
    ],
    alertNotice:
      'Uluslararası Uyarı: Kaçak kazı kökenli veya yağma eserlerin mülkiyet iddiası 1970 UNESCO Sözleşmesi uyarınca hükümsüzdür ve iadeye tabidir.',
    alertType: 'warning',
  },
];

// 2. SIKÇA SORULAN SORULAR (AKORDEON FAQ)
export const LEGAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Arazide, tarlada veya denizde tesadüfen bulunan antik sikkeler mülkiyete geçirilebilir mi?',
    answer:
      'Kesinlikle hayır. Türkiye Cumhuriyeti sınırları dahilinde yer altında, yer üstünde veya su altında bulunan tüm kültür varlıkları devletin hüküm ve tasarrufu altındadır. Bulan kişi en geç 3 gün içinde en yakın Müze Müdürlüğüne veya köy muhtarlığı / mülki amirliğe teslim etmekle yükümlüdür. Kanun uyarınca bildirimde bulunan kişiye takdir komisyonunca sikkenin rayiç değerinin %40 ila %50\'si oranında devlet ikramiyesi ödenir.',
    tag: 'Buluntu & Bildirim',
    lawArticle: '2863 S.K. Madde 4 & 64',
  },
  {
    id: 'faq-2',
    question: 'Koleksiyoncular kendi aralarında veya müzayedelerden nasıl yasal sikke alım-satımı yapabilir?',
    answer:
      'Koleksiyoncular sadece Bakanlık izin belgeli diğer koleksiyonculardan veya resmi izinli müzayedelerden eser alabilir. Devir işleminden önce ilgili Müze Müdürlüğüne yazılı müracaat edilir. Müzenin ön alım hakkını kullanmayacağını beyan etmesi üzerine devir sözleşmesi imzalanır; devreden koleksiyoncunun defterinden düşüm yapılır, satın alanın envanterine eklenir.',
    tag: 'Alım - Satım',
    lawArticle: 'Taşınır Kültür Varlıkları Yönetmeliği Madde 22',
  },
  {
    id: 'faq-3',
    question: 'Yurtdışından (VCoins, Heritage Auctions, Gorny & Mosch vb.) sikke satın alıp Türkiye\'ye getirebilir miyim?',
    answer:
      'Evet, yasal yollarla getirilebilir. Satın alınan eserin resmi faturası, menşe sertifikası ve satıcı ülkenin ihraç belgesi ile birlikte Türk Gümrük Kapısında kültür varlığı beyanında bulunulmalıdır. Gümrük idaresi ilgili Müze Müdürlüğü uzmanlarını davet eder. Müze incelemesi sonucu ülkeye girişi onaylanan eser, koleksiyoncunun envanter defterine kaydedilir. Dikkat: İthal edilen eser Türkiye envanterine girdikten sonra bir daha yurtdışına çıkarılamaz.',
    tag: 'İthalat & Gümrük',
    lawArticle: 'Gümrük Kanunu & 2863 S.K. Ek Madde 1',
  },
  {
    id: 'faq-4',
    question: 'NGC Ancients veya PCGS derecelendirme sertifikaları devletin resmi tescili yerine geçer mi?',
    answer:
      'Hayır. NGC veya PCGS sertifikaları, uluslararası piyasalarda sikkenin saflığını, kondisyon notunu ve nümizmatik tipolojisini teyit eden özel bağımsız ekspertiz sertifikalarıdır. Hiçbir özel firma sertifikası devletin yasal envanter kaydı veya koleksiyonculuk belgesi yerine geçmez. Türkiye sınırları içindeki her sikkenin resmi müze defteri kaydı zorunludur.',
    tag: 'Sertifika Geçerliliği',
    lawArticle: 'Mevzuat Madde 26',
  },
  {
    id: 'faq-5',
    question: 'Koleksiyonculuk belgesine sahip olan bir kişi dedektörle sikke arayabilir mi?',
    answer:
      'Kesinlikle hayır. Koleksiyonculuk belgesi sadece mevcut taşınır kültür varlıklarını koruma, inceleme ve muhafaza etme hakkı tanır; arazi taraması, definecilik veya kazı yetkisi vermez. Dedektörle izinsiz kültür varlığı aramak veya kaçak kazı yapmak 2 yıldan 5 yıla kadar hapis cezası ile cezalandırılır. Define aramak için mülki amirlikten müstakil "Define Arama Ruhsatı" alınması gerekir.',
    tag: 'Dedektör & Arama',
    lawArticle: '2863 S.K. Madde 74',
  },
  {
    id: 'faq-6',
    question: 'Koleksiyoncu vefat ettiğinde koleksiyon mirasçılara nasıl intikal eder?',
    answer:
      'Koleksiyon parçalanmaksızın bir bütün halinde mirasçılara intikal eder. Mirasçılar vefat tarihinden itibaren 3 ay içinde ilgili Müze Müdürlüğüne bildirimde bulunmalıdır. Mirasçılardan birinin koleksiyoncu belgesi alması, koleksiyonun belgeli başka bir koleksiyoncuya topluca devredilmesi veya müzeye hibe/satış yapılması gerekir.',
    tag: 'Miras & İntikal',
    lawArticle: 'Yönetmelik Madde 27',
  },
  {
    id: 'faq-7',
    question: 'Cumhuriyet Dönemi veya Osmanlı son dönem madeni paraları kültür varlığı mülkiyetine tabi midir?',
    answer:
      '1876 (Kanun-i Esasi) sonrası Osmanlı son dönem paraları ile Türkiye Cumhuriyeti madeni paraları ve yabancı modern tedavül sikkeleri serbest alım-satıma tabidir; müze tescili ve koleksiyonculuk belgesi şartı aranmaz. Ancak 1876 öncesi Osmanlı (Fatih, Kanuni, vb.), Bizans, Roma ve Antik Grek sikkeleri kesinlikle tescile tabidir.',
    tag: 'Dönem Kapsamı',
    lawArticle: '2863 S.K. Madde 23/a',
  },
];

// 3. RESMİ BAŞVURU ADIMLARI KONTROL LİSTESİ
export const CHECKLIST_STEPS: ChecklistStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'Şahsi Evrak ve Sicil Kayıtlarının Hazırlanması',
    description: 'Bakanlık kriterlerine uygun olarak başvuru sahibinin kişisel ve adli evraklarının derlenmesi.',
    requiredDocuments: [
      'Nüfus Cüzdanı / T.C. Kimlik Kartı Örneği',
      'Yerleşim Yeri (İkametgah) Belgesi (E-Devlet barkodlu)',
      'Adli Sicil ve Arşiv Kayıt Belgesi (Resmi kurum ibrazlı)',
      '4 Adet Biyometrik / Vesikalık Fotoğraf',
    ],
    department: 'İl Nüfus Müdürlüğü / Adliye / E-Devlet',
    timeline: '1 - 2 İş Günü',
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'Mekan ve Güvenlik Altyapısının Kurulması',
    description: 'Sikkelerin saklanacağı konut veya işyeri adresinde yangın ve hırsızlık önlemlerinin tamamlanması.',
    requiredDocuments: [
      'Yangına dayanıklı kilitli çelik para kasası faturası veya görseli',
      'Aktif yangın söndürme tüpü ve duman sensörü',
      'Hırsızlık alarmı veya güvenlik kamerası taahhüdü / sözleşmesi',
      'Koleksiyonun tutulacağı odanın basit yerleşim krokisi',
    ],
    department: 'Koleksiyoncu İkametgahı',
    timeline: '3 - 5 Gün',
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'Yetkili Müze Müdürlüğüne Resmi Başvuru',
    description: 'Hazırlanan dosya ile ikamet edilen ilin Kültür Varlıkları Müze Müdürlüğüne dilekçe verilmesi.',
    requiredDocuments: [
      'Koleksiyonculuk İzin Belgesi Talep Dilekçesi (Islak imzalı)',
      'Hazırlanan tüm şahsi ve güvenlik evrakları dosyası',
      'Varsa tescil edilmek istenen ilk parti sikkelerin listesi',
    ],
    department: 'Bağlı Olunan İl Müze Müdürlüğü',
    timeline: 'Aynı Gün İbraz',
  },
  {
    id: 'step-4',
    stepNumber: 4,
    title: 'Müze Uzman Heyetinin Yerinde İncelemesi',
    description: 'Müze müdürü ve arkeolog/nümizmat uzmanlarınca mekanın güvenlik ve uygunluğunun denetlenmesi.',
    requiredDocuments: [
      'Yerinde İnceleme ve Güvenlik Tespit Tutanağı',
      'Uzman Görüşü ve Heyet Raporu',
    ],
    department: 'Müze Heyeti Denetimi',
    timeline: '7 - 14 Gün',
  },
  {
    id: 'step-5',
    stepNumber: 5,
    title: 'Bakanlık Onayı ve Koleksiyoncu Belgesinin Tanzimi',
    description: 'Müze raporunun Kültür Varlıkları ve Müzeler Genel Müdürlüğünce onaylanarak resmi belgenin basılması.',
    requiredDocuments: [
      'Resmi Koleksiyoncu İzin Belgesi',
      'Müze onaylı ve mühürlü 2 nüsha Envanter Defteri teslimi',
    ],
    department: 'Kültür ve Turizm Bakanlığı',
    timeline: '15 - 30 Gün',
  },
  {
    id: 'step-6',
    stepNumber: 6,
    title: 'İlk Eser Tescili ve Düzenli Envanter Bildirimi',
    description: 'Mevcut sikkelerin fotoğraflı fişlerle deftere işlenmesi ve bundan sonraki her alımda 15 gün kuralına uyulması.',
    requiredDocuments: [
      'Sikkelerin Ön/Arka Makro Fotoğrafları',
      'Metre-Terazi Hassas Ölçüm Nümizmatik Fişleri',
      'Yasal İktisap / Fatura Belgeleri',
    ],
    department: 'Müze Nümizmatik Birimi',
    timeline: 'Her Eser İçin Azami 15 Gün',
  },
];

// 4. RESMİ KURUMLAR VE İLETİŞİM KANALLARI
export const OFFICIAL_CONTACTS: OfficialContact[] = [
  {
    title: 'Kültür Varlıkları ve Müzeler Genel Müdürlüğü',
    description: 'T.C. Kültür ve Turizm Bakanlığı merkez teşkilatı; tescil, mevzuat ve izin politikaları idaresi.',
    phone: '+90 (312) 470 80 00',
    website: 'https://kvmgm.ktb.gov.tr',
    icon: 'business-outline',
    actionText: 'Web Sitesini Ziyaret Et',
    actionUrl: 'https://kvmgm.ktb.gov.tr',
  },
  {
    title: 'ALO 176 Kültür Turizm İletişim Merkezi',
    description: 'Kültür varlığı bildirimleri, koleksiyoncu mevzuat danışma ve ihbar hattı (7/24).',
    phone: '176',
    icon: 'call-outline',
    actionText: 'Hemen Ara: ALO 176',
    actionUrl: 'tel:176',
  },
  {
    title: 'E-Devlet Kapısı Kültür Varlığı Hizmetleri',
    description: 'Koleksiyonculuk ön başvurusu, adli sicil dökümü ve tescil sorgulama portali.',
    website: 'https://www.turkiye.gov.tr/kultur-ve-turizm-bakanligi',
    icon: 'globe-outline',
    actionText: 'E-Devlet Girişi',
    actionUrl: 'https://www.turkiye.gov.tr',
  },
  {
    title: 'Kaçakçılıkla Mücadele Dairesi Başkanlığı',
    description: 'Kaçak kazı, yasadışı satış, yurtdışına kültür varlığı kaçırma ihbarları birimi.',
    phone: '+90 (312) 470 88 88',
    icon: 'alert-circle-outline',
    actionText: 'Resmi İhbar Portali',
    actionUrl: 'https://kvmgm.ktb.gov.tr/TR-44332/kacakcilikla-mucadele.html',
  },
];

