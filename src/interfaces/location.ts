export interface LocationPhotoItem {
    id: number;
    photo: string;
    created_at?: string;
}

export interface Location {
    id: number;
    location_id: string;
    location_name: string;
    photo: string | File | null;
    photos?: LocationPhotoItem[];
    latitude: number;
    longitude: number;
    city: string;
    state_division: string;
    date: string;
    description: string;
    location_type: string;
    department_id: string;
}

export interface AddLocation {
    location_name: string;
    photo: File | null;
    photos?: File[];
    latitude: string;
    longitude: string;
    city: string;
    state_division: string;
    description: string;
    date?: Date | null;
    location_type: string;
    department_id: string;
}

export interface LocationSearch {
    location_name: string;
    description: string;
    city: string;
    date: string | null;
    location_type: string;
    department_id: string;
    latitude?: string;
    longitude?: string;
}

export interface Coordinate {
    latitude: string;
    longitude: string;
}

export interface LocationOptions {
    location_types: string[];
    location_names: string[];
    cities: string[];
    longitudes: string[];
    latitudes: string[];
    coordinates: Coordinate[];
}

export interface UpdateLocation {
    id: number;
    location_id: string;
    location_name: string;
    latitude: string;
    longitude: string;
    date: Date | null;
    city: string;
    state_division: string;
    description: string;
    location_type: string;
    department_id: string;
}