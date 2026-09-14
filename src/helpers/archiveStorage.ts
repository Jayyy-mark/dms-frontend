import { ArchivedDocument } from "../interfaces/archived_document";
import { Document } from "../interfaces/document";

const ARCHIVE_KEY = "archivedDocuments";
const DOCUMENT_KEY = "documents";

export const getArchivedDocuments = (): ArchivedDocument[] =>
  JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");

export const saveArchivedDocuments = (data: ArchivedDocument[]) =>
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(data));

export const getDocuments = (): Document[] =>
  JSON.parse(localStorage.getItem(DOCUMENT_KEY) || "[]");

export const saveDocuments = (data: Document[]) =>
  localStorage.setItem(DOCUMENT_KEY, JSON.stringify(data));
