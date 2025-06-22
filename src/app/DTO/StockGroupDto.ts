export interface StockGroupDto {
  representative: {
    name: string;
    image?: string;
  };
  stocks: {
    id: number;
    name: string;
    code: string;
    articlesCount: number;
    // Add more fields as needed
  }[];
} 