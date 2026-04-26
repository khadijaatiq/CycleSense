import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert
} from 'react-native';
// 1. Import Expo Router hooks
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getPrediction } from '../../services/api';

export default function PredictionScreen() {
    // 2. Initialize router and params
    const router = useRouter();
    const params = useLocalSearchParams<{ token: string }>();
    const token = params.token || '';

    const [prediction, setPrediction] = useState<any>(null);
    const [loading,    setLoading]    = useState(true);

    useEffect(() => {
        if (token) {
            fetchPrediction();
        } else {
            setLoading(false);
            Alert.alert("Error", "No session token found. Please login again.");
        }
    }, [token]);

    const fetchPrediction = async () => {
        setLoading(true);
        try {
            const data = await getPrediction(token);
            setPrediction(data);
        } catch (error: any) {
            const msg = error.response?.data?.detail || 'Could not get prediction';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#E91E8C" />
                <Text style={styles.loadingText}>Getting your prediction...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Prediction 🌸</Text>

            {prediction && (
                <>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Next cycle in</Text>
                        <Text style={styles.days}>{prediction.predicted_days}</Text>
                        <Text style={styles.daysLabel}>days</Text>
                        <Text style={styles.confidence}>
                            ± {prediction.confidence_range} days confidence range
                        </Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            Cycles logged: {prediction.cycles_logged}
                        </Text>
                        <Text style={styles.infoText}>
                            Method: {prediction.method}
                        </Text>
                        {!prediction.reliable &&
                            <Text style={styles.warning}>
                                ⚠ Log at least 3 cycles for a reliable ML prediction
                            </Text>
                        }
                    </View>
                </>
            )}

            <TouchableOpacity style={styles.button} onPress={fetchPrediction}>
                <Text style={styles.buttonText}>Refresh Prediction</Text>
            </TouchableOpacity>

            {/* 3. Navigation back to the Home/Log screen */}
            <TouchableOpacity style={styles.backBtn}
                onPress={() => router.push({ pathname: '/(tabs)/home', params: { token } })}>
                <Text style={styles.backText}>← Log Another Cycle</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container:    { flex: 1, padding: 24, backgroundColor: '#fff' },
    center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText:  { marginTop: 12, color: '#666', fontSize: 16 },
    title:        { fontSize: 28, fontWeight: 'bold', color: '#E91E8C', textAlign: 'center', marginBottom: 32 },
    card:         { backgroundColor: '#FFF0F7', borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 24 },
    cardLabel:    { fontSize: 16, color: '#666', marginBottom: 8 },
    days:         { fontSize: 72, fontWeight: 'bold', color: '#E91E8C' },
    daysLabel:    { fontSize: 20, color: '#E91E8C', marginBottom: 8 },
    confidence:   { fontSize: 14, color: '#999' },
    infoBox:      { backgroundColor: '#F9F9F9', borderRadius: 8, padding: 16, marginBottom: 24 },
    infoText:     { fontSize: 14, color: '#555', marginBottom: 4 },
    warning:      { fontSize: 13, color: '#E67E22', marginTop: 8 },
    button:       { backgroundColor: '#E91E8C', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
    buttonText:   { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    backBtn:      { alignItems: 'center', padding: 12 },
    backText:     { color: '#E91E8C', fontSize: 16 }
});
