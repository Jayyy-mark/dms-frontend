export interface Category{
    id:number;
    category_id:string;
    category_name:string;
    parent_id:string;
    parent?:Category;
}

export interface AddCategory{
    category_name:string;
    parent_id:string;
}