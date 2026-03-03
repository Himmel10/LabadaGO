import React from 'react';
import { Tabs } from 'expo-router';
import { House, Users, ShoppingBag, MessageCircleWarning, Bike } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.borderLight,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <House size={size} color={color} /> }} />
      <Tabs.Screen name="riders" options={{ title: 'Riders', tabBarIcon: ({ color, size }) => <Bike size={size} color={color} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} /> }} />
      <Tabs.Screen name="users" options={{ title: 'Users', tabBarIcon: ({ color, size }) => <Users size={size} color={color} /> }} />
      <Tabs.Screen name="complaints" options={{ title: 'Complaints', tabBarIcon: ({ color, size }) => <MessageCircleWarning size={size} color={color} /> }} />
    </Tabs>
  );
}
