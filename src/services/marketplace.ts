import { api } from "@/lib/api";

export interface MarketplaceEvent {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    bannerUrl: string | null;
    startDate: string;
    endDate: string;
    location: string | null;
    isOnline: boolean;
    primaryColor: string;
    ticketsAvailable: number;
    minPrice: number; // 0 = free
    category: string | null;
    featured: boolean;
}

export interface MarketplaceFilters {
    search?: string;
    category?: string;
    city?: string;
    free?: boolean;
    page?: number;
    limit?: number;
}

export interface MarketplaceResponse {
    data: MarketplaceEvent[];
    total: number;
    page: number;
}

export async function getMarketplaceEvents(filters?: MarketplaceFilters): Promise<MarketplaceResponse> {
    const params: Record<string, string | number | boolean> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.category) params.category = filters.category;
    if (filters?.city) params.city = filters.city;
    if (filters?.free !== undefined) params.free = filters.free;
    if (filters?.page !== undefined) params.page = filters.page;
    if (filters?.limit !== undefined) params.limit = filters.limit;

    const res = await api.get<MarketplaceResponse>("/marketplace/events", { params });
    return res.data;
}
