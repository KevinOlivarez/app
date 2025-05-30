import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import {
  Calendar,
  User,
  House,
  FilePlusIcon,
  TicketCheck,
  FileCheck,
} from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.darkGray,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 90 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Facturas',
          tabBarIcon: ({ color, size }) => (
            <FilePlusIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="redeem"
        options={{
          title: 'Canjear',
          tabBarIcon: ({ color, size }) => (
            <TicketCheck size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="invoices/redeemed"
        options={{
          title: 'Facturas Canjeadas',
          tabBarIcon: ({ color, size }) => (
            <FileCheck size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
