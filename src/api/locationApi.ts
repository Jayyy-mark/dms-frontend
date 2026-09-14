import api from "../helpers/api";
import { helper } from "../helpers/utils";
import { Location, LocationSearch, AddLocation, UpdateLocation, LocationOptions } from "../interfaces/location";


export const locationApi = {
    async all(): Promise<any> {
        const res = await api.get("location/all/");
        console.log("this is data ", res);
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
        console.log("this is update data : ", data);
        const res = await api.put(`location/update/${data.id}/`, {
            id: data.id,
            location_id: data.location_id,
            location_name: data.location_name,
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            state_division: data.state_division,
            date: data.date,
            description: data.description,
            department_id: data.department_id,
            location_type: data.location_type,
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
}