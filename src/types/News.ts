export interface News {
  id: string;
  title: string;
  originalLink?: string;
  imageUrl?: string;
  summary: string;
  keywords: string;
  category: string;
  publishedAt: string | number[];
  createdAt: string;
  sentiment?: "긍정" | "중립" | "부정";
}
