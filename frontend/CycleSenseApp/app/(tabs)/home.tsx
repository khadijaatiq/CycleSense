import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
// 1. Import Expo Router hooks
import { useRouter, useLocalSearchParams } from 'expo-router';
import { logCycle } from '../../services/api';

export default function LogCycleScreen() {
    // 2. Use hooks instead of props
    const router = useRouter();
    const params = useLocalSearchParams<{ token: string; name: string }>();
    
    // Safely extract params with fallbacks
    const token = params.token || '';
    const name = params.name || 'User';

    const [cycleStartDate,    setCycleStartDate]    = useState('');
    const [cycleLength,       setCycleLength]       = useState('');
    const [stressLevel,       setStressLevel]       = useState('');
    const [sleepHours,        setSleepHours]        = useState('');
    const [exerciseIntensity, setExerciseIntensity] = useState('');
    const [illnesFlag,        setIllnessFlag]       = useState('0');
    const [loading,           setLoading]           = useState(false);

    const handleLog = async () => {
        if (!cycleStartDate || !cycleLength || !stressLevel || !sleepHours || !exerciseIntensity) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (parseInt(stressLevel) < 1 || parseInt(stressLevel) > 5) {
            Alert.alert('Error', 'Stress level must be between 1 and 5');
            return;
        }
        if (parseInt(exerciseIntensity) < 1 || parseInt(exerciseIntensity) > 3) {
            Alert.alert('Error', 'Exercise intensity must be between 1 and 3');
            return;
        }

        setLoading(true);
        try {
            await logCycle(token, {
                cycle_start_date:    cycleStartDate,
                cycle_length:        parseInt(cycleLength),
                stress_level:        parseInt(stressLevel),
                sleep_hours:         parseFloat(sleepHours),
                exercise_intensity:  parseInt(exerciseIntensity),
                illness_flag:        parseInt(illnesFlag)
            });

            Alert.alert('Success', 'Cycle logged successfully!');
            setCycleStartDate('');
            setCycleLength('');
            setStressLevel('');
            setSleepHours('');
            setExerciseIntensity('');
            setIllnessFlag('0');
        } catch (error: any) {
            const msg = error.response?.data?.detail || 'Failed to log cycle';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Hello, {name} 👋</Text>
            <Text style={styles.subtitle}>Log your cycle details</Text>

            <Text style={styles.label}>Cycle Start Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="e.g. 2024-03-01"
                value={cycleStartDate} onChangeText={setCycleStartDate} />

            <Text style={styles.label}>Cycle Length (days)</Text>
            <TextInput style={styles.input} placeholder="e.g. 28"
                value={cycleLength} onChangeText={setCycleLength} keyboardType="numeric" />

            <Text style={styles.label}>Stress Level (1=low, 5=high)</Text>
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
                    style={[styles.toggleBtn, illnesFlag === '0' && styles.toggleActive]}
                    onPress={() => setIllnessFlag('0')}>
                    <Text style={styles.toggleText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, illnesFlag === '1' && styles.toggleActive]}
                    onPress={() => setIllnessFlag('1')}>
                    <Text style={styles.toggleText}>Yes</Text>
                </TouchableOpacity>
            </View>

            {loading
                ? <ActivityIndicator size="large" color="#E91E8C" />
                : <TouchableOpacity style={styles.button} onPress={handleLog}>
                    <Text style={styles.buttonText}>Log Cycle</Text>
                  </TouchableOpacity>
            }

            {/* 3. Update navigation call */}
            <TouchableOpacity style={styles.predictBtn}
                onPress={() => router.push({ 
                    pathname: '/prediction', 
                    params: { token } 
                })}>
                <Text style={styles.predictText}>View Prediction →</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container:    { padding: 24, backgroundColor: '#fff' },
    title:        { fontSize: 24, fontWeight: 'bold', color: '#E91E8C', marginBottom: 4 },
    subtitle:     { fontSize: 14, color: '#666', marginBottom: 24 },
    label:        { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
    input:        { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    button:       { backgroundColor: '#E91E8C', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
    buttonText:   { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    predictBtn:   { alignItems: 'center', padding: 12 },
    predictText:  { color: '#E91E8C', fontSize: 16 },
    toggle:       { flexDirection: 'row', marginBottom: 16 },
    toggleBtn:    { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', borderRadius: 8, marginRight: 8 },
    toggleActive: { backgroundColor: '#E91E8C', borderColor: '#E91E8C' },
    toggleText:   { color: '#333', fontWeight: '600' }
});
