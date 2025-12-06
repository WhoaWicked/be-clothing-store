export interface UserFields {
    id: number;
    role_id: number;
    role_name: string;
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    is_active: boolean;
    last_login: Date | null;
}