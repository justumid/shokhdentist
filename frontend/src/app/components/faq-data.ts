export interface FaqItem {
  id: number;
  q: string;
  a: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: 1,
    q: "Birinchi tashrif qanday o'tadi?",
    a: "Birinchi tashrifda shifokor og'iz bo'shlig'ini ko'rib chiqadi, kerak bo'lsa rentgen olinadi va individual davolash rejasi tuziladi. Bu jarayon odatda 30–40 daqiqa davom etadi.",
  },
  {
    id: 2,
    q: "Qabul oldin nima qilishim kerak?",
    a: "Ilovadagi profilni to'ldiring — shaxsiy, tibbiy va tish tarixi ma'lumotlarini kiriting. Bu shifokorga tashxisni tezroq qo'yishga yordam beradi.",
  },
  {
    id: 3,
    q: "Narxlar qanday belgilanadi?",
    a: "Narxlar xizmat turiga va ishlatilgan materiallarga qarab belgilanadi. Konsultatsiya 100 000 so'mdan boshlanadi. Aniq narxni shifokor ko'rikdan keyin aytadi.",
  },
  {
    id: 4,
    q: "Bo'lib to'lash mumkinmi?",
    a: "Ha, katta summali davolashlar uchun bo'lib to'lash imkoniyati mavjud. Tafsilotlarni qabul vaqtida shifokor bilan kelishishingiz mumkin.",
  },
  {
    id: 5,
    q: "Profilaktik dastur nima?",
    a: "Har 6 oyda bepul profilaktik ko'rik va professional tish tozalash dasturi. Agar ko'rikda aniqlangan kariyes davolansa, keyingi cleaning bepul bo'ladi.",
  },
  {
    id: 6,
    q: "Profilaktik dasturga qanday qo'shilaman?",
    a: "Ilovadagi profilingizni to'liq to'ldiring va 'Qabul' bo'limidan 'Dasturga qo'shilish' tugmasini bosing. Shifokor siz bilan bog'lanib, birinchi tashrif vaqtini belgilaydi.",
  },
  {
    id: 7,
    q: "Qabulni bekor qilish mumkinmi?",
    a: "Ha, qabulni kamida 24 soat oldin bekor qilish kerak. Aks holda profilaktik dastur imtiyozlari ta'sirlanishi mumkin.",
  },
  {
    id: 8,
    q: "Tish oqartirish xavflimi?",
    a: "Professional oqartirish shifokor nazoratida xavfsiz o'tkaziladi. Emal strukturasiga zarar yetkazmaydi, lekin muolaja keyin 48 soat rangli oziq-ovqat va ichimliklardan saqlanish tavsiya etiladi.",
  },
  {
    id: 9,
    q: "Implant o'rnatish og'riqli bo'ladimi?",
    a: "Operatsiya mahalliy anesteziya ostida o'tkaziladi, shuning uchun jarayon og'riqsiz bo'ladi. Operatsiyadan keyin 2–3 kun yengil shishish va noqulaylik bo'lishi mumkin.",
  },
  {
    id: 10,
    q: "Breket qo'yish qancha davom etadi?",
    a: "Breket tizimi odatda 12–24 oy orasida kiyiladi. Aniq muddat tishlar holatiga bog'liq. Har 4–6 haftada tekshiruv amalga oshiriladi.",
  },
  {
    id: 11,
    q: "Bolalar uchun qabul bormi?",
    a: "Ha, biz bolalar stomatologiyasi xizmatini ham ko'rsatamiz. 3 yoshdan boshlab bolalarni profilaktik ko'rikka olib kelish tavsiya etiladi.",
  },
  {
    id: 12,
    q: "Rentgen xavfsizmi?",
    a: "Klinikamizda raqamli rentgen qurilmasi ishlatiladi — an'anaviy rentgenga nisbatan nurlanish 90% kam. Homilador ayollar uchun ehtiyotkorlik sifatida rentgendan vaqtincha voz kechish tavsiya etiladi.",
  },
  {
    id: 13,
    q: "Tish nervi davolash nima?",
    a: "Tish ichidagi yallig'langan yoki kasallangan nervni olib tashlash va kanallarni tozalash jarayoni. Bu tishni sug'urib tashlashdan saqlaydi. Bir yoki bir necha tashrif talab qilishi mumkin.",
  },
  {
    id: 14,
    q: "Qancha vaqt kutish kerak?",
    a: "Biz oldindan qabul vaqtini belgilaymiz, shuning uchun kutish vaqti minimal — odatda 5–10 daqiqa. Shoshilinch holatlarda navbatsiz qabul ham mavjud.",
  },
  {
    id: 15,
    q: "Allergiyam bo'lsa nima qilaman?",
    a: "Profilni to'ldirishda barcha allergiyalarni ko'rsating. Shifokor muqobil materiallar va dorilarni tanlaydi. Har qanday allergiya haqida qabul vaqtida ham aytib o'ting.",
  },
  {
    id: 16,
    q: "Homiladorlik davrida davolanish mumkinmi?",
    a: "Ikkinchi trimestrda ba'zi davolashlar xavfsiz hisoblanadi. Lekin shifokor bilan maslahat qilish shart. Rentgen va ba'zi dorilar homiladorlik davrida qo'llanilmaydi.",
  },
  {
    id: 17,
    q: "Kafolat beriladi mi?",
    a: "Ha, plomba va protezlarga materialga qarab 6 oydan 2 yilgacha kafolat beriladi. Implantlarga esa ishlab chiqaruvchi kafolati amal qiladi.",
  },
  {
    id: 18,
    q: "Ish vaqtingiz qanday?",
    a: "Dushanba–Shanba kunlari soat 9:00 dan 19:00 gacha ishlaymiz. Yakshanba — dam olish kuni. Shoshilinch holatlarda telefon orqali bog'lanishingiz mumkin.",
  },
  {
    id: 19,
    q: "Klinika qayerda joylashgan?",
    a: "Toshkent shahri, Furqat ko'chasi 11a. Metro bekatidan 5 daqiqalik piyoda masofa. Google Maps orqali yo'nalishni olishingiz mumkin.",
  },
  {
    id: 20,
    q: "Masofaviy konsultatsiya bormi?",
    a: "Ha, Telegram orqali dastlabki maslahat olishingiz mumkin. Lekin aniq tashxis qo'yish uchun klinikaga kelish tavsiya etiladi.",
  },
];
