import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, SafeAreaView, Alert
} from 'react-native';

const COLORS = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  primary: '#1C1C1E',
  accent: '#007AFF',
  subtext: '#8E8E93',
  border: '#E5E5EA',
};

export default function PeopleScreen({ people, onCreate, onUpdate, onDelete, onClear }) {
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const add = async () => {
    const name = input.trim();
    if (!name || saving) return;

    const exists = people.some(
      p => p.name.toLowerCase() === name.toLowerCase() && p.id !== editingId
    );
    if (exists) {
      setMessage('这位成员已经在列表里了');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await onUpdate(editingId, name);
        setEditingId(null);
        setMessage('已更新成员');
      } else {
        await onCreate(name);
        setMessage('已添加成员');
      }
      setInput('');
    } catch (error) {
      console.warn('保存成员失败', error);
      setMessage('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await onDelete(id);
    if (editingId === id) {
      setEditingId(null);
      setInput('');
    }
  };

  const edit = (item) => {
    setEditingId(item.id);
    setInput(item.name);
    setMessage('正在编辑成员名称');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setInput('');
    setMessage('');
  };

  const clearAll = () => {
    if (people.length === 0) return;
    Alert.alert('清空成员', '确定要删除所有成员吗？', [
      { text: '取消', style: 'cancel' },
      { text: '清空', style: 'destructive', onPress: onClear },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.pageTitle}>人员</Text>
      <View style={styles.headerRow}>
        <Text style={styles.pageSubtitle}>{people.length} 位成员</Text>
        <TouchableOpacity onPress={clearAll} disabled={people.length === 0}>
          <Text style={[styles.clearText, people.length === 0 && styles.disabledText]}>清空</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="添加成员..."
          placeholderTextColor={COLORS.subtext}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        {editingId && (
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
            <Text style={styles.cancelBtnText}>×</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.addBtn, saving && styles.addBtnDisabled]} onPress={add} disabled={saving}>
          <Text style={styles.addBtnText}>{editingId ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </View>
      {!!message && <Text style={styles.message}>{message}</Text>}

      <FlatList
        data={people}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyText}>还没有成员，添加一位吧</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
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
  pageSubtitle: { fontSize: 15, color: COLORS.subtext, marginBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  clearText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  disabledText: { color: COLORS.border },
  inputCard: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16,
    padding: 8, marginBottom: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  input: { flex: 1, fontSize: 16, color: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8 },
  cancelBtn: {
    backgroundColor: '#F2F2F7', borderRadius: 12, marginRight: 8,
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.subtext, fontSize: 24, fontWeight: '300', lineHeight: 28 },
  addBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: COLORS.border },
  message: { color: COLORS.subtext, marginTop: -8, marginBottom: 12, fontSize: 13 },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 28 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cardTitle: { fontSize: 16, fontWeight: '500', color: COLORS.primary, flex: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F2F2F7' },
  editBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#EEF4FF' },
  deleteBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: COLORS.subtext },
});
