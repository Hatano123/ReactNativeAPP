import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FriendsTimeline() {
  return (
    <View style={styles.container}>
      <Text>Friends Timeline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
