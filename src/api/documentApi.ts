import api from "../helpers/api";
import { helper } from "../helpers/utils";
import { AddDocument, DeepSearchDocument, DeepSearchDocumentResponse, Document, DocumentSearch, UpdateDocument } from "../interfaces/document";


export const documentApi = {
    async all(): Promise<any> {
        const res = await api.get("document/all/");
        console.log("this is data ", res);
        return res.data;
    },
    async create(data: AddDocument): Promise<any> {
        const addFormData = helper.setAddDocumentFormData(data);

        const res = await api.post("document/create/", addFormData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    },
    async update(data: UpdateDocument): Promise<any> {
        const res = await api.put(`document/update/${data.id}/`, {
            document_id: data.document_id,
            document_name: data.document_name,
            staff_id: data.staff_id,
            category_id: data.category_id,
            dtype: data.dtype_id,
            description: data.description,
        });
        return res.data;
    },
    async delete(id: number): Promise<any> {
        const res = await api.delete(`document/delete/${id}/`);
        return res.data;
    },
    async getById(id: string): Promise<any> {
        const res = await api.get(`document/search/${id}/`);
        return res.data;
    },
    async search(data: DocumentSearch): Promise<Document[]> {
        const cleanData = helper.cleanSearchParams(data);
        console.log("this is clean data : ", cleanData);
        const res = await api.get("/document/search/", {
            params: cleanData
        });
        console.log("this is search data : ", res.data.documents);
        return res.data.documents;
    },
    async deepSearch(data: DeepSearchDocument): Promise<DeepSearchDocumentResponse[]> {
        const cleanData = helper.cleanSearchParams(data);
        console.log("this is clean data : ", cleanData);
        const res = await api.get("/document/deepsearch/", {
            params: cleanData
        });

        return res.data.documents;
    },
    async archive(id: number): Promise<any> {
        const res = await api.patch(`document/archive/${id}/`);
        return res.data;
    },
    async getAllArchiveDocument(): Promise<any> {
        const res = await api.get("document/archive/all/");
        return res.data;
    },
    async restoreArchiveDocument(id: number): Promise<any> {
        const res = await api.patch(`document/archive/restore/${id}/`);
        return res.data;
    },
    async deleteArchiveDocument(id: number): Promise<any> {
        const res = await api.delete(`document/archive/delete/${id}/`);
        return res.data;
    },
    async searchArchiveDocument(data: DocumentSearch): Promise<Document[]> {
        const cleanData = helper.cleanSearchParams(data);
        console.log("this is clean data : ", cleanData);
        const res = await api.get("/document/archive/search/", {
            params: cleanData
        });

        return res.data.documents;
    },
    async getAllRecycleDocument(): Promise<any> {
        const res = await api.get("document/recycle/all/");
        return res.data;
    },
    async restoreRecycleDocument(id: number): Promise<any> {
        const res = await api.patch(`document/recycle/restore/${id}/`);
        return res.data;
    },
    async deleteRecycleDocument(id: number): Promise<any> {
        const res = await api.delete(`document/recycle/delete/${id}/`);
        return res.data;
    },
    async searchRecycleDocument(data: DocumentSearch): Promise<Document[]> {
        const cleanData = helper.cleanSearchParams(data);
        console.log("this is clean data : ", cleanData);
        const res = await api.get("/document/recycle/search/", {
            params: cleanData
        });

        return res.data.documents;
    },
    async getExpiredDocuments(): Promise<Document[]> {
        const res = await api.get("/document/expire/all/");
        return res.data.documents;
    }
}