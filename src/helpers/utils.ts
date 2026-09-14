//<!--================================================
//             UTILITIES HELPERS
//=================================================-->

import { Building } from "../interfaces/building";
import { Category } from "../interfaces/category";
import { Department } from "../interfaces/department";
import { AddDocument } from "../interfaces/document";
import { Dtype } from "../interfaces/dtype";
import { AddLocation, LocationOptions } from "../interfaces/location";
import { Rank } from "../interfaces/ranks";
import { Role } from "../interfaces/role";
import { Room } from "../interfaces/room";
import { Staff } from "../interfaces/staff";
import { Stype } from "../interfaces/stype";
import api from "./api"

export const helper = {
    async fetchBuildings(): Promise<Building[]> {
        const res = await api.get("building/all/");
        return res.data.buildings;
    },
    async fetchLocationOptions(): Promise<LocationOptions> {
        const res = await api.get("location/options/");
        return res.data;
    },
    async fetchRooms(): Promise<Room[]> {
        const res = await api.get("room/all/");
        return res.data.rooms;
    },
    async fetchParentCategories(): Promise<Category[]> {
        const res = await api.get("category/all/");
        return res.data.categories;
    },
    async fetchDepartments(): Promise<Department[]> {
        const res = await api.get("department/all/");
        return res.data.departments;
    },
    async fetchRoles(): Promise<Role[]> {
        const res = await api.get("role/all/");
        return res.data.roles;
    },
    async fetchRanks(): Promise<Rank[]> {
        const res = await api.get("rank/all/");
        return res.data.ranks;
    },
    async fetchStypes(): Promise<Stype[]> {
        const res = await api.get("stype/all/");
        return res.data.stypes;
    },
    async fetchStaffs(): Promise<Staff[]> {
        const res = await api.get("staff/all/");
        return res.data.staffs;
    },
    async fetchStaffById(id: any): Promise<Staff> {
        const res = await api.get(`staff/search/${id}/`);
        return res.data.staff;
    },
    async fetchCategories(): Promise<Category[]> {
        const res = await api.get("category/all/");
        return res.data.categories;
    },
    async fetchDtypes(): Promise<Dtype[]> {
        const res = await api.get("dtype/all/");
        return res.data.dtypes;
    },
    cleanSearchParams(data: any) {
        return Object.fromEntries(
            Object.entries(data).filter(([_, v]) => {
                if (v === null || v === undefined) return false;

                if (typeof v === "string") {
                    return v.trim() !== "";
                }

                return true;
            })
        );
    },
    setAddDocumentFormData(data: AddDocument): FormData {
        console.log("this add form data : ", data);
        const formData = new FormData();

        formData.append("document_name", data.document_name);

        if (data.document) {
            formData.append("document", data.document);
        }
        if (data.expired_at) {
            formData.append("expired_at", helper.formatDate(data.expired_at));
        }
        formData.append("staff_id", data.staff_id);
        formData.append("category_id", data.category_id);
        formData.append("dtype_id", data.dtype_id);

        if (data.description) {
            formData.append("description", data.description);
        }

        return formData;
    },
    formatStrDate(dateStr: string) {
        return new Date(dateStr).toLocaleString();
    },
    formatDate(date: Date | string): string {
        if (!date) return "";
        const d = typeof date === "string" ? new Date(date) : date;
        if (isNaN(d.getTime())) return typeof date === "string" ? date : "";
        const formattedDate = d.toLocaleDateString("en-CA");
        return formattedDate;
    },
    getDaysLeft(strDate: string): number {
        if (!strDate) return 0;

        const targetDate = new Date(strDate);
        const today = new Date();

        const diffMs = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        return diffDays;
    },
    setChatMessage(data: any): FormData {
        const form = new FormData();

        if (data.text) {
            form.append("question", data.text);
        }

        // if (data.file) {
        //     form.append("file", data.file);
        // }

        // if (data.document_id) {
        //     form.append("document_id", data.document_id.toString());
        // }

        return form;
    },
    setAddLocationFormData(data: AddLocation): FormData {
        console.log("this add form data : ", data);
        const formData = new FormData();

        formData.append("location_name", data.location_name);

        if (data.photos && data.photos.length > 0) {
            data.photos.forEach((file) => {
                formData.append("photos", file);
            });
            formData.append("photo", data.photos[0]);
        } else if (data.photo) {
            formData.append("photo", data.photo);
        }
        if (data.date) {
            formData.append("date", helper.formatDate(data.date));
        }
        formData.append("city", data.city);
        formData.append("state_division", data.state_division);
        formData.append("description", data.description);
        formData.append("latitude", data.latitude);
        formData.append("longitude", data.longitude);
        formData.append("location_type", data.location_type);
        formData.append("department_id", data.department_id);

        return formData;
    },
}

export const pluralize = (count: number, singular: string, plural: string) =>
    count === 1 ? singular : plural;

