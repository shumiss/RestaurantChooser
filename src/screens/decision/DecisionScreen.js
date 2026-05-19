import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView
} from 'react-native';

const COLORS = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  primary: '#1C1C1E',
  accent: '#FF3B30',
  subtext: '#8E8E93',
  border: '#E5E5EA',
  green: '#34C759',
};

export default function DecisionScreen({ restaurants, people, history, onRecordDecision, onClearHistory }) {
  const [result, setResult] = useState(null);
  const [person, setPerson] = useState(null);
  const [picked, setPicked] = useState(false);

  const pick = async () => {
    if (restaurants.length === 0) return;
    const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    const randomPerson = people.length > 0
      ? people[Math.floor(Math.random() * people.length)]
      : null;
    setResult(randomRestaurant.name);
    setPerson(randomPerson ? randomPerson.name : null);
    setPicked(true);
    await onRecordDecision({
      restaurant: randomRestaurant.name,
      person: randomPerson ? randomPerson.name : null,
    });
  };

  const reset = () => {
    setResult(null);
    setPerson(null);
    setPicked(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>今天去哪吃</Text>
        <Text style={styles.pageSubtitle}>让命运来决定</Text>

        <View style={styles.card}>
          {!picked ? (
            <>
              <Text style={styles.icon}>🎲</Text>
              <Text style={styles.hint}>
                {restaurants.length === 0
                  ? '请先在餐厅页面添加餐厅'
                  : `从 ${restaurants.length} 家餐厅中随机选择`}
              </Text>
              {people.length > 0 && (
                <Text style={styles.subHint}>{people.length} 位成员参与决策</Text>
              )}
              <TouchableOpacity
                style={[styles.pickBtn, restaurants.length === 0 && styles.pickBtnDisabled]}
                onPress={pick}
                disabled={restaurants.length === 0}
              >
                <Text style={styles.pickBtnText}>随机选择</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.icon}>🎉</Text>
              <Text style={styles.resultLabel}>今天就去</Text>
              <Text style={styles.resultText}>{result}</Text>
              {person && (
                <View style={styles.personBadge}>
                  <Text style={styles.personText}>👤 {person} 来买单</Text>
                </View>
              )}
              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.pickAgainBtn} onPress={pick}>
                  <Text style={styles.pickAgainBtnText}>再抽一次</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetBtn} onPress={reset}>
                  <Text style={styles.resetBtnText}>收起结果</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{restaurants.length}</Text>
            <Text style={styles.statLabel}>家餐厅</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{people.length}</Text>
            <Text style={styles.statLabel}>位成员</Text>
          </View>
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>最近选择</Text>
          <TouchableOpacity onPress={onClearHistory} disabled={history.length === 0}>
            <Text style={[styles.clearText, history.length === 0 && styles.disabledText]}>清空</Text>
          </TouchableOpacity>
        </View>
        {history.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryText}>还没有选择记录</Text>
          </View>
        ) : (
          history.map(item => (
            <View key={item.id} style={styles.historyItem}>
              <View>
                <Text style={styles.historyRestaurant}>{item.restaurant}</Text>
                <Text style={styles.historyMeta}>
                  {item.person ? `${item.person} 买单 · ` : ''}{item.createdAtLabel}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20, paddingTop: 20 },
  content: { paddingBottom: 24 },
  pageTitle: { fontSize: 34, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  pageSubtitle: { fontSize: 15, color: COLORS.subtext, marginBottom: 24 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 24, padding: 40,
    alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
    shadowRadius: 16, elevation: 5,
  },
  icon: { fontSize: 64, marginBottom: 20 },
  hint: { fontSize: 15, color: COLORS.subtext, textAlign: 'center', marginBottom: 8 },
  subHint: { fontSize: 13, color: COLORS.subtext, marginBottom: 24 },
  pickBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16,
    paddingHorizontal: 40, paddingVertical: 16, marginTop: 16,
  },
  pickBtnDisabled: { backgroundColor: COLORS.border },
  pickBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resultLabel: { fontSize: 15, color: COLORS.subtext, marginBottom: 8 },
  resultText: {
    fontSize: 32, fontWeight: '700', color: COLORS.primary,
    marginBottom: 20, textAlign: 'center',
  },
  personBadge: {
    backgroundColor: '#F2F2F7', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8, marginBottom: 24,
  },
  personText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  resultActions: { flexDirection: 'row', gap: 10 },
  pickAgainBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14,
  },
  pickAgainBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resetBtn: {
    borderWidth: 1.5, borderColor: COLORS.accent,
    borderRadius: 16, paddingHorizontal: 32, paddingVertical: 14,
  },
  resetBtnText: { color: COLORS.accent, fontSize: 16, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 16,
    padding: 20, alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04,
    shadowRadius: 6, elevation: 2,
  },
  statNumber: { fontSize: 28, fontWeight: '700', color: COLORS.accent },
  statLabel: { fontSize: 13, color: COLORS.subtext, marginTop: 4 },
  historyHeader: {
    marginTop: 28, marginBottom: 12, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  clearText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  disabledText: { color: COLORS.border },
  emptyHistory: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 16,
    padding: 20, alignItems: 'center',
  },
  emptyHistoryText: { color: COLORS.subtext, fontSize: 14 },
  historyItem: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  historyRestaurant: { color: COLORS.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  historyMeta: { color: COLORS.subtext, fontSize: 13 },
});
