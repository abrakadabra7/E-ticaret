export interface User {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
    isEmailVerified?: boolean;
    createdAt?: Date;
}

export interface UserLogin {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface UserRegister {
    fullName: string;
    email: string;
    phone: string;
    password: string;
} 