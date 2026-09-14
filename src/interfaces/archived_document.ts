import { Document } from "./document";


export interface ArchivedDocument{
    id:number;
    document_id:string;
    archivedDocument_id:string;
    document:Document;
    archived_time:string;
}