import { api } from "@/lib/api";

export interface WaitlistInput {
    ticketId: string;
    name: string;
    email: string;
    cpf: string;
    phone: string;
}

export interface WaitlistEntry {
    id: string;
    name: string;
    email: string;
    status: string;
}

export async function joinWaitlist(eventId: string, data: WaitlistInput): Promise<WaitlistEntry> {
    const res = await api.post<WaitlistEntry>(`/events/${eventId}/waitlist`, data);
    return res.data;
}
