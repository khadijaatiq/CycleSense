import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator
} from 'react-native';
// 1. Import useRouter
import { useRouter } from 'expo-router';
import { registerUser } from '../../services/api';

export default function RegisterScreen() {
    // 2. Initialize the router
    const router = useRouter();

    const [name,     setName]     = useState('');
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [loading,  setLoading]  = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await registerUser(name, email, password);
            Alert.alert('Success', 'Account created! Please login.');
            
            // 3. Update navigation to Login
            router.push('/login'); 
        } catch (error: any) {
            const msg = error.response?.data?.detail || 'Registration failed';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>CycleSense 🌸</Text>
            <Text style={styles.subtitle}>Create your account</Text>

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

            {/* 4. Update the "Already have an account" link */}
            <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container:  { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
    title:      { fontSize: 32, fontWeight: 'bold', color: '#E91E8C', textAlign: 'center', marginBottom: 8 },
    subtitle:   { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
    input:      { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    button:     { backgroundColor: '#E91E8C', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    link:       { color: '#E91E8C', textAlign: 'center', marginTop: 8 }
});
