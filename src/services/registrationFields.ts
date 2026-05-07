import { api } from "@/lib/api";

export type FieldType = "TEXT" | "SELECT" | "CHECKBOX" | "RADIO";

export interface RegistrationField {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    options: string[] | null;
    order: number;
    eventId: string;
}

export interface CreateFieldInput {
    label: string;
    type: FieldType;
    required?: boolean;
    options?: string[];
    order?: number;
}

export interface UpdateFieldInput extends Partial<CreateFieldInput> {}

export async function getRegistrationFields(eventId: string): Promise<RegistrationField[]> {
    const res = await api.get<RegistrationField[]>(`/events/${eventId}/registration-fields`);
    return res.data;
}

export async function createRegistrationField(eventId: string, data: CreateFieldInput): Promise<RegistrationField> {
    const res = await api.post<RegistrationField>(`/events/${eventId}/registration-fields`, data);
    return res.data;
}

export async function updateRegistrationField(eventId: string, fieldId: string, data: UpdateFieldInput): Promise<RegistrationField> {
    const res = await api.patch<RegistrationField>(`/events/${eventId}/registration-fields/${fieldId}`, data);
    return res.data;
}

export async function deleteRegistrationField(eventId: string, fieldId: string): Promise<void> {
    await api.delete(`/events/${eventId}/registration-fields/${fieldId}`);
}
