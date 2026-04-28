import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { logCycle } from '../../services/api';
import { session } from '../../services/session';
import { useRouter } from 'expo-router';

export default function LogCycleScreen() {
    const router = useRouter();
    const token = session.getToken();
    const name  = session.getName();

    const [lastCycleDate, setLastCycleDate] = useState('');
    const [cycleStartDate,    setCycleStartDate]    = useState('');
    const [cycleLength,       setCycleLength]       = useState('');
    const [stressLevel,       setStressLevel]       = useState('');
    const [sleepHours,        setSleepHours]        = useState('');
    const [exerciseIntensity, setExerciseIntensity] = useState('');
    const [illnessFlag,       setIllnessFlag]       = useState('0');
    const [loading,           setLoading]           = useState(false);
    const [banner,            setBanner]            = useState(null);

    const showBanner = (msg, type) => {
        setBanner({ msg, type });
        setTimeout(() => setBanner(null), 4000);
    };

    const handleLog = async () => {
        if (!cycleStartDate || !cycleLength || !stressLevel || !sleepHours || !exerciseIntensity) {
            showBanner('Please fill in all fields', 'error');
            return;
        }
        setLoading(true);
        try {
            await logCycle(token, {
                cycle_start_date:   cycleStartDate,
                cycle_length:       parseInt(cycleLength),
                stress_level:       parseInt(stressLevel),
                sleep_hours:        parseFloat(sleepHours),
                exercise_intensity: parseInt(exerciseIntensity),
                illness_flag:       parseInt(illnessFlag),
            });
            showBanner('Cycle logged! 🌸', 'success');
            setLastCycleDate(cycleStartDate);
            setCycleStartDate(''); setCycleLength(''); setStressLevel('');
            setSleepHours(''); setExerciseIntensity(''); setIllnessFlag('0');
        } catch (error) {
            const msg = error.response?.data?.detail || 'Failed to log cycle';
            showBanner(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Hello, {name || 'there'} 👋</Text>
            <Text style={styles.subtitle}>Log your cycle details</Text>

            {banner && (
                <View style={[styles.banner, banner.type === 'success' ? styles.bannerSuccess : styles.bannerError]}>
                    <Text style={styles.bannerText}>{banner.msg}</Text>
                </View>
            )}

            <Text style={styles.label}>Cycle Start Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="e.g. 2025-04-01"
                value={cycleStartDate} onChangeText={setCycleStartDate} />

            <Text style={styles.label}>Cycle Length (days)</Text>
            <TextInput style={styles.input} placeholder="e.g. 28"
                value={cycleLength} onChangeText={setCycleLength} keyboardType="numeric" />

            <Text style={styles.label}>Stress Level (1 = low, 5 = high)</Text>
            <TextInput style={styles.input} placeholder="1 to 5"
                value={stressLevel} onChangeText={setStressLevel} keyboardType="numeric" />

            <Text style={styles.label}>Sleep Hours</Text>
            <TextInput style={styles.input} placeholder="e.g. 7.5"
                value={sleepHours} onChangeText={setSleepHours} keyboardType="decimal-pad" />

            <Text style={styles.label}>Exercise Intensity (1=none, 2=moderate, 3=intense)</Text>
            <TextInput style={styles.input} placeholder="1 to 3"
                value={exerciseIntensity} onChangeText={setExerciseIntensity} keyboardType="numeric" />

            <Text style={styles.label}>Were you sick this cycle?</Text>
            <View style={styles.toggle}>
                <TouchableOpacity
                    style={[styles.toggleBtn, illnessFlag === '0' && styles.toggleActive]}
                    onPress={() => setIllnessFlag('0')}>
                    <Text style={[styles.toggleText, illnessFlag === '0' && styles.toggleActiveText]}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, illnessFlag === '1' && styles.toggleActive]}
                    onPress={() => setIllnessFlag('1')}>
                    <Text style={[styles.toggleText, illnessFlag === '1' && styles.toggleActiveText]}>Yes</Text>
                </TouchableOpacity>
            </View>

            {loading
                ? <ActivityIndicator size="large" color="#E91E8C" />
                : <TouchableOpacity style={styles.button} onPress={handleLog}>
                    <Text style={styles.buttonText}>Log Cycle</Text>
                  </TouchableOpacity>
            }

            <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#F48FB1', marginTop: 10 }]} 
                onPress={() => router.push({ 
                    pathname: '/(tabs)/prediction', 
                    params: { token, lastCycleDate: lastCycleDate } 
                })}>
                <Text style={styles.buttonText}>View Prediction</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container:        { padding: 24, backgroundColor: '#fff', paddingBottom: 40 },
    title:            { fontSize: 24, fontWeight: 'bold', color: '#E91E8C', marginBottom: 4 },
    subtitle:         { fontSize: 14, color: '#666', marginBottom: 20 },
    label:            { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
    input:            { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    button:           { backgroundColor: '#E91E8C', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
    buttonText:       { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    toggle:           { flexDirection: 'row', marginBottom: 20, gap: 8 },
    toggleBtn:        { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', borderRadius: 8 },
    toggleActive:     { backgroundColor: '#E91E8C', borderColor: '#E91E8C' },
    toggleText:       { color: '#333', fontWeight: '600' },
    toggleActiveText: { color: '#fff' },
    banner:           { borderRadius: 10, padding: 12, marginBottom: 16 },
    bannerError:      { backgroundColor: '#FFE4EF', borderLeftWidth: 4, borderLeftColor: '#F48FB1' },
    bannerSuccess:    { backgroundColor: '#E8F5E9', borderLeftWidth: 4, borderLeftColor: '#81C784' },
    bannerText:       { color: '#880E4F', fontSize: 14, fontWeight: '500' },
});
