import axios from 'axios';
import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export const strapi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { encodeValuesOnly: true }),
  },
});

export const getMediaUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('//')) return url;
  return `${STRAPI_URL}${url}`;
};

export const fetchAPI = async (path: string, params: any = {}) => {
  try {
    const { data } = await strapi.get(path, { params });
    return data;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    throw error;
  }
};

