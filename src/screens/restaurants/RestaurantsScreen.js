import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, SafeAreaView
} from 'react-native';

const COLORS = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  primary: '#1C1C1E',
  accent: '#FF3B30',
  subtext: '#8E8E93',
  border: '#E5E5EA',
};

export default function RestaurantsScreen({ restaurants, setRestaurants }) {
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    setRestaurants([...restaurants, { id: Date.now().toString(), name: input.trim() }]);
    setInput('');
  };

  const remove = (id) => {
    setRestaurants(restaurants.filter(r => r.id !== id));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.pageTitle}>餐厅</Text>
      <Text style={styles.pageSubtitle}>{restaurants.length} 家餐厅</Text>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="添加新餐厅..."
          placeholderTextColor={COLORS.subtext}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={add}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={restaurants}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍽</Text>
            <Text style={styles.emptyText}>还没有餐厅，添加一家吧</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
            <TouchableOpacity onPress={() => remove(item.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>删除</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20, paddingTop: 20 },
  pageTitle: { fontSize: 34, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  pageSubtitle: { fontSize: 15, color: COLORS.subtext, marginBottom: 24 },
  inputCard: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16,
    padding: 8, marginBottom: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  input: { flex: 1, fontSize: 16, color: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8 },
  addBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 28 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  indexBadge: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  indexText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardTitle: { fontSize: 16, fontWeight: '500', color: COLORS.primary },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFF0EE' },
  deleteBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: COLORS.subtext },
});