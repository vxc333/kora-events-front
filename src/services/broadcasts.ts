import { api } from "@/lib/api";

export type BroadcastSegment = "ALL" | "CONFIRMED" | "PENDING" | "CHECKED_IN" | "NOT_CHECKED_IN";

export interface Broadcast {
    id: string;
    subject: string;
    body: string;
    segment: BroadcastSegment;
    sentAt: string;
    recipientCount: number;
}

export interface CreateBroadcastInput {
    subject: string;
    body: string;
    segment: BroadcastSegment;
}

export async function getBroadcasts(eventId: string): Promise<Broadcast[]> {
    const res = await api.get<Broadcast[]>(`/events/${eventId}/broadcasts`);
    return res.data;
}

export async function sendBroadcast(eventId: string, data: CreateBroadcastInput): Promise<Broadcast> {
    const res = await api.post<Broadcast>(`/events/${eventId}/broadcasts/send`, data);
    return res.data;
}
