import { api } from "@/lib/api";

export interface CheckinResult {
    id: string;
    name: string;
    email: string;
    eventId: string;
    checkedInAt: string;
}

export interface CheckinStats {
    total: number;
    checkedIn: number;
    pending: number;
}

export async function performCheckin(token: string): Promise<CheckinResult> {
    const res = await api.post<CheckinResult>(`/checkin/${token}`);
    return res.data;
}

export async function performCheckinByCpf(cpf: string, eventId: string): Promise<CheckinResult> {
    const res = await api.post<CheckinResult>("/checkin/by-cpf", { cpf, eventId });
    return res.data;
}

export async function performCheckinByName(name: string, eventId: string): Promise<CheckinResult> {
    const res = await api.post<CheckinResult>("/checkin/by-name", { name, eventId });
    return res.data;
}

export async function getCheckinStats(eventId: string): Promise<CheckinStats> {
    const res = await api.get<CheckinStats>(`/events/${eventId}/checkin/stats`);
    return res.data;
}

export interface ManualCheckinLog {
    id: string;
    participantName: string;
    method: "QR" | "CPF" | "NAME";
    justification: string | null;
    operatorName: string | null;
    createdAt: string;
}

export async function getAuditLog(eventId: string): Promise<ManualCheckinLog[]> {
    const res = await api.get<ManualCheckinLog[]>(`/events/${eventId}/checkin/audit-log`);
    return res.data;
}

export async function exportInstitutional(eventId: string, eventTitle: string): Promise<void> {
    const res = await api.get(`/events/${eventId}/participants/export-institutional`, {
        responseType: "blob",
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = eventTitle.replace(/\s+/g, "-").toLowerCase() || eventId;
    a.download = `lista-institucional-${slug}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
