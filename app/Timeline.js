import React, { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal, Portal, Text, Button, Provider, TextInput, RadioButton } from 'react-native-paper';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp } from 'firebase/firestore';

import PublicTimeline from './PublicTimeline';
import FriendsTimeline from './FriendsTimeline';

const TopTab = createMaterialTopTabNavigator();

export default function TimelineScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('success'); // 'success' or 'failure'

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  const handlePost = async () => {
    if (!comment.trim()) {
      alert('コメントを入力してください。');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('ログインが必要です。');
      return;
    }

    // 1日の投稿回数チェック
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('authorUid', '==', user.uid),
      where('createdAt', '>=', Timestamp.fromDate(today)),
      where('createdAt', '<', Timestamp.fromDate(tomorrow))
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.size >= 2) {
      alert('投稿は1日に2回までです。');
      return;
    }

    try {
      await addDoc(collection(db, 'posts'), {
        authorUid: user.uid,
        comment: comment,
        status: status,
        createdAt: serverTimestamp(),
      });
      hideModal();
      setComment('');
      // TODO: Refresh timeline
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('投稿に失敗しました。');
    }
  };

  return (
    <Provider>
      <SafeAreaView style={{ flex: 1 }}>
        <Portal>
          <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>今日の記録</Text>
            <TextInput
              label="コメント"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              style={{ marginBottom: 20 }}
            />
            <View style={styles.radioGroup}>
              <View style={styles.radioButton}>
                <RadioButton
                  value="success"
                  status={status === 'success' ? 'checked' : 'unchecked'}
                  onPress={() => setStatus('success')}
                  color="#4CAF50"
                />
                <Text>成功</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton
                  value="failure"
                  status={status === 'failure' ? 'checked' : 'unchecked'}
                  onPress={() => setStatus('failure')}
                  color="#F44336"
                />
                <Text>失敗</Text>
              </View>
            </View>
            <Button mode="contained" onPress={handlePost}>
              投稿
            </Button>
          </Modal>
        </Portal>

        <TopTab.Navigator>
          <TopTab.Screen name="Public" component={PublicTimeline} />
          <TopTab.Screen name="Friends" component={FriendsTimeline} />
        </TopTab.Navigator>

        <TouchableOpacity style={styles.fab} onPress={showModal}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
