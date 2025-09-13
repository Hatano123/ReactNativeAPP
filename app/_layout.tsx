import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { Tabs } from 'expo-router';

export default function AppLayout() {
  return (
    <PaperProvider>
      <Tabs>
        <Tabs.Screen name="Timeline" />
        <Tabs.Screen name="Record" />
        <Tabs.Screen name="MyPage" />
      </Tabs>
    </PaperProvider>
  );
}
