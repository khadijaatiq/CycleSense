import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '../../services/api';

// ── Validation helpers ────────────────────────────────────────────────────
const validateUsername = (u: string): string => {
    if (!u) return 'Username is required';
    if (u.includes(' ')) return 'Username must not contain spaces';
    if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'Only letters, numbers, and underscores allowed';
    if (u.length < 3) return 'Username must be at least 3 characters';
    if (u.length > 20) return 'Username must be 20 characters or fewer';
    return '';
};

const validateEmail = (e: string): string => {
    if (!e) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email address';
    return '';
};

const validatePassword = (p: string): string => {
    if (!p) return 'Password is required';
    if (p.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(p)) return 'Password must include at least one uppercase letter';
    if (!/[0-9]/.test(p)) return 'Password must include at least one number';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p))
        return 'Password must include at least one special character';
    return '';
};

export default function RegisterScreen() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [loading,  setLoading]  = useState(false);
    const [banner,   setBanner]   = useState<{ msg: string; type: 'error' | 'success' } | null>(null);

    // Per-field error messages (shown after first blur or submit attempt)
    const [errors, setErrors] = useState({ username: '', email: '', password: '' });
    const [touched, setTouched] = useState({ username: false, email: false, password: false });

    const showBanner = (msg: string, type: 'error' | 'success') => {
        setBanner({ msg, type });
        setTimeout(() => setBanner(null), 4000);
    };

    const validateAll = () => {
        const newErrors = {
            username: validateUsername(username),
            email:    validateEmail(email),
            password: validatePassword(password),
        };
        setErrors(newErrors);
        setTouched({ username: true, email: true, password: true });
        return !newErrors.username && !newErrors.email && !newErrors.password;
    };

    const handleBlur = (field: 'username' | 'email' | 'password') => {
        setTouched(prev => ({ ...prev, [field]: true }));
        if (field === 'username') setErrors(prev => ({ ...prev, username: validateUsername(username) }));
        if (field === 'email')    setErrors(prev => ({ ...prev, email:    validateEmail(email) }));
        if (field === 'password') setErrors(prev => ({ ...prev, password: validatePassword(password) }));
    };

    const handleRegister = async () => {
        if (!validateAll()) return;

        setLoading(true);
        setBanner(null);

        // Timeout after 10 seconds so the user isn't stuck waiting
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 10000)
        );

        try {
            await Promise.race([registerUser(username, email, password), timeout]);
            showBanner('Account created! Please login ✨', 'success');
            setTimeout(() => router.push('/login'), 1500);
        } catch (error: any) {
            if (error.message === 'timeout') {
                showBanner('Server took too long — is your backend running? 🌷', 'error');
            } else {
                const msg = error.response?.data?.detail || 'Registration failed, please try again';
                showBanner(msg, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>CycleSense 🌸</Text>
            <Text style={styles.subtitle}>Create your account</Text>

            {banner && (
                <View style={[styles.banner, banner.type === 'success' ? styles.bannerSuccess : styles.bannerError]}>
                    <Text style={styles.bannerText}>{banner.msg}</Text>
                </View>
            )}

            {/* ── Username ── */}
            <TextInput
                style={[styles.input, touched.username && errors.username ? styles.inputError : null]}
                placeholder="Username (no spaces)"
                value={username}
                onChangeText={text => {
                    setUsername(text);
                    if (touched.username) setErrors(prev => ({ ...prev, username: validateUsername(text) }));
                }}
                onBlur={() => handleBlur('username')}
                autoCapitalize="none"
                autoCorrect={false}
            />
            {touched.username && errors.username ? (
                <Text style={styles.fieldError}>{errors.username}</Text>
            ) : null}

            {/* ── Email ── */}
            <TextInput
                style={[styles.input, touched.email && errors.email ? styles.inputError : null]}
                placeholder="Email"
                value={email}
                onChangeText={text => {
                    setEmail(text);
                    if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(text) }));
                }}
                onBlur={() => handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {touched.email && errors.email ? (
                <Text style={styles.fieldError}>{errors.email}</Text>
            ) : null}

            {/* ── Password ── */}
            <TextInput
                style={[styles.input, touched.password && errors.password ? styles.inputError : null]}
                placeholder="Password"
                value={password}
                onChangeText={text => {
                    setPassword(text);
                    if (touched.password) setErrors(prev => ({ ...prev, password: validatePassword(text) }));
                }}
                onBlur={() => handleBlur('password')}
                secureTextEntry
            />
            {touched.password && errors.password ? (
                <Text style={styles.fieldError}>{errors.password}</Text>
            ) : null}

            {/* ── Password hint (always visible until valid) ── */}
            {!touched.password || !errors.password ? null : null}
            <Text style={styles.hint}>Must be 8+ chars · uppercase · number · special character</Text>

            {loading
                ? <ActivityIndicator size="large" color="#E91E8C" />
                : <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                  </TouchableOpacity>
            }

            <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container:     { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
    title:         { fontSize: 32, fontWeight: 'bold', color: '#E91E8C', textAlign: 'center', marginBottom: 8 },
    subtitle:      { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
    input:         { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 4, fontSize: 16 },
    inputError:    { borderColor: '#E91E8C', borderWidth: 1.5 },
    fieldError:    { color: '#E91E8C', fontSize: 12, marginBottom: 10, marginLeft: 4 },
    hint:          { color: '#aaa', fontSize: 11, marginBottom: 16, marginLeft: 4 },
    button:        { backgroundColor: '#E91E8C', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16, marginTop: 8 },
    buttonText:    { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    link:          { color: '#E91E8C', textAlign: 'center', marginTop: 8 },
    banner:        { borderRadius: 10, padding: 12, marginBottom: 16 },
    bannerError:   { backgroundColor: '#FFE4EF', borderLeftWidth: 4, borderLeftColor: '#F48FB1' },
    bannerSuccess: { backgroundColor: '#E8F5E9', borderLeftWidth: 4, borderLeftColor: '#81C784' },
    bannerText:    { color: '#880E4F', fontSize: 14, fontWeight: '500' },
});
