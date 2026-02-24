import { Platform } from 'react-native';

// Use environment variable for API URL (configured in .env or .env.production)
// Fallback to localhost behavior if not set
const ENV_URL = process.env.EXPO_PUBLIC_API_URL;
const FALLBACK_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const BASE_URL = ENV_URL || FALLBACK_URL;

import AsyncStorage from '@react-native-async-storage/async-storage';

let authToken = '';

export const initAuthToken = async () => {
    try {
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) authToken = token;
        return token;
    } catch (e) {
        return null;
    }
};

export const getAuthToken = () => authToken;

export const setAuthToken = async (token: string) => {
    authToken = token;
    if (token) {
        await AsyncStorage.setItem('@auth_token', token);
    } else {
        await AsyncStorage.removeItem('@auth_token');
    }
};

// --- User Profile Cache ---
export const saveUserProfile = async (user: any) => {
    try {
        await AsyncStorage.setItem('@user_profile', JSON.stringify(user));
    } catch (e) {
        console.error('Failed to save user profile:', e);
    }
};

export const loadUserProfile = async (): Promise<any | null> => {
    try {
        const data = await AsyncStorage.getItem('@user_profile');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};

export const clearUserProfile = async () => {
    try {
        await AsyncStorage.removeItem('@user_profile');
    } catch (e) {
        console.error('Failed to clear user profile:', e);
    }
};

const request = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    console.log(`API Request: ${method} ${BASE_URL}${endpoint}`);

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = text;
        }

        if (!response.ok) {
            console.error('API Error:', data);
            throw new Error(data.message || 'Request failed');
        }

        return { data };
    } catch (error) {
        console.error('Network Error:', error);
        throw error;
    }
};

export const api = {
    get: (endpoint: string) => request(endpoint, 'GET'),
    post: (endpoint: string, body: any) => request(endpoint, 'POST', body),
    put: (endpoint: string, body: any) => request(endpoint, 'PUT', body),
    delete: (endpoint: string) => request(endpoint, 'DELETE'),
};

export const AuthService = {
    login: (phoneNumber: string) => api.post('/auth/login', { phoneNumber }),
    verify: (phoneNumber: string, code: string) => api.post('/auth/verify', { phoneNumber, code }),
    googleLogin: (idToken: string) => api.post('/auth/google', { idToken }),
    appleLogin: (identityToken: string, fullName?: string) => api.post('/auth/apple', { identityToken, fullName }),
    emailLogin: (email: string, password: string) => api.post('/auth/email-login', { email, password }),
    emailRegister: (email: string, password: string, fullName?: string) => api.post('/auth/email-register', { email, password, fullName }),
};

export const UserService = {
    getProfile: () => api.get('/user/me'),
    updateProfile: (data: { fullName?: string; photoUrl?: string; phoneNumber?: string }) =>
        api.put('/user/profile', data),
};

export const MatchAPI = {
    submitRating: (data: { toUserId: string; matchId: string; score: number; tags?: string[]; note?: string }) =>
        api.post('/match/rating', data),
    getHistory: () => api.get('/match/history'),
};
