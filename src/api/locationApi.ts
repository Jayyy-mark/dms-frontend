import api from "../helpers/api";
import { helper } from "../helpers/utils";
import {
    Location,
    LocationSearch,
    AddLocation,
    UpdateLocation,
    LocationOptions,
    LocationMapSummaryResponse,
} from "../interfaces/location";


export const locationApi = {
    async all(): Promise<any> {
        const res = await api.get("location/all/");
        return res.data;
    },
    async getMapSummary(): Promise<LocationMapSummaryResponse> {
        const res = await api.get("location/map-summary/");
        return res.data;
    },
    async create(data: AddLocation): Promise<any> {
        const addFormData = helper.setAddLocationFormData(data);

        const res = await api.post("location/create/", addFormData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    },
    async update(data: UpdateLocation): Promise<any> {
        const formData = new FormData();
        formData.append("id", String(data.id));
        formData.append("location_id", data.location_id || "");
        formData.append("location_name", data.location_name || "");
        formData.append("latitude", data.latitude !== undefined && data.latitude !== null ? String(data.latitude) : "");
        formData.append("longitude", data.longitude !== undefined && data.longitude !== null ? String(data.longitude) : "");
        formData.append("city", data.city || "");
        formData.append("state_division", data.state_division || "");
        formData.append("description", data.description || "");
        formData.append("department_id", data.department_id !== undefined && data.department_id !== null ? String(data.department_id) : "");
        formData.append("location_type", data.location_type || "");

        if (data.date) {
            const formattedDate =
                data.date instanceof Date
                    ? helper.formatDate(data.date)
                    : String(data.date).split("T")[0];
            formData.append("date", formattedDate);
        }

        if (data.deleted_photo_ids && data.deleted_photo_ids.length > 0) {
            formData.append("deleted_photo_ids", JSON.stringify(data.deleted_photo_ids));
        }

        if (data.remove_legacy_photo) {
            formData.append("remove_legacy_photo", "true");
        }

        if (data.new_photos && data.new_photos.length > 0) {
            data.new_photos.forEach((file) => {
                formData.append("photos", file);
            });
        }

        const res = await api.put(`location/update/${data.id}/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    },
    async delete(id: number): Promise<any> {
        const res = await api.delete(`location/delete/${id}/`);
        return res.data;
    },
    async getById(id: string): Promise<any> {
        const res = await api.get(`location/search/${id}/`);
        return res.data;
    },
    async search(data: LocationSearch): Promise<Location[]> {
        const cleanData = helper.cleanSearchParams(data);
        const res = await api.get("location/search/", {
            params: cleanData
        });

        return res.data.locations;
    },
    async getOptions(): Promise<LocationOptions> {
        const res = await api.get("location/options/");
        return res.data;
    },
    async exportPdf(search?: string): Promise<Blob> {
        const res = await api.get("location/export-pdf/", {
            params: search ? { search } : undefined,
            responseType: "blob",
        });
        return res.data;
    },
    async getAllRecycled(): Promise<any> {
        const res = await api.get("location/recycle/all/");
        return res.data;
    },
    async restoreRecycle(id: number): Promise<any> {
        const res = await api.patch(`location/recycle/restore/${id}/`);
        return res.data;
    },
    async deleteRecycle(id: number): Promise<any> {
        const res = await api.delete(`location/recycle/delete/${id}/`);
        return res.data;
    },
    async logView(id: number): Promise<any> {
        const res = await api.post(`location/view/${id}/`);
        return res.data;
    },
    async logDownload(id: number): Promise<any> {
        const res = await api.post(`location/download/${id}/`);
        return res.data;
    },
}