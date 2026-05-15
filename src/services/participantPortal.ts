import { api } from "@/lib/api";
import type { Course } from "@/services/courses";

export interface PortalAuth {
    qrToken: string; // used as session identifier
    participantName: string;
    participantEmail: string;
}

export interface PortalEvent {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventSlug: string;
    status: "CONFIRMED" | "PENDING" | "CANCELLED" | "WAITLISTED";
    checkedInAt: string | null;
    certificateAvailable: boolean;
    ticketName: string | null;
}

export interface PortalCourse {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    totalDuration: number;
    minimumCompletion: number;
    eventTitle: string;
    progress: number; // 0-100 percentage of modules completed
    certificateAvailable: boolean;
}

export async function portalLogin(cpf: string, email: string): Promise<PortalAuth> {
    const res = await api.post<PortalAuth>("/portal/login", { cpf, email });
    return res.data;
}

export async function getPortalEvents(qrToken: string): Promise<PortalEvent[]> {
    const res = await api.get<PortalEvent[]>("/portal/events", { params: { qrToken } });
    return res.data;
}

export async function downloadPortalCertificate(qrToken: string, eventId: string): Promise<void> {
    const res = await api.get(`/portal/certificate/${eventId}`, {
        params: { qrToken },
        responseType: "blob",
    });
    const url = URL.createObjectURL(res.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificado-${eventId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export async function getPortalCourses(qrToken: string): Promise<PortalCourse[]> {
    const res = await api.get<PortalCourse[]>("/portal/courses", { params: { qrToken } });
    return res.data;
}

export async function getPortalCourse(qrToken: string, courseId: string): Promise<Course> {
    const res = await api.get<Course>(`/portal/courses/${courseId}`, { params: { qrToken } });
    return res.data;
}

export async function completePortalModule(
    qrToken: string,
    courseId: string,
    moduleId: string,
): Promise<{ completedAt: string }> {
    const res = await api.post<{ completedAt: string }>(
        `/portal/courses/${courseId}/modules/${moduleId}/complete`,
        {},
        { params: { qrToken } },
    );
    return res.data;
}
