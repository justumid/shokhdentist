export interface Review {
  id: string;
  name: string;
  rating: number;
  tags: string[];
  text: string;
  date: string;
}

export const REVIEW_TAGS = [
  "Mehribon shifokorlar",
  "Og'riqsiz davolash",
  "Toza va qulay muhit",
  "Sifatli xizmat",
  "Qulay narxlar",
  "Tez qabul",
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "mock-1",
    name: "Aziza M.",
    rating: 5,
    tags: ["Mehribon shifokorlar", "Og'riqsiz davolash"],
    text: "Juda yaxshi klinika! Dr. Shakhbozbek juda e'tiborli va mehribon shifokor. Og'riqsiz davolashdi, hech qo'rqmadim.",
    date: "2026-02-15",
  },
  {
    id: "mock-2",
    name: "Sardor K.",
    rating: 5,
    tags: ["Sifatli xizmat", "Toza va qulay muhit"],
    text: "Professional tish tozalash qildirdim. Natija ajoyib, klinika juda toza va zamonaviy.",
    date: "2026-01-28",
  },
  {
    id: "mock-3",
    name: "Dilnoza R.",
    rating: 4,
    tags: ["Bolalar uchun yaxshi", "Mehribon shifokorlar"],
    text: "Bolalarimni olib bordim, shifokorlar juda yaxshi munosabatda bo'lishdi. Bolalar qo'rqishmadi.",
    date: "2026-03-02",
  },
];

export const REVIEWS_STORAGE_KEY = "shokh_reviews";

export function loadReviews(): Review[] {
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Review[];
      return [...MOCK_REVIEWS, ...parsed];
    }
  } catch {}
  return [...MOCK_REVIEWS];
}

export function saveReview(review: Review) {
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const existing: Review[] = stored ? JSON.parse(stored) : [];
    existing.push(review);
    localStorage.setItem(
      REVIEWS_STORAGE_KEY,
      JSON.stringify(existing),
    );
  } catch {}
}
