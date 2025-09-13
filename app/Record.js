import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Title, Paragraph, Modal, Portal, TextInput, Button, Provider } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';

export default function RecordScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [records, setRecords] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [duration, setDuration] = useState('');
  const [summary, setSummary] = useState({ count: 0, avgDuration: 0 });

  const user = auth.currentUser;

  const fetchRecords = async () => {
    if (!user) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const recordsRef = collection(db, 'records');
    const q = query(
      recordsRef,
      where('uid', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(startOfMonth)),
      where('date', '<', Timestamp.fromDate(endOfMonth))
    );

    const querySnapshot = await getDocs(q);
    const fetchedRecords = {};
    let totalDuration = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const dateStr = data.date.toDate().toISOString().split('T')[0];
      fetchedRecords[dateStr] = { marked: true, dotColor: '#6200ee' };
      totalDuration += data.durationMinutes;
    });

    setRecords(fetchedRecords);
    setSummary({
      count: querySnapshot.size,
      avgDuration: querySnapshot.size > 0 ? totalDuration / querySnapshot.size : 0,
    });
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const handleSaveRecord = async () => {
    if (!user || !selectedDate || !duration) return;

    const durationMinutes = parseInt(duration, 10);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      alert('有効な時間を入力してください。');
      return;
    }

    try {
      // Use a composite key for the document ID to easily update/overwrite records
      const recordId = `${user.uid}_${selectedDate}`;
      const recordRef = doc(db, 'records', recordId);
      
      await setDoc(recordRef, {
        uid: user.uid,
        date: Timestamp.fromDate(new Date(selectedDate)),
        durationMinutes: durationMinutes,
      });

      setModalVisible(false);
      setDuration('');
      fetchRecords(); // Refresh records
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('記録の保存に失敗しました。');
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Portal>
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Title>記録入力 ({selectedDate})</Title>
            <TextInput
              label="時間（分）"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              style={{ marginBottom: 20 }}
            />
            <Button mode="contained" onPress={handleSaveRecord}>
              保存
            </Button>
          </Modal>
        </Portal>

        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            ...records,
            [selectedDate]: { ...records[selectedDate], selected: true, selectedColor: '#6200ee' },
          }}
          theme={{
            todayTextColor: '#6200ee',
            arrowColor: '#6200ee',
          }}
        />
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title>今月のサマリー</Title>
            <Paragraph>合計回数: {summary.count}回</Paragraph>
            <Paragraph>平均時間: {summary.avgDuration.toFixed(1)}分</Paragraph>
          </Card.Content>
        </Card>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    margin: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});
