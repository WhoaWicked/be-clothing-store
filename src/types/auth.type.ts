export interface UserFields {
    id: number;
    role_id: number;
    role_name: string;
    username: string;
    password: string;
    email: string;
    prefix_id: number | null;
    first_name: string;
    last_name: string;
    phone: string | null;
    is_active: boolean;
    last_login: string | null;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
}

export interface RegisterData {
    role_id: number;
    username: string;
    password: string;
    email: string;
    prefix_id: number;
    first_name: string;
    last_name: string;
    phone: string;
}

export type CreateUserValues = [
    number, // role_id
    string, // username
    string, // password
    string, // email
    number, // prefix_id
    string, // first_name
    string, // last_name
    string  // phone
]