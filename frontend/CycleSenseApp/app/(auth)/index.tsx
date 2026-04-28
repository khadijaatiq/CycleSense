import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '../../services/api';

export default function RegisterScreen() {
    const router = useRouter();

    const [name,     setName]     = useState('');
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [loading,  setLoading]  = useState(false);
    const [banner,   setBanner]   = useState<{ msg: string; type: 'error' | 'success' } | null>(null);

    const showBanner = (msg: string, type: 'error' | 'success') => {
        setBanner({ msg, type });
        setTimeout(() => setBanner(null), 4000);
    };

    const handleRegister = async () => {
        if (!name || !email || !password) {
            showBanner('Please fill in all fields 🌸', 'error');
            return;
        }

        setLoading(true);
        setBanner(null);

        // Timeout after 10 seconds so the user isn't stuck waiting
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 10000)
        );

        try {
            await Promise.race([registerUser(name, email, password), timeout]);
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

            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

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
    input:         { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    button:        { backgroundColor: '#E91E8C', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
    buttonText:    { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    link:          { color: '#E91E8C', textAlign: 'center', marginTop: 8 },
    banner:        { borderRadius: 10, padding: 12, marginBottom: 16 },
    bannerError:   { backgroundColor: '#FFE4EF', borderLeftWidth: 4, borderLeftColor: '#F48FB1' },
    bannerSuccess: { backgroundColor: '#E8F5E9', borderLeftWidth: 4, borderLeftColor: '#81C784' },
    bannerText:    { color: '#880E4F', fontSize: 14, fontWeight: '500' },
});
