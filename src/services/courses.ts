import { api } from "@/lib/api";

export interface CourseModule {
    id: string;
    title: string;
    videoUrl: string | null;
    duration: number; // minutes
    order: number;
    completedAt: string | null;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    coverUrl: string | null;
    totalDuration: number;
    minimumCompletion: number; // percentage
    modules: CourseModule[];
    enrolledAt: string;
    certificateAvailable: boolean;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
}

export interface QuizResult {
    correct: number;
    total: number;
    passed: boolean;
}

export async function getCourse(courseId: string): Promise<Course> {
    const res = await api.get<Course>(`/courses/${courseId}`);
    return res.data;
}

export async function completeModule(courseId: string, moduleId: string): Promise<CourseModule> {
    const res = await api.post<CourseModule>(`/courses/${courseId}/modules/${moduleId}/complete`);
    return res.data;
}

export async function getModuleQuiz(courseId: string, moduleId: string): Promise<QuizQuestion[]> {
    const res = await api.get<QuizQuestion[]>(`/courses/${courseId}/modules/${moduleId}/quiz`);
    return res.data;
}

export async function submitQuiz(courseId: string, moduleId: string, answers: number[]): Promise<QuizResult> {
    const res = await api.post<QuizResult>(`/courses/${courseId}/modules/${moduleId}/quiz`, { answers });
    return res.data;
}
