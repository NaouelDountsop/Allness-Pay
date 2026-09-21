import { apiClient } from '@/lib/api-client';

export interface SupportSearchResult {
  article: {
    id: string;
    title: string;
    content: string;
    category: {
      id: string;
      name: string;
      code: string;
    };
  };
  score: number;
  matchedQuestion: string | null;
}

export interface SupportCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
}

export interface SupportArticle {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  active: boolean;
  category: SupportCategory;
  questions: { id: string; question: string; keywords: string[] }[];
  createdAt: string;
}

export const supportService = {
  async search(query: string): Promise<SupportSearchResult[]> {
    const { data } = await apiClient.get<SupportSearchResult[]>('/support/search', {
      params: { q: query },
    });
    return data;
  },

  async getCategories(): Promise<SupportCategory[]> {
    const { data } = await apiClient.get<SupportCategory[]>('/support/categories');
    return data;
  },

  async getArticles(): Promise<SupportArticle[]> {
    const { data } = await apiClient.get<SupportArticle[]>('/support/articles');
    return data;
  },
};
