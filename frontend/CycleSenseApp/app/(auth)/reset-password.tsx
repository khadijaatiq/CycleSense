import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { resetPassword } from '../../services/api';
import { session } from '../../services/session';

// ── Validation ─────────────────────────────────────────────────────────────
const validateNewPassword = (p: string): string => {
    if (!p) return 'New password is required';
    if (p.length < 8) return 'Must be at least 8 characters';
    if (!/[A-Z]/.test(p)) return 'Must include at least one uppercase letter';
    if (!/[0-9]/.test(p)) return 'Must include at least one number';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p))
        return 'Must include at least one special character';
    return '';
};

export default function ResetPasswordScreen() {
    const router = useRouter();
    const token  = session.getToken();

    const [currentPwd,  setCurrentPwd]  = useState('');
    const [newPwd,      setNewPwd]      = useState('');
    const [confirmPwd,  setConfirmPwd]  = useState('');
    const [loading,     setLoading]     = useState(false);
    const [banner,      setBanner]      = useState<{ msg: string; type: 'error' | 'success' } | null>(null);

    const [errors,  setErrors]  = useState({ current: '', new: '', confirm: '' });
    const [touched, setTouched] = useState({ current: false, new: false, confirm: false });

    const showBanner = (msg: string, type: 'error' | 'success') => {
        setBanner({ msg, type });
        setTimeout(() => setBanner(null), 4000);
    };

    const validateAll = (): boolean => {
        const e = {
            current: currentPwd ? '' : 'Current password is required',
            new:     validateNewPassword(newPwd),
            confirm: !confirmPwd ? 'Please confirm your new password'
                   : confirmPwd !== newPwd ? 'Passwords do not match' : '',
        };
        setErrors(e);
        setTouched({ current: true, new: true, confirm: true });
        return !e.current && !e.new && !e.confirm;
    };

    const handleBlur = (field: 'current' | 'new' | 'confirm') => {
        setTouched(prev => ({ ...prev, [field]: true }));
        if (field === 'current')
            setErrors(prev => ({ ...prev, current: currentPwd ? '' : 'Current password is required' }));
        if (field === 'new')
            setErrors(prev => ({ ...prev, new: validateNewPassword(newPwd) }));
        if (field === 'confirm')
            setErrors(prev => ({
                ...prev,
                confirm: !confirmPwd ? 'Please confirm your new password'
                       : confirmPwd !== newPwd ? 'Passwords do not match' : '',
            }));
    };

    const handleSubmit = async () => {
        if (!validateAll()) return;
        setLoading(true);
        try {
            await resetPassword(token, currentPwd, newPwd);
            showBanner('Password updated successfully! ✨', 'success');
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
            setTouched({ current: false, new: false, confirm: false });
            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            const msg = error.response?.data?.detail || 'Failed to update password';
            showBanner(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reset Password</Text>
            </View>

            <View style={styles.body}>
                <Text style={styles.lockEmoji}>🔒</Text>
                <Text style={styles.title}>Change your password</Text>
                <Text style={styles.subtitle}>Enter your current password, then choose a new one.</Text>

                {banner && (
                    <View style={[styles.banner, banner.type === 'success' ? styles.bannerSuccess : styles.bannerError]}>
                        <Text style={styles.bannerText}>{banner.msg}</Text>
                    </View>
                )}

                {/* Current password */}
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                    style={[styles.input, touched.current && errors.current ? styles.inputError : null]}
                    placeholder="Your current password"
                    value={currentPwd}
                    onChangeText={text => {
                        setCurrentPwd(text);
                        if (touched.current) setErrors(prev => ({ ...prev, current: text ? '' : 'Current password is required' }));
                    }}
                    onBlur={() => handleBlur('current')}
                    secureTextEntry
                />
                {touched.current && errors.current ? <Text style={styles.fieldError}>{errors.current}</Text> : null}

                {/* New password */}
                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={[styles.input, touched.new && errors.new ? styles.inputError : null]}
                    placeholder="New password"
                    value={newPwd}
                    onChangeText={text => {
                        setNewPwd(text);
                        if (touched.new) setErrors(prev => ({ ...prev, new: validateNewPassword(text) }));
                    }}
                    onBlur={() => handleBlur('new')}
                    secureTextEntry
                />
                {touched.new && errors.new
                    ? <Text style={styles.fieldError}>{errors.new}</Text>
                    : <Text style={styles.hint}>8+ chars · uppercase · number · special character</Text>
                }

                {/* Confirm password */}
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                    style={[styles.input, touched.confirm && errors.confirm ? styles.inputError : null]}
                    placeholder="Re-enter new password"
                    value={confirmPwd}
                    onChangeText={text => {
                        setConfirmPwd(text);
                        if (touched.confirm) setErrors(prev => ({
                            ...prev,
                            confirm: !text ? 'Please confirm your new password'
                                   : text !== newPwd ? 'Passwords do not match' : '',
                        }));
                    }}
                    onBlur={() => handleBlur('confirm')}
                    secureTextEntry
                />
                {touched.confirm && errors.confirm ? <Text style={styles.fieldError}>{errors.confirm}</Text> : null}

                {loading
                    ? <ActivityIndicator size="large" color="#E91E8C" style={{ marginTop: 24 }} />
                    : <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Update Password</Text>
                      </TouchableOpacity>
                }
            </View>
        </ScrollView>
    );
}

const PINK = '#E91E8C';

const styles = StyleSheet.create({
    scroll:        { flex: 1, backgroundColor: '#fff' },
    container:     { paddingBottom: 40 },
    header:        { backgroundColor: PINK, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
    backBtn:       { padding: 4 },
    headerTitle:   { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    body:          { padding: 24 },
    lockEmoji:     { fontSize: 40, textAlign: 'center', marginTop: 8, marginBottom: 8 },
    title:         { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
    subtitle:      { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 6, marginBottom: 28 },
    label:         { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
    input:         { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 13, fontSize: 15, marginBottom: 4 },
    inputError:    { borderColor: PINK, borderWidth: 1.5 },
    fieldError:    { color: PINK, fontSize: 12, marginBottom: 14, marginLeft: 2 },
    hint:          { color: '#bbb', fontSize: 11, marginBottom: 18, marginLeft: 2 },
    button:        { backgroundColor: PINK, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
    buttonText:    { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    banner:        { borderRadius: 10, padding: 12, marginBottom: 16 },
    bannerError:   { backgroundColor: '#FFE4EF', borderLeftWidth: 4, borderLeftColor: '#F48FB1' },
    bannerSuccess: { backgroundColor: '#E8F5E9', borderLeftWidth: 4, borderLeftColor: '#81C784' },
    bannerText:    { color: '#880E4F', fontSize: 14, fontWeight: '500' },
});
