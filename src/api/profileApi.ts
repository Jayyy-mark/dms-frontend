import api from "../helpers/api";

export interface UpdateProfileInfoData {
  staff_name?: string;
  email?: string;
  staff_ph_number?: string;
  username?: string;
}

export interface UpdateProfileAddressData {
  staff_address?: string;
  address?: string;
}

export interface UpdateProfilePasswordData {
  old_password: string;
  new_password: string;
  retype_new_password: string;
}

export const profileApi = {
  async updateInfo(data: UpdateProfileInfoData) {
    const res = await api.put("user/profile/info/update/", data);
    return res.data;
  },
  async updateAddress(data: UpdateProfileAddressData) {
    const res = await api.put("user/profile/address/update/", data);
    return res.data;
  },
  async updatePassword(data: UpdateProfilePasswordData) {
    const res = await api.put("user/profile/password/update/", data);
    return res.data;
  },
};
