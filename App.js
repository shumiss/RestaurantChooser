import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import RestaurantsScreen from './src/screens/restaurants/RestaurantsScreen';
import PeopleScreen from './src/screens/people/PeopleScreen';
import DecisionScreen from './src/screens/decision/DecisionScreen';
import {
  addDecisionHistory,
  addPerson,
  addRestaurant,
  clearDecisionHistory,
  clearPeople,
  clearRestaurants,
  deletePerson,
  deleteRestaurant,
  getDecisionHistory,
  getPeople,
  getRestaurants,
  initDatabase,
  updatePerson,
  updateRestaurant,
} from './src/storage/database';

const Tab = createBottomTabNavigator();

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [people, setPeople] = useState([]);
  const [history, setHistory] = useState([]);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setStorageError(null);
      await initDatabase();
      const [restaurantRows, peopleRows, historyRows] = await Promise.all([
        getRestaurants(),
        getPeople(),
        getDecisionHistory(),
      ]);
      setRestaurants(restaurantRows);
      setPeople(peopleRows);
      setHistory(historyRows);
    } catch (error) {
      console.warn('读取 SQLite 数据失败', error);
      setStorageError('本地数据库读取失败，请重新打开应用。');
    } finally {
      setStorageReady(true);
    }
  };

  const refreshRestaurants = async () => {
    setRestaurants(await getRestaurants());
  };

  const refreshPeople = async () => {
    setPeople(await getPeople());
  };

  const refreshHistory = async () => {
    setHistory(await getDecisionHistory());
  };

  const createRestaurant = async (restaurant) => {
    await addRestaurant(restaurant);
    await refreshRestaurants();
  };

  const renameRestaurant = async (id, restaurant) => {
    await updateRestaurant(id, restaurant);
    await refreshRestaurants();
  };

  const removeRestaurant = async (id) => {
    await deleteRestaurant(id);
    await refreshRestaurants();
  };

  const removeAllRestaurants = async () => {
    await clearRestaurants();
    await refreshRestaurants();
  };

  const createPerson = async (name) => {
    await addPerson(name);
    await refreshPeople();
  };

  const renamePerson = async (id, name) => {
    await updatePerson(id, name);
    await refreshPeople();
  };

  const removePerson = async (id) => {
    await deletePerson(id);
    await refreshPeople();
  };

  const removeAllPeople = async () => {
    await clearPeople();
    await refreshPeople();
  };

  const recordDecision = async (item) => {
    await addDecisionHistory(item);
    await refreshHistory();
  };

  const removeAllHistory = async () => {
    await clearDecisionHistory();
    await refreshHistory();
  };

  if (!storageReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF3B30" />
        <Text style={styles.loadingText}>正在读取本地数据库...</Text>
      </View>
    );
  }

  if (storageError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{storageError}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E5EA',
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarActiveTintColor: '#FF3B30',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="餐厅"
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🍜</Text> }}
        >
          {() => (
            <RestaurantsScreen
              restaurants={restaurants}
              onCreate={createRestaurant}
              onUpdate={renameRestaurant}
              onDelete={removeRestaurant}
              onClear={removeAllRestaurants}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="人员"
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text> }}
        >
          {() => (
            <PeopleScreen
              people={people}
              onCreate={createPerson}
              onUpdate={renamePerson}
              onDelete={removePerson}
              onClear={removeAllPeople}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="选择"
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎲</Text> }}
        >
          {() => (
            <DecisionScreen
              restaurants={restaurants}
              people={people}
              history={history}
              onRecordDecision={recordDecision}
              onClearHistory={removeAllHistory}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#8E8E93',
    fontSize: 15,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
