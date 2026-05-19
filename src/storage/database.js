import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'restaurant_chooser.db';
const MIGRATION_KEY = 'sqliteMigrationDone';

let databasePromise;

const now = () => new Date().toISOString();

export async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return databasePromise;
}

export async function initDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS decision_history (
      id TEXT PRIMARY KEY NOT NULL,
      restaurant TEXT NOT NULL,
      person TEXT,
      created_at TEXT NOT NULL
    );
  `);

  await migrateAsyncStorageData(db);
}

async function migrateAsyncStorageData(db) {
  const alreadyMigrated = await AsyncStorage.getItem(MIGRATION_KEY);
  if (alreadyMigrated === 'true') return;

  const [restaurantsRaw, peopleRaw, historyRaw] = await Promise.all([
    AsyncStorage.getItem('restaurants'),
    AsyncStorage.getItem('people'),
    AsyncStorage.getItem('history'),
  ]);

  await insertLegacyItems(db, 'restaurants', restaurantsRaw);
  await insertLegacyItems(db, 'people', peopleRaw);
  await insertLegacyHistory(db, historyRaw);

  await AsyncStorage.setItem(MIGRATION_KEY, 'true');
}

async function insertLegacyItems(db, tableName, rawValue) {
  if (!rawValue) return;

  try {
    const items = JSON.parse(rawValue);
    if (!Array.isArray(items)) return;

    for (const item of items) {
      if (!item?.id || !item?.name) continue;
      await db.runAsync(
        `INSERT OR IGNORE INTO ${tableName} (id, name, created_at) VALUES (?, ?, ?)`,
        item.id,
        item.name,
        now()
      );
    }
  } catch (error) {
    console.warn(`迁移 ${tableName} 失败`, error);
  }
}

async function insertLegacyHistory(db, rawValue) {
  if (!rawValue) return;

  try {
    const items = JSON.parse(rawValue);
    if (!Array.isArray(items)) return;

    for (const item of items) {
      if (!item?.id || !item?.restaurant) continue;
      await db.runAsync(
        'INSERT OR IGNORE INTO decision_history (id, restaurant, person, created_at) VALUES (?, ?, ?, ?)',
        item.id,
        item.restaurant,
        item.person ?? null,
        item.createdAt ?? now()
      );
    }
  } catch (error) {
    console.warn('迁移选择历史失败', error);
  }
}

export async function getRestaurants() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT id, name FROM restaurants ORDER BY created_at ASC');
}

export async function addRestaurant(name) {
  const db = await getDatabase();
  const id = Date.now().toString();
  await db.runAsync(
    'INSERT INTO restaurants (id, name, created_at) VALUES (?, ?, ?)',
    id,
    name,
    now()
  );
  return { id, name };
}

export async function updateRestaurant(id, name) {
  const db = await getDatabase();
  await db.runAsync('UPDATE restaurants SET name = ? WHERE id = ?', name, id);
}

export async function deleteRestaurant(id) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM restaurants WHERE id = ?', id);
}

export async function clearRestaurants() {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM restaurants');
}

export async function getPeople() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT id, name FROM people ORDER BY created_at ASC');
}

export async function addPerson(name) {
  const db = await getDatabase();
  const id = Date.now().toString();
  await db.runAsync(
    'INSERT INTO people (id, name, created_at) VALUES (?, ?, ?)',
    id,
    name,
    now()
  );
  return { id, name };
}

export async function updatePerson(id, name) {
  const db = await getDatabase();
  await db.runAsync('UPDATE people SET name = ? WHERE id = ?', name, id);
}

export async function deletePerson(id) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM people WHERE id = ?', id);
}

export async function clearPeople() {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM people');
}

export async function getDecisionHistory() {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    'SELECT id, restaurant, person, created_at AS createdAt FROM decision_history ORDER BY created_at DESC LIMIT 20'
  );
  return rows.map(row => ({
    ...row,
    createdAtLabel: formatHistoryDate(row.createdAt),
  }));
}

export async function addDecisionHistory({ restaurant, person }) {
  const db = await getDatabase();
  const id = Date.now().toString();
  await db.runAsync(
    'INSERT INTO decision_history (id, restaurant, person, created_at) VALUES (?, ?, ?, ?)',
    id,
    restaurant,
    person,
    now()
  );
  await db.runAsync(`
    DELETE FROM decision_history
    WHERE id NOT IN (
      SELECT id FROM decision_history ORDER BY created_at DESC LIMIT 20
    )
  `);
}

export async function clearDecisionHistory() {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM decision_history');
}

function formatHistoryDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
