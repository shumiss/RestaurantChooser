import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, SafeAreaView, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const COLORS = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  primary: '#1C1C1E',
  accent: '#FF3B30',
  subtext: '#8E8E93',
  border: '#E5E5EA',
};

const CUISINES = ['中餐', '西餐', '日料', '韩餐', '快餐', '火锅', '甜品', '其他'];
const DEFAULT_FORM = {
  name: '',
  cuisine: '其他',
  price: 2,
  rating: 3,
  delivery: false,
};

export default function RestaurantsScreen({ restaurants, onCreate, onUpdate, onDelete, onClear }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const updateForm = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    if (message) setMessage('');
  };

  const save = async () => {
    const name = form.name.trim();
    if (saving) return;
    if (!name) {
      setMessage('请先输入餐厅名称');
      return;
    }

    const exists = restaurants.some(
      restaurant => restaurant.name.toLowerCase() === name.toLowerCase() && restaurant.id !== editingId
    );
    if (exists) {
      setMessage('这家餐厅已经在列表里了');
      return;
    }

    const payload = { ...form, name };

    try {
      setSaving(true);
      if (editingId) {
        await onUpdate(editingId, payload);
        setEditingId(null);
        setMessage('已更新餐厅');
      } else {
        await onCreate(payload);
        setMessage('已添加餐厅');
      }
      setForm(DEFAULT_FORM);
    } catch (error) {
      console.warn('保存餐厅失败', error);
      setMessage('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await onDelete(id);
      if (editingId === id) {
        cancelEdit();
      }
      setMessage('已删除餐厅');
    } catch (error) {
      console.warn('删除餐厅失败', error);
      setMessage('删除失败，请稍后重试');
    }
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      cuisine: item.cuisine || '其他',
      price: Number(item.price || 2),
      rating: Number(item.rating || 3),
      delivery: Boolean(item.delivery),
    });
    setMessage('正在编辑餐厅信息');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setMessage('');
  };

  const clearAll = () => {
    if (restaurants.length === 0) return;
    Alert.alert('清空餐厅', '确定要删除所有餐厅吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: async () => {
          await onClear();
          cancelEdit();
          setMessage('已清空餐厅');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.pageTitle}>餐厅</Text>
      <View style={styles.headerRow}>
        <Text style={styles.pageSubtitle}>{restaurants.length} 家餐厅</Text>
        <TouchableOpacity onPress={clearAll} disabled={restaurants.length === 0}>
          <Text style={[styles.clearText, restaurants.length === 0 && styles.disabledText]}>清空</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="餐厅名称"
          placeholderTextColor={COLORS.subtext}
          value={form.name}
          onChangeText={value => updateForm('name', value)}
          onSubmitEditing={save}
          returnKeyType="done"
        />

        <View style={styles.fieldRow}>
          <View style={styles.pickerBox}>
            <Text style={styles.fieldLabel}>菜系</Text>
            <Picker
              selectedValue={form.cuisine}
              onValueChange={value => updateForm('cuisine', value)}
              style={styles.picker}
            >
              {CUISINES.map(cuisine => (
                <Picker.Item key={cuisine} label={cuisine} value={cuisine} />
              ))}
            </Picker>
          </View>
          <View style={styles.pickerBox}>
            <Text style={styles.fieldLabel}>价格</Text>
            <Picker
              selectedValue={form.price}
              onValueChange={value => updateForm('price', Number(value))}
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
            <Text style={styles.fieldLabel}>评分</Text>
            <Picker
              selectedValue={form.rating}
              onValueChange={value => updateForm('rating', Number(value))}
              style={styles.picker}
            >
              {[1, 2, 3, 4, 5].map(rating => (
                <Picker.Item key={rating} label={`${rating} 星`} value={rating} />
              ))}
            </Picker>
          </View>
          <TouchableOpacity
            style={[styles.deliveryToggle, form.delivery && styles.deliveryToggleActive]}
            onPress={() => updateForm('delivery', !form.delivery)}
          >
            <Text style={[styles.deliveryText, form.delivery && styles.deliveryTextActive]}>
              {form.delivery ? '支持外卖' : '不支持外卖'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formActions}>
          {editingId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
              <Text style={styles.cancelBtnText}>取消</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={save} disabled={saving}>
            <Text style={styles.saveBtnText}>{editingId ? '保存修改' : '添加餐厅'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!!message && <Text style={styles.message}>{message}</Text>}

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
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardMeta}>
                  {item.cuisine} · {'¥'.repeat(item.price)} · {'★'.repeat(item.rating)}
                  {item.delivery ? ' · 外卖' : ''}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => edit(item)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>编辑</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>删除</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20, paddingTop: 20 },
  pageTitle: { fontSize: 34, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  pageSubtitle: { fontSize: 15, color: COLORS.subtext, marginBottom: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  clearText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  disabledText: { color: COLORS.border },
  formCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 12, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  input: {
    fontSize: 16, color: COLORS.primary, paddingHorizontal: 12,
    paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, marginBottom: 10,
  },
  fieldRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'stretch' },
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
  deliveryText: { color: COLORS.subtext, fontSize: 14, fontWeight: '600' },
  deliveryTextActive: { color: COLORS.accent },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: {
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#F2F2F7',
  },
  cancelBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  saveBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 12,
  },
  saveBtnDisabled: { backgroundColor: COLORS.border },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  message: { color: COLORS.subtext, marginTop: -4, marginBottom: 12, fontSize: 13 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  indexBadge: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  indexText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 3 },
  cardMeta: { fontSize: 12, color: COLORS.subtext },
  actions: { flexDirection: 'row', gap: 8 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F2F2F7' },
  editBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFF0EE' },
  deleteBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: COLORS.subtext },
});
