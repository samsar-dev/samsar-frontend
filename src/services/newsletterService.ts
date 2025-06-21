import axios from 'axios';
import { NewsletterFormData, NewsletterResponse } from '@/types/newsletter';

// Using Vite's environment variables
const API_URL = import.meta.env.VITE_API_URL || 'https://tijara-backend-production.up.railway.app';

export const sendNewsletter = async (data: NewsletterFormData): Promise<NewsletterResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/admin/newsletter/send`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error sending newsletter:', error);
    throw new Error(error.response?.data?.message || 'Failed to send newsletter');
  }
};

export const getNewsletterStats = async (): Promise<{
  totalSubscribers: number;
  lastSent: string | null;
}> => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/newsletter/stats`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return {
      totalSubscribers: 0,
      lastSent: null
    };
  }
};
