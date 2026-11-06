import { Platform } from 'react-native';
import { CoinItem, MOCK_COINS } from '@/data/mockData';

/**
 * Nümizmatik Yerel / cPanel API İstemcisi
 * Yerel Geliştirme (Localhost): http://localhost:8000/api/v1
 * Android Emülatör: http://10.0.2.2:8000/api/v1
 * Canlı Prodüksiyon: https://paneliniz.com/api/v1
 */
export const API_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
export const API_BASE_URL = `${API_HOST}/api/v1`;

export interface BackendCivilization {
  id: number;
  name: string;
  slug: string;
  era_period?: string | null;
  description?: string | null;
  cover_image?: string | null;
  coins_count?: number;
}

export interface BackendMint {
  id: number;
  name: string;
  ancient_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  civilization?: { id: number; name: string; slug: string } | null;
  coins_count?: number;
}

export interface BackendCoin {
  id: number | string;
  title: string;
  slug?: string;
  ruler?: string | null;
  civilization?: { id: number; name: string; slug: string } | string | null;
  mint?: { id: number; name: string; ancient_name?: string; latitude?: number; longitude?: number } | string | null;
  metal_type: string;
  standard_name: string;
  weight_grams?: number | string | null;
  diameter_mm?: number | string | null;
  die_axis?: string | null;
  year_start?: number | null;
  year_end?: number | null;
  formatted_period?: string;
  formatted_value_range?: string;
  currency?: string;
  rarity_code?: string;
  condition_grade?: string;
  avers_image?: string | null;
  revers_image?: string | null;
  avers_thumb_url?: string | null;
  avers_medium_url?: string | null;
  revers_thumb_url?: string | null;
  revers_medium_url?: string | null;
  avers_description?: string | null;
  revers_description?: string | null;
  reference_codes?: Record<string, string> | null;
  estimated_value_min?: number | string | null;
  estimated_value_max?: number | string | null;
  is_published?: boolean;
  is_featured?: boolean;
}

export interface GeminiScanResponse {
  success: boolean;
  scan_id?: number;
  ai_analysis: {
    identified_title: string;
    civilization: string;
    ruler?: string | null;
    metal_type: string;
    period?: string | null;
    mint?: string | null;
    estimated_condition: string;
    confidence_score: number;
    avers_description?: string | null;
    revers_description?: string | null;
    authenticity_notes?: string | null;
  };
  matched_archive_coin?: BackendCoin | null;
  message?: string;
}

export interface PaginatedCoinsResult {
  data: CoinItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export function resolveImageUrl(path?: string | null): string {
  if (!path) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Denarius_Domitian-RIC_0114.jpg/640px-Denarius_Domitian-RIC_0114.jpg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const storagePath = cleanPath.startsWith('/storage/') ? cleanPath : `/storage/${cleanPath.replace(/^\//, '')}`;
  return `${API_HOST}${storagePath}`;
}

/**
 * Backend'den gelen sikke verisini Expo mobil UI'ın beklediği CoinItem arayüzüne dönüştürür.
 */
export function mapBackendCoinToCoinItem(b: BackendCoin): CoinItem {
  const civName = typeof b.civilization === 'object' && b.civilization !== null ? b.civilization.name : (b.civilization as string) || 'Bilinmiyor';
  const mintName = typeof b.mint === 'object' && b.mint !== null ? b.mint.name : (b.mint as string) || '';

  const rawObverse = b.avers_thumb_url || b.avers_medium_url || b.avers_image;
  const rawReverse = b.revers_thumb_url || b.revers_medium_url || b.revers_image;

  const obverse = resolveImageUrl(rawObverse);
  const reverse = rawReverse ? resolveImageUrl(rawReverse) : obverse;

  let numericPrice = 0;
  if (b.estimated_value_max) {
    numericPrice = typeof b.estimated_value_max === 'number' ? b.estimated_value_max : parseFloat(String(b.estimated_value_max));
  } else if (b.estimated_value_min) {
    numericPrice = typeof b.estimated_value_min === 'number' ? b.estimated_value_min : parseFloat(String(b.estimated_value_min));
  }

  return {
    id: String(b.id),
    title: b.title,
    civilization: civName,
    ruler: b.ruler || '',
    period: b.formatted_period || (b.year_start ? `${b.year_start}` : ''),
    material: b.metal_type,
    weight: b.weight_grams ? `${b.weight_grams} g` : '',
    diameter: b.diameter_mm ? `${b.diameter_mm} mm` : '',
    obverseImage: obverse,
    reverseImage: reverse,
    obverseDesc: b.avers_description || '',
    reverseDesc: b.revers_description || '',
    rarity: b.rarity_code || 'C',
    estimatedValue: b.formatted_value_range || (numericPrice > 0 ? `$${numericPrice}` : ''),
    description: b.avers_description ? `${b.avers_description} ${b.revers_description || ''}` : b.title,
    mint: mintName,
    condition: b.condition_grade || 'VF',
    numericPrice: numericPrice,
    isScanned: false,
  };
}

/**
 * API HTTP İstemcisi
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 saniye zaman aşımı

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.message || `Sunucu hatası (HTTP ${response.status})`);
    }

    return await response.json();
  } catch (error: any) {
    console.warn(`[API İsteği Başarısız: ${endpoint}]`, error?.message || error);
    throw error;
  }
}

export const api = {
  coins: {
    /**
     * Sayfalanmış ve filtreli sikke listesi çeker (Infinite Scroll).
     */
    async list(params: {
      page?: number;
      per_page?: number;
      q?: string;
      metals?: string[];
      civilizations?: (string | number)[];
      mint_id?: number | string;
      price_min?: number;
      price_max?: number;
      sort_by?: string;
      is_featured?: boolean;
    } = {}): Promise<PaginatedCoinsResult> {
      try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', String(params.page));
        if (params.per_page) queryParams.append('per_page', String(params.per_page));
        if (params.q) queryParams.append('q', params.q);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.mint_id) queryParams.append('mint_id', String(params.mint_id));
        if (params.price_min) queryParams.append('price_min', String(params.price_min));
        if (params.price_max) queryParams.append('price_max', String(params.price_max));
        if (params.is_featured) queryParams.append('is_featured', '1');

        if (params.metals && params.metals.length > 0) {
          params.metals.forEach((m) => queryParams.append('metals[]', m));
        }
        if (params.civilizations && params.civilizations.length > 0) {
          params.civilizations.forEach((c) => queryParams.append('civilizations[]', String(c)));
        }

        const queryString = queryParams.toString();
        const endpoint = `/coins${queryString ? `?${queryString}` : ''}`;
        const res = await request<any>(endpoint);

        const backendCoins: BackendCoin[] = res.data || [];
        const coinItems = backendCoins.map(mapBackendCoinToCoinItem);

        return {
          data: coinItems,
          meta: res.meta || {
            current_page: params.page || 1,
            last_page: 1,
            per_page: params.per_page || 20,
            total: coinItems.length,
          },
        };
      } catch {
        // Canlı API henüz DNS olarak yönlenmemişse kesintisiz çalışma için arşiv mock listesi ile yanıt ver
        let filtered = [...MOCK_COINS];
        if (params.q) {
          const qLower = params.q.toLowerCase();
          filtered = filtered.filter((c) =>
            c.title.toLowerCase().includes(qLower) ||
            c.ruler.toLowerCase().includes(qLower) ||
            c.civilization.toLowerCase().includes(qLower)
          );
        }
        return {
          data: filtered,
          meta: { current_page: 1, last_page: 1, per_page: 20, total: filtered.length },
        };
      }
    },

    /**
     * Tekil sikke detayını çeker.
     */
    async get(id: string | number): Promise<CoinItem | null> {
      try {
        const res = await request<any>(`/coins/${id}`);
        if (res && res.data) {
          return mapBackendCoinToCoinItem(res.data);
        }
        return null;
      } catch {
        const local = MOCK_COINS.find((c) => c.id === String(id));
        return local || null;
      }
    },
  },

  scan: {
    /**
     * Sikke fotoğrafını Google Gemini AI API'ye gönderir ve MySQL arşiv eşleşmesi döner.
     */
    async gemini(aversBase64: string, reversBase64?: string): Promise<GeminiScanResponse> {
      return await request<GeminiScanResponse>('/scan/gemini', {
        method: 'POST',
        body: JSON.stringify({
          avers_image: aversBase64,
          revers_image: reversBase64,
        }),
      });
    },
  },

  mints: {
    /**
     * Mobil harita için antik darphaneleri döner.
     */
    async list(): Promise<BackendMint[]> {
      try {
        const res = await request<any>('/mints');
        return res.data || [];
      } catch {
        return [];
      }
    },
  },

  civilizations: {
    /**
     * Tüm medeniyetleri ve eser sayılarını döner.
     */
    async list(): Promise<BackendCivilization[]> {
      try {
        const res = await request<any>('/civilizations');
        return res.data || [];
      } catch {
        return [];
      }
    },
  },
};

