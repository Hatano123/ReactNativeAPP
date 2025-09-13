import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Clipboard } from 'react-native';
import { Avatar, Title, Caption, Text, Button, Card, List } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function MyPageScreen() {
  const [userData, setUserData] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        }
      }
    };
    fetchUserData();
  }, [user]);

  const copyToClipboard = () => {
    if (user) {
      Clipboard.setString(user.uid);
      alert('ユーザーIDをコピーしました。');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfoSection}>
        <Avatar.Image 
          source={{ uri: userData?.iconUrl || 'https://via.placeholder.com/80' }}
          size={80}
        />
        <View style={{ marginLeft: 20 }}>
          <Title style={styles.title}>{userData?.nickname || 'Guest'}</Title>
          <Caption style={styles.caption}>{userData?.currentTitle || '称号なし'}</Caption>
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0日</Text>
          <Text style={styles.statLabel}>現在の連続記録</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0日</Text>
          <Text style={styles.statLabel}>最長記録</Text>
        </View>
      </View>

      <Card style={styles.card}>
        <List.Section title="フレンド管理">
          <List.Item
            title="ユーザーIDをコピー"
            left={() => <List.Icon icon="content-copy" />}
            onPress={copyToClipboard}
          />
          {/* TODO: Add friend search, request list */}
        </List.Section>
      </Card>
      
      <Card style={styles.card}>
        <List.Section title="称号一覧">
          <List.Item
            title="3日の旅人"
            description="連続3日達成"
            left={() => <List.Icon icon="medal" />}
          />
          {/* TODO: Dynamically list titles */}
        </List.Section>
      </Card>

      <Button mode="outlined" onPress={() => auth.signOut()} style={styles.logoutButton}>
        ログアウト
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: 'gray',
  },
  card: {
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 'auto',
  },
});
