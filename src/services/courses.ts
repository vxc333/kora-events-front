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
    order: number;
}

export interface QuizResult {
    correct: number;
    total: number;
    passed: boolean;
}

// ── Organizer management types ────────────────────────────────────────

export interface CourseSummaryModule {
    id: string;
    title: string;
    videoUrl: string | null;
    duration: number;
    order: number;
    hasQuiz: boolean;
}

export interface CourseSummary {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    minimumCompletion: number;
    isPublished: boolean;
    totalDuration: number;
    modules: CourseSummaryModule[];
}

export interface CreateCourseInput {
    title: string;
    description?: string;
    coverUrl?: string;
    minimumCompletion?: number;
}

export interface UpdateCourseInput {
    title?: string;
    description?: string;
    coverUrl?: string;
    minimumCompletion?: number;
    isPublished?: boolean;
}

export interface AddModuleInput {
    title: string;
    videoUrl?: string;
    duration?: number;
}

export interface UpdateModuleInput {
    title?: string;
    videoUrl?: string;
    duration?: number;
    order?: number;
}

export interface AddQuizQuestionInput {
    question: string;
    options: string[];
    correctIndex: number;
}

// ── Participant-facing functions ──────────────────────────────────────

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

// ── Organizer management functions ───────────────────────────────────

export async function getEventCourses(eventId: string): Promise<CourseSummary[]> {
    const res = await api.get<CourseSummary[]>(`/events/${eventId}/courses`);
    return res.data;
}

export async function createCourse(eventId: string, data: CreateCourseInput): Promise<CourseSummary> {
    const res = await api.post<CourseSummary>(`/events/${eventId}/courses`, data);
    return res.data;
}

export async function updateCourse(courseId: string, data: UpdateCourseInput): Promise<CourseSummary> {
    const res = await api.put<CourseSummary>(`/courses/${courseId}`, data);
    return res.data;
}

export async function deleteCourse(courseId: string): Promise<void> {
    await api.delete(`/courses/${courseId}`);
}

export async function addModule(courseId: string, data: AddModuleInput): Promise<CourseModule> {
    const res = await api.post<CourseModule>(`/courses/${courseId}/modules`, data);
    return res.data;
}

export async function updateModule(courseId: string, moduleId: string, data: UpdateModuleInput): Promise<CourseModule> {
    const res = await api.put<CourseModule>(`/courses/${courseId}/modules/${moduleId}`, data);
    return res.data;
}

export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
    await api.delete(`/courses/${courseId}/modules/${moduleId}`);
}

export async function addQuizQuestion(courseId: string, moduleId: string, data: AddQuizQuestionInput): Promise<QuizQuestion> {
    const res = await api.post<QuizQuestion>(`/courses/${courseId}/modules/${moduleId}/questions`, data);
    return res.data;
}

export async function deleteQuizQuestion(courseId: string, moduleId: string, questionId: string): Promise<void> {
    await api.delete(`/courses/${courseId}/modules/${moduleId}/questions/${questionId}`);
}
