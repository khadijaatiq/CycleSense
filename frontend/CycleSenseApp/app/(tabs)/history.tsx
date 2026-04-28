import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ActivityIndicator,
    FlatList, TouchableOpacity, ScrollView
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getCycleHistory } from '../../services/api';
import { session } from '../../services/session';

// Simple calendar — highlights cycle start dates
function MiniCalendar({ cycles }: { cycles: any[] }) {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const cycleDates = new Set(
        cycles.map(c => c.cycle_start_date?.slice(0, 10)).filter(Boolean)
    );

    const year  = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];

    const padded = [...cells, ...Array((7 - (cells.length % 7)) % 7).fill(null)];

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const isToday = (d: number) =>
        d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const isCycleDay = (d: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return cycleDates.has(dateStr);
    };

    return (
        <View style={cal.wrapper}>
            <View style={cal.header}>
                <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
                    <Text style={cal.navText}>‹</Text>
                </TouchableOpacity>
                <Text style={cal.monthTitle}>{monthName}</Text>
                <TouchableOpacity onPress={nextMonth} style={cal.navBtn}>
                    <Text style={cal.navText}>›</Text>
                </TouchableOpacity>
            </View>

            <View style={cal.dayRow}>
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <Text key={d} style={cal.dayLabel}>{d}</Text>
                ))}
            </View>

            <View style={cal.grid}>
                {padded.map((day, i) => (
                    <View key={i} style={cal.cell}>
                        {day !== null && (
                            <View style={[
                                cal.dayCircle,
                                isToday(day)    && cal.todayCircle,
                                isCycleDay(day) && cal.cycleCircle,
                            ]}>
                                <Text style={[
                                    cal.dayText,
                                    isToday(day)    && cal.todayText,
                                    isCycleDay(day) && cal.cycleText,
                                ]}>{day}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>

            <View style={cal.legend}>
                <View style={[cal.legendDot, { backgroundColor: '#E91E8C' }]} />
                <Text style={cal.legendLabel}>Cycle start date</Text>
                <View style={[cal.legendDot, { backgroundColor: '#FFF0F7', borderWidth: 1, borderColor: '#E91E8C', marginLeft: 16 }]} />
                <Text style={cal.legendLabel}>Today</Text>
            </View>
        </View>
    );
}

function CycleCard({ item, index }: { item: any; index: number }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <TouchableOpacity style={card.container} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
            <View style={card.header}>
                <View style={card.badge}>
                    <Text style={card.badgeText}>#{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={card.date}>📅 {item.cycle_start_date?.slice(0, 10) || '—'}</Text>
                    <Text style={card.length}>{item.cycle_length} day cycle</Text>
                </View>
                <Text style={card.chevron}>{expanded ? '▲' : '▼'}</Text>
            </View>

            {expanded && (
                <View style={card.details}>
                    <Detail label="😰 Stress level"      value={`${item.stress_level} / 5`} />
                    <Detail label="😴 Sleep hours"       value={`${item.sleep_hours} hrs`} />
                    <Detail label="🏃 Exercise intensity" value={exerciseLabel(item.exercise_intensity)} />
                    <Detail label="🤒 Was sick"          value={item.illness_flag ? 'Yes' : 'No'} />
                </View>
            )}
        </TouchableOpacity>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <View style={card.row}>
            <Text style={card.rowLabel}>{label}</Text>
            <Text style={card.rowValue}>{value}</Text>
        </View>
    );
}

function exerciseLabel(v: number) {
    if (v === 1) return 'None';
    if (v === 2) return 'Moderate';
    if (v === 3) return 'Intense';
    return `${v}`;
}

export default function HistoryScreen() {
    const token = session.getToken();

    const [cycles,  setCycles]  = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    const fetchHistory = async () => {
        if (!token) { setLoading(false); setError('No session — please login again.'); return; }
        setLoading(true);
        setError('');
        try {
            const data = await getCycleHistory(token);
            // API returns { cycles: [...] } or directly an array
            const list = Array.isArray(data) ? data : (data.cycles || []);
            setCycles(list.reverse()); // newest first
        } catch (e: any) {
            setError(e.response?.data?.detail || 'Could not load history');
        } finally {
            setLoading(false);
        }
    };

    // Refresh whenever tab comes into focus
    useFocusEffect(useCallback(() => { fetchHistory(); }, [token]));

    if (loading) return (
        <View style={s.center}>
            <ActivityIndicator size="large" color="#E91E8C" />
            <Text style={s.loadingText}>Loading your history...</Text>
        </View>
    );

    if (error) return (
        <View style={s.center}>
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={fetchHistory}>
                <Text style={s.retryText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <FlatList
            data={cycles}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={s.container}
            ListHeaderComponent={
                <>
                    <MiniCalendar cycles={cycles} />
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>All Logged Cycles</Text>
                        <Text style={s.sectionCount}>{cycles.length} total</Text>
                    </View>
                    {cycles.length === 0 && (
                        <View style={s.empty}>
                            <Text style={s.emptyEmoji}>🌸</Text>
                            <Text style={s.emptyText}>No cycles logged yet.</Text>
                            <Text style={s.emptySubtext}>Head to the Log tab to add your first one!</Text>
                        </View>
                    )}
                </>
            }
            renderItem={({ item, index }) => <CycleCard item={item} index={index} />}
        />
    );
}

const s = StyleSheet.create({
    container:   { padding: 16, backgroundColor: '#fff', paddingBottom: 40 },
    center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loadingText: { marginTop: 12, color: '#666', fontSize: 15 },
    errorText:   { color: '#C2185B', fontSize: 15, textAlign: 'center', marginBottom: 16, paddingHorizontal: 24 },
    retryBtn:    { backgroundColor: '#E91E8C', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
    retryText:   { color: '#fff', fontWeight: '600' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
    sectionTitle:  { fontSize: 16, fontWeight: '700', color: '#333' },
    sectionCount:  { fontSize: 13, color: '#999' },
    empty:       { alignItems: 'center', paddingTop: 32 },
    emptyEmoji:  { fontSize: 48, marginBottom: 12 },
    emptyText:   { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
    emptySubtext:{ fontSize: 13, color: '#999', textAlign: 'center' },
});

const cal = StyleSheet.create({
    wrapper:    { backgroundColor: '#FFF0F7', borderRadius: 16, padding: 16, marginBottom: 20 },
    header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    navBtn:     { padding: 4 },
    navText:    { fontSize: 24, color: '#E91E8C', fontWeight: '300' },
    monthTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
    dayRow:     { flexDirection: 'row', marginBottom: 4 },
    dayLabel:   { flex: 1, textAlign: 'center', fontSize: 11, color: '#999', fontWeight: '600' },
    grid:       { flexDirection: 'row', flexWrap: 'wrap' },
    cell:       { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
    dayCircle:  { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    todayCircle:{ backgroundColor: '#FFF0F7', borderWidth: 1.5, borderColor: '#E91E8C' },
    cycleCircle:{ backgroundColor: '#E91E8C' },
    dayText:    { fontSize: 13, color: '#333' },
    todayText:  { color: '#E91E8C', fontWeight: '700' },
    cycleText:  { color: '#fff', fontWeight: '700' },
    legend:     { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    legendDot:  { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
    legendLabel:{ fontSize: 11, color: '#666' },
});

const card = StyleSheet.create({
    container: { backgroundColor: '#FAFAFA', borderRadius: 12, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: '#F0E0EA' },
    header:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
    badge:     { backgroundColor: '#E91E8C', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
    date:      { fontSize: 14, fontWeight: '600', color: '#333' },
    length:    { fontSize: 12, color: '#999', marginTop: 2 },
    chevron:   { color: '#E91E8C', fontSize: 12 },
    details:   { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0E0EA', paddingTop: 12, gap: 8 },
    row:       { flexDirection: 'row', justifyContent: 'space-between' },
    rowLabel:  { fontSize: 13, color: '#666' },
    rowValue:  { fontSize: 13, fontWeight: '600', color: '#333' },
});
