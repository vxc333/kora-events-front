import { api } from "@/lib/api";

export interface Notification {
    id: string;
    type: string; // 'CONFIRMATION' | 'APPROVAL' | 'REJECTION' | 'CANCELLATION' | 'CERTIFICATE' | 'BROADCAST'
    title: string;
    body: string;
    readAt: string | null;
    createdAt: string;
}

export async function getParticipantNotifications(qrToken: string): Promise<Notification[]> {
    const res = await api.get<Notification[]>("/notifications", { params: { qrToken } });
    return res.data;
}

export async function markNotificationRead(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(qrToken: string): Promise<void> {
    await api.post("/notifications/read-all", { qrToken });
}
