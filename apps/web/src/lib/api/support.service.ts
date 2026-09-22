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

export interface SupportConversation {
  id: number;
  userId: number;
  agentId: number | null;
  status: string;
  subject: string | null;
  userName: string;
  userEmail: string | null;
  lastMessage: SupportMessage | null;
  unreadCount: number;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: string;
  content: string;
  read: boolean;
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

  async createConversation(subject: string, message: string): Promise<SupportConversation> {
    const { data } = await apiClient.post<SupportConversation>('/support/conversations', {
      subject,
      message,
    });
    return data;
  },

  async getConversations(): Promise<SupportConversation[]> {
    const { data } = await apiClient.get<SupportConversation[]>('/support/conversations');
    return data;
  },

  async getMessages(conversationId: number): Promise<SupportMessage[]> {
    const { data } = await apiClient.get<SupportMessage[]>(
      `/support/conversations/${conversationId}/messages`,
    );
    return data;
  },

  async sendMessage(conversationId: number, content: string): Promise<SupportMessage> {
    const { data } = await apiClient.post<SupportMessage>(
      `/support/conversations/${conversationId}/messages`,
      { content },
    );
    return data;
  },

  async markAsRead(conversationId: number): Promise<void> {
    await apiClient.patch(`/support/conversations/${conversationId}/read`);
  },

  async getUnreadCount(): Promise<{ totalUnread: number }> {
    const { data } = await apiClient.get<{ totalUnread: number }>(
      '/support/conversations/unread',
    );
    return data;
  },
};
