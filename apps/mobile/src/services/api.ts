import { Platform } from 'react-native';

// Use environment variable for API URL (configured in .env or .env.production)
// Fallback to localhost behavior if not set
const ENV_URL = process.env.EXPO_PUBLIC_API_URL;
const FALLBACK_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const BASE_URL = ENV_URL || FALLBACK_URL;

let authToken = '';

export const setAuthToken = (token: string) => {
    authToken = token;
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
};
