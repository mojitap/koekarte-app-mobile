import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);
  const [canUsePremium, setCanUsePremium] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetch('http://192.168.0.16:5000/api/profile', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          const ok = checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended);
          setCanUsePremium(ok);

          const created = new Date(data.created_at);
          const today = new Date();
          const diff = Math.floor((today - created) / (1000 * 60 * 60 * 24));
          setRemainingDays(5 - diff);
        })
        .catch(err => {
          console.error("\u274c \u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u53d6\u5f97\u5931\u6557:", err);
        });
    }, [])
  );

  if (!profile) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>\ud83e\udd35\ufe0f \u30de\u30a4\u30da\u30fc\u30b8</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>\ud83d\udce7 \u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9:</Text>
        <Text>{profile.email}</Text>

        <Text style={styles.label}>\u767b\u9332\u65e5:</Text>
        <Text>{profile.created_at?.slice(0, 10)}</Text>
      </View>

      <View style={styles.statusBox}>
        {canUsePremium ? (
          <Text style={{ color: 'green' }}>\u2705 \u5229\u7528\u53ef\u80fd\u3067\u3059\uff08\u7121\u6599 or \u6709\u6599\uff09</Text>
        ) : (
          <Text style={{ color: 'red' }}>\u203c\ufe0f \u5229\u7528\u5236\u9650\u4e2d\uff08\u7121\u6599\u671f\u9593\u7d42\u4e86\uff09</Text>
        )}
      </View>

      {/* \u203c\ufe0f \u3053\u3053\u304b\u3089\u4ed6\u753b\u9762\u306b\u79fb\u52d5 */}
      <View style={{ marginTop: 20 }}>
        <Button title="\u9332\u97f3" onPress={() => navigation.navigate('Record')} />
        <Button title="\u30b0\u30e9\u30d5" onPress={() => navigation.navigate('Chart')} />
        <Button title="\u30b9\u30b3\u30a2\u5c65\u6b74" onPress={() => navigation.navigate('History')} />
        <Button title="\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u7de8\u96c6" onPress={() => navigation.navigate('EditProfile')} />
        <Button title="\u5229\u7528\u898f\u7d04" onPress={() => navigation.navigate('Terms')} />
        <Button title="\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc\u30dd\u30ea\u30b7\u30fc" onPress={() => navigation.navigate('Privacy')} />
        <Button title="\u7279\u5b9a\u5546\u53d6\u6cd5" onPress={() => navigation.navigate('Legal')} />
        <Button title="\u97f3\u6e90" onPress={() => navigation.navigate('Music')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoBox: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  statusBox: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
});
