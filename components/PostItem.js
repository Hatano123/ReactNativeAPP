import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Card, Avatar, Paragraph } from 'react-native-paper';

// createdAt (Timestamp) を "X時間前" のような形式に変換するヘルパー関数
const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const postTime = timestamp.toDate();
  const diffSeconds = Math.floor((now - postTime) / 1000);

  if (diffSeconds < 60) return `${diffSeconds}秒前`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}時間前`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}日前`;
};

const PostItem = ({ item }) => {
  const { author, status, comment, createdAt } = item;
  const { nickname, iconUrl, currentTitle } = author || {};

  const statusColor = status === 'success' ? '#4CAF50' : '#F44336';

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Avatar.Image size={40} source={{ uri: iconUrl || 'https://via.placeholder.com/40' }} />
            <View style={styles.headerText}>
              <Text style={styles.nickname}>{nickname || 'No Name'}</Text>
              <Text style={styles.title}>{currentTitle || 'No Title'}</Text>
            </View>
          </View>
          <Paragraph style={styles.comment}>{comment}</Paragraph>
          <Text style={styles.timestamp}>{timeAgo(createdAt)}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  container: {
    flexDirection: 'row',
  },
  statusIndicator: {
    width: 5,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    marginLeft: 12,
  },
  nickname: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    color: 'gray',
    fontSize: 12,
  },
  comment: {
    marginBottom: 8,
  },
  timestamp: {
    color: 'gray',
    fontSize: 12,
    alignSelf: 'flex-end',
  },
});

export default PostItem;
