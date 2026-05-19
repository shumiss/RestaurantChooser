import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const COLORS = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  primary: '#1C1C1E',
  accent: '#FF3B30',
  subtext: '#8E8E93',
  border: '#E5E5EA',
  green: '#34C759',
};

const CUISINES = ['任意', '中餐', '西餐', '日料', '韩餐', '快餐', '火锅', '甜品', '其他'];

export default function DecisionScreen({ restaurants, people, history, onRecordDecision, onClearHistory }) {
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [filters, setFilters] = useState({
    cuisine: '任意',
    maxPrice: 4,
    minRating: 1,
    deliveryOnly: false,
  });
  const [choice, setChoice] = useState(null);
  const [payer, setPayer] = useState(null);
  const [vetoedPeople, setVetoedPeople] = useState([]);
  const [rejectedRestaurantIds, setRejectedRestaurantIds] = useState([]);
  const [finalMessage, setFinalMessage] = useState('');

  const participants = selectedPeople
    .map(id => people.find(person => person.id === id))
    .filter(Boolean);

  const filteredRestaurants = useMemo(() => restaurants.filter(restaurant => {
    const cuisineMatches = filters.cuisine === '任意' || restaurant.cuisine === filters.cuisine;
    const priceMatches = Number(restaurant.price) <= Number(filters.maxPrice);
    const ratingMatches = Number(restaurant.rating) >= Number(filters.minRating);
    const deliveryMatches = !filters.deliveryOnly || restaurant.delivery;
    const notRejected = !rejectedRestaurantIds.includes(restaurant.id);

    return cuisineMatches && priceMatches && ratingMatches && deliveryMatches && notRejected;
  }), [restaurants, filters, rejectedRestaurantIds]);

  const canStart = restaurants.length > 0 && people.length > 0 && participants.length > 0;

  const togglePerson = (id) => {
    setSelectedPeople(current => (
      current.includes(id)
        ? current.filter(personId => personId !== id)
        : [...current, id]
    ));
    resetChoice(false);
  };

  const updateFilter = (field, value) => {
    setFilters(current => ({ ...current, [field]: value }));
    resetChoice(false);
  };

  const chooseRestaurant = async () => {
    if (!canStart || filteredRestaurants.length === 0) return;

    const randomRestaurant = filteredRestaurants[Math.floor(Math.random() * filteredRestaurants.length)];
    const randomPayer = participants.length > 0
      ? participants[Math.floor(Math.random() * participants.length)]
      : null;

    setChoice(randomRestaurant);
    setPayer(randomPayer);
    setFinalMessage('');
    await onRecordDecision({
      restaurant: randomRestaurant.name,
      person: randomPayer ? randomPayer.name : null,
    });
  };

  const veto = (personId) => {
    if (!choice || vetoedPeople.includes(personId)) return;

    const nextVetoed = [...vetoedPeople, personId];
    const nextRejected = [...rejectedRestaurantIds, choice.id];
    setVetoedPeople(nextVetoed);
    setRejectedRestaurantIds(nextRejected);

    const remaining = restaurants.filter(restaurant => {
      const cuisineMatches = filters.cuisine === '任意' || restaurant.cuisine === filters.cuisine;
      const priceMatches = Number(restaurant.price) <= Number(filters.maxPrice);
      const ratingMatches = Number(restaurant.rating) >= Number(filters.minRating);
      const deliveryMatches = !filters.deliveryOnly || restaurant.delivery;
      return cuisineMatches && priceMatches && ratingMatches && deliveryMatches && !nextRejected.includes(restaurant.id);
    });

    if (nextVetoed.length >= participants.length || remaining.length === 0) {
      setFinalMessage('所有 veto 已用完，当前选择就是最终结果。');
      return;
    }

    setChoice(null);
    setPayer(null);
    setFinalMessage('已记录 veto，请重新随机选择。');
  };

  const acceptChoice = () => {
    if (!choice) return;
    setFinalMessage(`最终决定：${choice.name}`);
  };

  const resetChoice = (resetFilters = true) => {
    setChoice(null);
    setPayer(null);
    setVetoedPeople([]);
    setRejectedRestaurantIds([]);
    setFinalMessage('');
    if (resetFilters) {
      setFilters({
        cuisine: '任意',
        maxPrice: 4,
        minRating: 1,
        deliveryOnly: false,
      });
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>今天去哪吃</Text>
        <Text style={styles.pageSubtitle}>选择参与者，设置筛选，然后随机决定</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. 谁一起吃</Text>
            <Text style={styles.sectionMeta}>{participants.length}/{people.length}</Text>
          </View>
          {people.length === 0 ? (
            <Text style={styles.emptyText}>请先在人员页面添加成员</Text>
          ) : (
            <View style={styles.chipWrap}>
              {people.map(person => {
                const active = selectedPeople.includes(person.id);
                return (
                  <TouchableOpacity
                    key={person.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => togglePerson(person.id)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{person.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. 预筛选</Text>
            <Text style={styles.sectionMeta}>{filteredRestaurants.length} 家可选</Text>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.pickerBox}>
              <Text style={styles.fieldLabel}>菜系</Text>
              <Picker
                selectedValue={filters.cuisine}
                onValueChange={value => updateFilter('cuisine', value)}
                style={styles.picker}
              >
                {CUISINES.map(cuisine => (
                  <Picker.Item key={cuisine} label={cuisine} value={cuisine} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerBox}>
              <Text style={styles.fieldLabel}>最高价格</Text>
              <Picker
                selectedValue={filters.maxPrice}
                onValueChange={value => updateFilter('maxPrice', Number(value))}
                style={styles.picker}
              >
                {[1, 2, 3, 4].map(price => (
                  <Picker.Item key={price} label={'¥'.repeat(price)} value={price} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.pickerBox}>
              <Text style={styles.fieldLabel}>最低评分</Text>
              <Picker
                selectedValue={filters.minRating}
                onValueChange={value => updateFilter('minRating', Number(value))}
                style={styles.picker}
              >
                {[1, 2, 3, 4, 5].map(rating => (
                  <Picker.Item key={rating} label={`${rating} 星`} value={rating} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={[styles.deliveryToggle, filters.deliveryOnly && styles.deliveryToggleActive]}
              onPress={() => updateFilter('deliveryOnly', !filters.deliveryOnly)}
            >
              <Text style={[styles.deliveryText, filters.deliveryOnly && styles.deliveryTextActive]}>
                {filters.deliveryOnly ? '只看外卖' : '不限外卖'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.choiceCard}>
          {!canStart ? (
            <>
              <Text style={styles.icon}>🍽</Text>
              <Text style={styles.hint}>
                {restaurants.length === 0
                  ? '请先添加餐厅'
                  : people.length === 0
                    ? '请先添加成员'
                    : '请选择至少一位参与者'}
              </Text>
            </>
          ) : choice ? (
            <>
              <Text style={styles.icon}>🎉</Text>
              <Text style={styles.resultLabel}>本轮推荐</Text>
              <Text style={styles.resultText}>{choice.name}</Text>
              <Text style={styles.resultMeta}>
                {choice.cuisine} · {'¥'.repeat(choice.price)} · {'★'.repeat(choice.rating)}
                {choice.delivery ? ' · 外卖' : ''}
              </Text>
              {payer && (
                <View style={styles.personBadge}>
                  <Text style={styles.personText}>👤 {payer.name} 来买单</Text>
                </View>
              )}
              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.acceptBtn} onPress={acceptChoice}>
                  <Text style={styles.acceptBtnText}>接受</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetBtn} onPress={() => resetChoice(false)}>
                  <Text style={styles.resetBtnText}>重来</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.vetoTitle}>Veto</Text>
              <View style={styles.chipWrap}>
                {participants.map(person => {
                  const used = vetoedPeople.includes(person.id);
                  return (
                    <TouchableOpacity
                      key={person.id}
                      style={[styles.vetoChip, used && styles.vetoChipUsed]}
                      onPress={() => veto(person.id)}
                      disabled={used || !!finalMessage.startsWith('最终决定')}
                    >
                      <Text style={[styles.vetoChipText, used && styles.vetoChipTextUsed]}>
                        {person.name}{used ? ' 已用' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.icon}>🎲</Text>
              <Text style={styles.hint}>
                {filteredRestaurants.length === 0
                  ? '没有餐厅符合当前筛选条件'
                  : `从 ${filteredRestaurants.length} 家餐厅中随机选择`}
              </Text>
              <TouchableOpacity
                style={[styles.pickBtn, filteredRestaurants.length === 0 && styles.pickBtnDisabled]}
                onPress={chooseRestaurant}
                disabled={filteredRestaurants.length === 0}
              >
                <Text style={styles.pickBtnText}>随机选择</Text>
              </TouchableOpacity>
            </>
          )}
          {!!finalMessage && <Text style={styles.finalMessage}>{finalMessage}</Text>}
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
              <Text style={styles.historyRestaurant}>{item.restaurant}</Text>
              <Text style={styles.historyMeta}>
                {item.person ? `${item.person} 买单 · ` : ''}{item.createdAtLabel}
              </Text>
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
  pageSubtitle: { fontSize: 15, color: COLORS.subtext, marginBottom: 18 },
  section: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 14, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  sectionMeta: { color: COLORS.subtext, fontSize: 13, fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FAFAFA',
  },
  chipActive: { backgroundColor: '#FFF0EE', borderColor: COLORS.accent },
  chipText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: COLORS.accent },
  fieldRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  pickerBox: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, overflow: 'hidden', backgroundColor: '#FAFAFA',
  },
  fieldLabel: { color: COLORS.subtext, fontSize: 12, marginLeft: 12, marginTop: 8 },
  picker: { minHeight: 42 },
  deliveryToggle: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA',
    minHeight: 64,
  },
  deliveryToggleActive: { backgroundColor: '#FFF0EE', borderColor: COLORS.accent },
  deliveryText: { color: COLORS.subtext, fontSize: 14, fontWeight: '700' },
  deliveryTextActive: { color: COLORS.accent },
  choiceCard: {
    backgroundColor: COLORS.card, borderRadius: 24, padding: 28,
    alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
    shadowRadius: 16, elevation: 5,
  },
  icon: { fontSize: 56, marginBottom: 16 },
  hint: { fontSize: 15, color: COLORS.subtext, textAlign: 'center', marginBottom: 16 },
  emptyText: { color: COLORS.subtext, fontSize: 14 },
  pickBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16,
    paddingHorizontal: 40, paddingVertical: 16, marginTop: 4,
  },
  pickBtnDisabled: { backgroundColor: COLORS.border },
  pickBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resultLabel: { fontSize: 15, color: COLORS.subtext, marginBottom: 8 },
  resultText: { fontSize: 30, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },
  resultMeta: { color: COLORS.subtext, fontSize: 13, marginTop: 6, marginBottom: 16 },
  personBadge: {
    backgroundColor: '#F2F2F7', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8, marginBottom: 18,
  },
  personText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  resultActions: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  acceptBtn: { backgroundColor: COLORS.green, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12 },
  acceptBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resetBtn: {
    borderWidth: 1.5, borderColor: COLORS.accent,
    borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12,
  },
  resetBtnText: { color: COLORS.accent, fontSize: 16, fontWeight: '700' },
  vetoTitle: { color: COLORS.primary, fontSize: 15, fontWeight: '700', alignSelf: 'flex-start', marginBottom: 8 },
  vetoChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: COLORS.accent, backgroundColor: '#FFF0EE',
  },
  vetoChipUsed: { borderColor: COLORS.border, backgroundColor: '#F2F2F7' },
  vetoChipText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  vetoChipTextUsed: { color: COLORS.subtext },
  finalMessage: { marginTop: 16, color: COLORS.primary, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  historyHeader: {
    marginTop: 28, marginBottom: 12, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
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
