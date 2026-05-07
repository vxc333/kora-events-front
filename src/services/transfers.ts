import { api } from "@/lib/api";

export interface InitiateTransferInput {
    recipientEmail: string;
}

export interface TransferResult {
    token: string;
    status: string;
    recipientEmail: string;
}

export async function initiateTransfer(eventId: string, qrToken: string, recipientEmail: string): Promise<TransferResult> {
    const res = await api.post<TransferResult>(`/events/${eventId}/transfers`, {
        qrToken,
        recipientEmail,
    });
    return res.data;
}
