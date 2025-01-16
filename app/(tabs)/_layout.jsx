import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

  export default function TabLayout() {
    const colorScheme = useColorScheme();
  
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Keypad',
            tabBarIcon: ({ color }) => (
              Platform.OS === 'ios' ? 
                <IconSymbol size={28} name="phone.fill" color={color} /> :
                <Ionicons name="call" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            title: 'Contacts',
            headerTitle: 'Contacts',
            tabBarIcon: ({ color }) => (
              Platform.OS === 'ios' ? 
                <IconSymbol size={28} name="person.2.fill" color={color} /> :
                <Ionicons name="people" size={28} color={color} />
            ),
          }}
        />
      </Tabs>
    );
  }
