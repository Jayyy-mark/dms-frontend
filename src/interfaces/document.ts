import { Category } from "./category";
import { Dtype } from "./dtype";
import { Staff } from "./staff";

export interface Document {
    id: number;
    document_id: string;
    document_name: string;
    document: File | null;
    staff_id?: number;
    staff?: Staff;
    category_id?: number;
    category?: Category;
    dtype_id?: number;
    dtype?: Dtype;

    created_at?: string;
    updated_at?: string;
    expired_at?: string;
    description?: string;
}

export interface DocumentApiResponse {
    documents: Document[];
}


export interface AddDocument {
    document_name: string;
    document: File | null;
    staff_id: string;
    category_id: string;
    dtype_id: string;

    description: string;
    expired_at?: string | Date | null;
}

export interface DocumentSearch {
    document_id: string;
    document_name: string;
    staff_id: string;
    category_id: string;
    dtype_id: string;

    description: string;
    department_id: string;

    expired_at: string | null;
    created_at: string | null;
    updated_at: string | null;

    from_date: Date | null | string;
    to_date: Date | null | string;

    expired_from_date: Date | null | string;
    expired_to_date: Date | null | string;

    updated_from_date: Date | null | string;
    updated_to_date: Date | null | string;

}

export interface UpdateDocument {
    id: number;
    document_id: string;
    document_name: string;
    staff_id: string;
    category_id: string;
    dtype_id: string;

    description: string;
}

export interface DeepSearchDocument {

    text: string;
    category_id: string;
    department_id: string;
    document_status: string;

    from_date: Date | null;
    to_date: Date | null;

    updated_from_date: Date | null;
    updated_to_date: Date | null;
}

export interface Match {
    line: string;
    page?: string | null;
    text: string;
}

export interface DeepSearchDocumentResponse {
    id: number;
    department_name: string;
    category: string;
    filename: string;
    uploaded_at: string;
    file_url: string;
    matches: Match[];
}

export interface ArchiveDocumentSearch {
    document_id: string;
    document_name: string;
    staff_id: string;
    category_id: string;
    dtype_id: string;

    description?: string;
    department_id: string;

    archived_at: string | null;

    from_date: Date | null | string;
    to_date: Date | null | string;
}

export interface RecycleDocumentSearch {
    document_id: string;
    document_name: string;
    staff_id: string;
    category_id: string;
    dtype_id: string;

    description?: string;
    department_id: string;

    recycle_at: string | null;

    from_date: Date | null | string;
    to_date: Date | null | string;
}