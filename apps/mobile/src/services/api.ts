import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../navigation/RootNavigation';

const ENV_URL = process.env.EXPO_PUBLIC_API_URL;
const FALLBACK_URL = 'https://airtaxishare-api.onrender.com';
const BASE_URL = ENV_URL || FALLBACK_URL;

const TIMEOUT_MS = 50000;        // 50 second request timeout (to allow Render Cold Starts)
const MAX_RETRIES = 3;           // Retry up to 3 times on network failures
const RETRY_DELAY_BASE_MS = 800; // Exponential backoff: 0.8s, 1.6s, 3.2s

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
        await AsyncStorage.multiRemove(['@user_profile', '@auth_token']);
    } catch (e) {
    }
};

const fetchWithTimeout = (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const request = async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any,
    attempt = 1,
): Promise<{ data: any }> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    try {
        const response = await fetchWithTimeout(
            `${BASE_URL}${endpoint}`,
            { method, headers, body: body ? JSON.stringify(body) : undefined },
            TIMEOUT_MS,
        );

        const text = await response.text();
        let data: any;
        try { data = JSON.parse(text); } catch { data = text; }

        if (!response.ok) {
            // --- Unhandled Session Expiry Protection (Global Interceptor) ---
            if (response.status === 401) {
                await clearUserProfile();
                authToken = '';
                if (navigationRef.isReady()) {
                    navigationRef.reset({ index: 0, routes: [{ name: 'Welcome' as never }] });
                }
                const err: any = new Error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
                err.status = 401;
                throw err;
            }

            // Don't retry 4xx client errors (except captured 401) — only 5xx server errors and network timeouts
            const isClientError = response.status >= 400 && response.status < 500;
            if (isClientError && response.status !== 429) {
                const err: any = new Error(data?.message || `HTTP ${response.status}`);
                err.status = response.status;
                throw err;
            }
            const err: any = new Error(data?.message || `Server error ${response.status}`);
            err.status = response.status;
            throw err;
        }
        return { data };
    } catch (error: any) {
        const isAborted = error.name === 'AbortError';
        const isClientError = error.status >= 400 && error.status < 500 && error.status !== 429;
        const canRetry = (isAborted || (!isClientError && error.status)) && attempt < MAX_RETRIES;

        if (canRetry) {
            const delay = RETRY_DELAY_BASE_MS * Math.pow(2, attempt - 1);
            await sleep(delay);
            return request(endpoint, method, body, attempt + 1);
        }

        // Readable error for UI
        if (isAborted) throw new Error('Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.');
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
    updatePushToken: (pushToken: string) => api.post('/user/push-token', { pushToken }),
};

export const MatchAPI = {
    submitRating: (data: { toUserId: string; matchId: string; score: number; tags?: string[]; note?: string }) =>
        api.post('/match/rating', data),
    getHistory: () => api.get('/match/history'),
    getUserReviews: (userId: string) => api.get(`/match/user/${userId}/reviews`),
};
