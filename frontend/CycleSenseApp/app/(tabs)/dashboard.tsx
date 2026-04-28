import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getPrediction, getCycleHistory } from '../../services/api';
import { session } from '../../services/session';

// ── Helpers ───────────────────────────────────────────────────────────────
function daysElapsed(startDate: string): number {
    if (!startDate) return 0;
    try {
        const diff = Math.floor(
            (new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return Math.max(0, diff);
    } catch { return 0; }
}

function daysUntil(startDate: string, cycleLength: number): number {
    return Math.max(0, cycleLength - daysElapsed(startDate));
}

function formatDate(startDate: string, addDays: number): string {
    if (!startDate) return '—';
    try {
        const d = new Date(startDate);
        d.setDate(d.getDate() + addDays);
        return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return '—'; }
}

function getTimeOfDay(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

// ── Component ─────────────────────────────────────────────────────────────
export default function DashboardScreen() {
    const router = useRouter();
    const token  = session.getToken();
    const name   = session.getName();

    const [prediction,    setPrediction]    = useState<any>(null);
    const [lastCycleDate, setLastCycleDate] = useState('');
    const [loading,       setLoading]       = useState(true);
    const [statsError,    setStatsError]    = useState(false);

    // Re-fetch every time the tab comes into focus
    useFocusEffect(
        useCallback(() => {
            if (token) fetchStats();
            else setLoading(false);
        }, [token])
    );

    const fetchStats = async () => {
        setLoading(true);
        setStatsError(false);
        try {
            const [data, historyData] = await Promise.all([
                getPrediction(token),
                getCycleHistory(token),
            ]);
            setPrediction(data);
            const cycles = historyData?.cycles ?? [];
            if (cycles.length > 0) {
                const latest = cycles[cycles.length - 1];
                setLastCycleDate(latest.cycle_start_date ?? '');
            }
        } catch {
            setStatsError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive',
                onPress: () => {
                    session.clear();
                    router.replace('/(auth)/login');
                },
            },
        ]);
    };

    // ── Derived values ────────────────────────────────────────────────────
    const daysLeft      = prediction && lastCycleDate ? daysUntil(lastCycleDate, prediction.predicted_days) : null;
    const expectedDate  = prediction && lastCycleDate ? formatDate(lastCycleDate, prediction.predicted_days) : null;
    const cycleLength   = prediction?.predicted_days ?? null;

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

            {/* ── Hero header ── */}
            <View style={styles.hero}>
                <View style={styles.heroBubble1} />
                <View style={styles.heroBubble2} />
                <Text style={styles.heroEmoji}>🌸</Text>
                <Text style={styles.greeting}>{getTimeOfDay()},</Text>
                <Text style={styles.userName}>{name || 'there'} ✨</Text>
                <Text style={styles.heroSub}>Your cycle, beautifully tracked.</Text>
            </View>

            {/* ── Quick stats card ── */}
            <View style={styles.statsCard}>
                {loading ? (
                    <View style={styles.statsLoading}>
                        <ActivityIndicator size="small" color="#E91E8C" />
                        <Text style={styles.statsLoadingText}>Loading your stats…</Text>
                    </View>
                ) : statsError || !prediction ? (
                    <View style={styles.noDataBox}>
                        <Text style={styles.noDataEmoji}>🌷</Text>
                        <Text style={styles.noDataTitle}>No predictions yet</Text>
                        <Text style={styles.noDataSub}>Log your first cycle to see your prediction here.</Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.statsTitle}>Next Period</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{daysLeft}</Text>
                                <Text style={styles.statLabel}>days away</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{cycleLength}</Text>
                                <Text style={styles.statLabel}>cycle length</Text>
                            </View>
                        </View>
                        {expectedDate ? (
                            <View style={styles.dateRow}>
                                <Ionicons name="calendar-outline" size={15} color="#E91E8C" />
                                <Text style={styles.dateText}>Expected on {expectedDate}</Text>
                            </View>
                        ) : null}
                        {!prediction.reliable && (
                            <Text style={styles.reliableHint}>⚠ Log 3+ cycles for an ML-powered prediction</Text>
                        )}
                    </>
                )}
            </View>

            {/* ── Quick action buttons ── */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.actionsGrid}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FFF0F7' }]}
                    onPress={() => router.push('/(tabs)/home')}
                >
                    <Ionicons name="add-circle-outline" size={28} color="#E91E8C" />
                    <Text style={styles.actionLabel}>Log Cycle</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FFF0F7' }]}
                    onPress={() => router.push('/(tabs)/prediction')}
                >
                    <Ionicons name="sparkles-outline" size={28} color="#E91E8C" />
                    <Text style={styles.actionLabel}>Prediction</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FFF0F7' }]}
                    onPress={() => router.push('/(tabs)/history')}
                >
                    <Ionicons name="calendar-outline" size={28} color="#E91E8C" />
                    <Text style={styles.actionLabel}>History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FFF0F7' }]}
                    onPress={() => router.push('/(auth)/reset-password')}
                >
                    <Ionicons name="lock-closed-outline" size={28} color="#E91E8C" />
                    <Text style={styles.actionLabel}>Reset Password</Text>
                </TouchableOpacity>
            </View>

            {/* ── Sign out ── */}
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={18} color="#999" />
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>CycleSense 🌸 — Cycle tracking, powered by AI</Text>
        </ScrollView>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const PINK   = '#E91E8C';
const LIGHT  = '#FFF0F7';

const styles = StyleSheet.create({
    scroll:           { flex: 1, backgroundColor: '#fff' },
    container:        { paddingBottom: 40 },

    // Hero
    hero:             { backgroundColor: PINK, paddingTop: 56, paddingBottom: 40, paddingHorizontal: 28, overflow: 'hidden', position: 'relative' },
    heroBubble1:      { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -40, right: -40 },
    heroBubble2:      { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -30, left: -20 },
    heroEmoji:        { fontSize: 36, marginBottom: 8 },
    greeting:         { fontSize: 18, color: 'rgba(255,255,255,0.85)', fontWeight: '400' },
    userName:         { fontSize: 30, color: '#fff', fontWeight: 'bold', marginTop: 2 },
    heroSub:          { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 },

    // Stats card
    statsCard:        { marginHorizontal: 20, marginTop: -22, backgroundColor: '#fff', borderRadius: 18, padding: 22, shadowColor: '#E91E8C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 },
    statsTitle:       { fontSize: 12, fontWeight: '700', color: '#aaa', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },
    statsRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 14 },
    statItem:         { alignItems: 'center' },
    statNumber:       { fontSize: 48, fontWeight: 'bold', color: PINK, lineHeight: 52 },
    statLabel:        { fontSize: 13, color: '#888', marginTop: 2 },
    statDivider:      { width: 1, height: 50, backgroundColor: '#F9C8E0' },
    dateRow:          { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', backgroundColor: LIGHT, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
    dateText:         { fontSize: 13, color: PINK, fontWeight: '500' },
    reliableHint:     { fontSize: 11, color: '#E67E22', marginTop: 10, textAlign: 'center' },

    // Loading / no-data
    statsLoading:     { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', paddingVertical: 12 },
    statsLoadingText: { color: '#999', fontSize: 14 },
    noDataBox:        { alignItems: 'center', paddingVertical: 8 },
    noDataEmoji:      { fontSize: 32, marginBottom: 8 },
    noDataTitle:      { fontSize: 16, fontWeight: '600', color: '#555' },
    noDataSub:        { fontSize: 13, color: '#999', textAlign: 'center', marginTop: 4 },

    // Section
    sectionTitle:     { fontSize: 13, fontWeight: '700', color: '#aaa', letterSpacing: 1.2, textTransform: 'uppercase', marginHorizontal: 20, marginTop: 28, marginBottom: 14 },

    // Action grid
    actionsGrid:      { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12, gap: 12 },
    actionBtn:        { flex: 1, minWidth: '44%', alignItems: 'center', paddingVertical: 22, borderRadius: 14, gap: 8 },
    actionLabel:      { fontSize: 13, fontWeight: '600', color: PINK },

    // Sign out
    signOutBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 32, marginHorizontal: 20, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
    signOutText:      { color: '#999', fontSize: 15, fontWeight: '500' },

    // Footer
    footer:           { textAlign: 'center', color: '#ccc', fontSize: 11, marginTop: 24 },
});
