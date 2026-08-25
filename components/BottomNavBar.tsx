import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function BottomNavBar({ activeTab = 'Play' }) {
  const insets = useSafeAreaInsets();
  
  const tabs = [
    { name: 'Play', icon: 'videogame-asset', route: '/' },
    { name: 'Shop', icon: 'shopping-bag', route: '/shop' },
    { name: 'Awards', icon: 'military-tech', route: '/leaderboard' },
    { name: 'Profile', icon: 'person', route: '/pet' },
    { name: 'Settings', icon: 'settings', route: '/settings' },
  ];

  return (
    <View 
      className="bg-surface-container border-t border-outline-variant shadow-[0_-4px_12px_rgba(0,0,0,0.5)] absolute bottom-0 w-full flex-row justify-around items-center px-4 py-3 rounded-t-xl"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity 
            key={tab.name}
            onPress={() => {
              if (!isActive) {
                router.push(tab.route as any);
              }
            }}
            style={isActive ? styles.activeTab : null}
            className="flex-col items-center justify-center rounded-xl px-4 py-1"
          >
            <MaterialIcons 
              name={tab.icon as any} 
              size={28} 
              color={isActive ? '#c9aeff' : '#bcc9cd'} 
            />
            <Text 
              className="text-xs mt-1 font-bold text-on-surface-variant"
              style={[
                { fontFamily: 'Space Grotesk', letterSpacing: 0.5 },
                isActive ? styles.activeText : null,
              ]}
            >
              {tab.name.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: '#3B245E',
    shadowColor: '#D2BBFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  activeText: {
    color: '#E9DDFF',
  },
});
