/** Fields that are shared across multiple forms and should carry over automatically */
export interface SharedFormData {
  name: string;
  childhood_name: string;
  other_name: string;
  age_dob: string;
  race_religion: string;
  birth_place: string;
  nrc: string;
  distinguishing_mark: string;
  current_address: string;
  permanent_address: string;
  education: string;
  father_name: string;
  father_job: string;
  mother_name: string;
  mother_job: string;
  current_position: string;
}

export const emptySharedData: SharedFormData = {
  name: "",
  childhood_name: "",
  other_name: "",
  age_dob: "",
  race_religion: "",
  birth_place: "",
  nrc: "",
  distinguishing_mark: "",
  current_address: "",
  permanent_address: "",
  education: "",
  father_name: "",
  father_job: "",
  mother_name: "",
  mother_job: "",
  current_position: "",
};
