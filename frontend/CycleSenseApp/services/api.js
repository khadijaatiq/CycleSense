import axios from 'axios';

const BASE_URL = 'https://freckles-hardly-galvanize.ngrok-free.dev';


// Create axios instance with base URL
const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});


// ── Auth ──────────────────────────────────────────────────────────────────

export const registerUser = async (name, email, password) => {
    // Sends registration data to backend
    // Returns success message or throws error
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
};

export const loginUser = async (email, password) => {
    // Sends login credentials
    // Returns access_token which we store and use for all future requests
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};


// ── Cycles ────────────────────────────────────────────────────────────────

export const logCycle = async (token, cycleData) => {
    // Logs one cycle entry for the logged-in user
    // token identifies who is making the request
    const response = await api.post('/cycle/log', cycleData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getCycleHistory = async (token) => {
    // Fetches all past cycles for this user
    const response = await api.get('/cycle/history', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};


// ── Prediction ────────────────────────────────────────────────────────────

export const getPrediction = async (token) => {
    // Calls the ML prediction endpoint
    // Returns predicted_days, confidence_range, reliable flag
    const response = await api.get('/cycle/predict', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};