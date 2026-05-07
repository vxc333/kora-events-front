import { api } from "@/lib/api";
import type { EventDetail } from "@/types/events";

export interface AvailableTicket {
    id: string;
    name: string;
    description: string | null;
    price: number;
    effectivePrice: number;
    currency: string;
    isHalfPrice: boolean;
    feePassthrough: boolean;
    isSoldOut: boolean;
    isOnSale: boolean;
    quantity: number | null;
    quantitySold: number;
    waitlistEnabled: boolean;
    salesEndDate: string | null;
    ticketType: "STANDARD" | "EARLY_BIRD" | "VIP" | "HALF_PRICE";
}

export interface RegisterInput {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    ticketId?: string;
    couponCode?: string;
}

export interface RegisterResult {
    id: string;
    name: string;
    email: string;
    status: string;
    eventId: string;
    ticketId: string | null;
    qrToken: string;
    checkedInAt: string | null;
    certificateReleased: boolean;
}

export async function getPublicEvent(slug: string): Promise<EventDetail> {
    const res = await api.get<EventDetail>(`/events/public/${slug}`);
    return res.data;
}

export async function getAvailableTickets(eventId: string): Promise<AvailableTicket[]> {
    const res = await api.get<AvailableTicket[]>(`/events/${eventId}/tickets/available`);
    return res.data;
}

export async function registerForEvent(eventId: string, data: RegisterInput): Promise<RegisterResult> {
    const res = await api.post<RegisterResult>(`/events/${eventId}/participants`, data);
    return res.data;
}
