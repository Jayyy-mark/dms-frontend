export interface Staff {
    id: number;
    staff_id: string;
    name: string;
    childhood_name: string;
    other_name: string;
    age: string;
    date_of_bith: Date;
    race: string;
    religion: string;
    height: string;
    hair_colour: string;
    eye_colour: string;
    distinguishing_mark: string;
    skin_colour: string;
    body_weight: string;
    birth_place: string;
    nrc_id: string;
    has_conflict_area_history: string;
    conflict_area_history_description: string;
    job_changes_reason: string;
    salary: string;
    has_contact_with_government: string;
    reference_person: string;
    has_criminal_history: string;

    address: StaffAddress;
    foreign_contact: StaffForeignContact;
    foreign_history: StaffForeignHistory;
    family: StaffFamilyMember;
    political_affiliation: StaffPoliticalAffiliation;
    education: StaffHighestEducation;
    student_activity: StaffStudentActivity;
    hobby: StaffHobby;
    service_activity: StaffServiceActivity;
    military_service: StaffMilitaryService;
    award: StaffAward;
    training: StaffTraining;
    reference: StaffReference;
    employment_history: StaffEmploymentHistory;
    school_history: StaffSchoolHistory;
}

export interface StaffForeignContact {
    id: number;
    staff_id: number;

    occupation?: string;
    /** လူမျိုး */
    ethnicity?: string;

    /** တိုင်းပြည် */
    country?: string;

    /** မည်ကဲ့သို့ ရင်းနှီးသည် */
    relationship_description?: string;

}

export interface StaffForeignHistory {
    id: number;
    staff_id: number;

    sequence_no: number;
    country: string;
    company: string;
    department: string;
    person_name: string;
    from_date: string;
    to_date: string;
    reason: string;
}

export interface StaffAddress {
    id: number;
    staff_id: number;
    name: string;
    type: string;
    city: string;
}

export interface StaffMilitaryService {
    id: number;
    staff_id: number;

    /** (က) ကိုယ်ပိုင်အမှတ် */
    service_number?: string;

    /** (ခ) တပ်သို့ဝင်သည့်နေ့ */
    enlistment_date?: string; // or Date

    /** (ဂ) ဗိုလ်လောင်းသင်တန်းအမှတ်စဉ် */
    officer_training_batch?: string;

    /** (ဃ) ပြန်တမ်းဝင်ဖြစ်သည့်နေ့ */
    commission_date?: string; // or Date

    /** (င) တပ်ထွက်သည့်နေ့ */
    discharge_date?: string; // or Date

    /** (စ) ထွက်သည့်အကြောင်း */
    discharge_reason?: string;

    /** (ဆ) အမှုထမ်းဆောင်ခဲ့သောတပ်များ */
    served_units?: string;

    /** (ဇ) တပ်တွင်းရာဇဝင်အကျဉ်း / ပြစ်မှု */
    disciplinary_record?: string;

    /** (ဈ) အငြိမ်းစားလစာ */
    pension?: number;
}

export interface StaffAward {
    id: number;
    staff_id: number;

    /** စဉ် */
    sequence_no: number;

    /** ချီးမြှင့်ခံရသည့် ကာလ */
    awarded_period: string;

    /** ချီးမြှင့်သည့်ဘွဲ့ / တံဆိပ်အမျိုးအစား */
    award_type: string;

    /** ဆုတံဆိပ်အမှတ် */
    medal_number: string;

    /** အမိန့်စာနှင့် ရရှိသည့်ရက်စွဲ */
    order_reference_date: string; // or Date
}

export interface StaffTraining {
    id: number;
    staff_id: number;

    /** စဉ် */
    sequence_no: number;

    /** ကာလ - နေ့ရက်မှ */
    start_date: string; // or Date

    /** ကာလ - နေ့ရက်အထိ */
    end_date: string; // or Date

    /** သင်တန်းအကြောင်းအရာ */
    training_name: string;

    /** တည်နေရာ */
    location: string;

    /** အဆင့် */
    level: string;
}

export interface StaffReference {
    id: number;
    staff_id: number;

    /** ထောက်ခံသူအမည် */
    reference_name: string;

    /** ရာထူး / အလုပ်အကိုင် */
    occupation?: string;

    /** အဖွဲ့အစည်း / ကုမ္ပဏီ */
    organization?: string;

    /** ဆက်သွယ်ရန်ဖုန်း */
    phone_number?: string;

    /** လိပ်စာ */
    address?: string;

    /** ဝန်ထမ်းနှင့်ဆက်နွယ်မှု */
    relationship?: string;
}

export interface StaffEmploymentHistory {
    id: number;
    staff_id: number;

    /** စဉ် */
    sequence_no: number;

    /** အဆင့် */
    position_level: string;

    /** တပ် / ဌာန */
    department: string;

    /** နေရာ */
    location: string;
}

export interface StaffFamilyMember {
    id: number;
    staff_id: number;

    /** Relationship category */
    family_type:
    | 'SIBLING'
    | 'FATHER_SIBLING'
    | 'CHILD'
    | 'MOTHER_SIBLING'
    | 'SPOUSE'
    | 'SPOUSE_SIBLING'
    | 'SPOUSE_FATHER'
    | 'SPOUSE_FATHER_SIBLING'
    | 'SPOUSE_MOTHER'
    | 'SPOUSE_MOTHER_SIBLING';

    /** စဉ် */
    sequence_no: number;

    /** အမည် */
    name: string;

    /** လူမျိုး / ဘာသာ */
    ethnicity_religion: string;

    /** ဇာတိ */
    birthplace: string;

    /** အလုပ်အကိုင် */
    occupation: string;

    /** နေရပ်လိပ်စာ */
    address: string;
}

export interface StaffPoliticalAffiliation {
    id: number;
    staff_id: number;

    /** Whether there is political party involvement */
    has_political_involvement: boolean;

    /** Details if yes */
    details?: string;
}

export interface StaffSchoolHistory {
    id: number;
    staff_id: number;
    school: number;
    academic_year?: Date;
    year: Date;
    myanmar_year: Date;
}

export interface StaffHighestEducation {
    id: number;
    staff_id: number;
    school: string;
    grade?: string;
    roll_number?: string;
    major?: string;
}

export interface StaffStudentActivity {
    id: number;
    staff_id: number;

    activity_type: string;
    involvement_description: string;
    role?: string;
    rank?: string;
}

export interface StaffHobby {
    id: number;
    staff_id: number;
    type: string;
}

export interface StaffServiceActivity {
    id: number;
    staff_id: number;

    service_type: string;
    activity_type: string;
    activity_description: string;
    role: string;
    rank: string;
}






