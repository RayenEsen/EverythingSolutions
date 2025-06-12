import { Article } from './Article';
 
export interface Stock {
  id: number;
  name: string;
  code: string;
  articles: Article[];
} 