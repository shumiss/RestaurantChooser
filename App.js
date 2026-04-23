import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RestaurantsScreen from './src/screens/restaurants/RestaurantsScreen';
import PeopleScreen from './src/screens/people/PeopleScreen';
import DecisionScreen from './src/screens/decision/DecisionScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [people, setPeople] = useState([]);

  // 读取存储的数据
  useEffect(() => {
    const load = async () => {
      try {
        const r = await AsyncStorage.getItem('restaurants');
        const p = await AsyncStorage.getItem('people');
        if (r) setRestaurants(JSON.parse(r));
        if (p) setPeople(JSON.parse(p));
      } catch (e) {}
    };
    load();
  }, []);

  // 餐厅变化时保存
  useEffect(() => {
    AsyncStorage.setItem('restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  // 人员变化时保存
  useEffect(() => {
    AsyncStorage.setItem('people', JSON.stringify(people));
  }, [people]);

  return (
    <NavigationContainer>
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
          {() => <RestaurantsScreen restaurants={restaurants} setRestaurants={setRestaurants} />}
        </Tab.Screen>
        <Tab.Screen
          name="人员"
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text> }}
        >
          {() => <PeopleScreen people={people} setPeople={setPeople} />}
        </Tab.Screen>
        <Tab.Screen
          name="选择"
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎲</Text> }}
        >
          {() => <DecisionScreen restaurants={restaurants} people={people} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}