import api from "../helpers/api";

export interface SourceDocument {
    file_name: string;
    file_url: string;
    page?: number;
    snippet?: string;
}

export interface HistoryMessage {
    role: string;
    content: string;
}

export interface ChatResponse {
    response: string;
    source: string;
    route?: string;
    source_documents?: SourceDocument[];
    error?: string;
}

export const chatApi = {
    async send(data: {
        text: string;
        document_id?: number | null;
        history?: HistoryMessage[];
    }): Promise<ChatResponse> {
        const res = await api.post("chat/", data);
        return res.data;
    },

    async uploadDocument(file: File): Promise<any> {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("chat/upload/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    },
};
