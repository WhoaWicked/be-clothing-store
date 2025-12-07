export interface UserList {
    id: number;
    role_id: number;
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

export interface UserById {
    id: number;
    role_id: number;
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

export type InsertUserValues = [
    number, string, string, string, number, string, string, string, number
]

export interface UpdateUserValues {
    role_id: number;
    username: string;
    password: string;
    email: string;
    prefix_id: number;
    first_name: string;
    last_name: string;
    phone: string;
    updated_by: number;
}

export interface CreateUserRequest {
    role_id: number;
    username: string;
    password: string;
    email: string;
    prefix_id: number;
    first_name: string;
    last_name: string;
    phone: string;
}

export interface UpdateUserRequest {
    role_id: number;
    username: string;
    password: string;
    email: string;
    prefix_id: number;
    first_name: string;
    last_name: string;
    phone: string;
}