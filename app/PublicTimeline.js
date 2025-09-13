import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import PostItem from '../components/PostItem';

export default function PublicTimeline() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(postsQuery);
        
        const postsData = await Promise.all(querySnapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          
          // Fetch author info
          let authorData = null;
          if (postData.authorUid) {
            const userDocRef = doc(db, 'users', postData.authorUid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              authorData = userDocSnap.data();
            }
          }
          
          return {
            id: postDoc.id,
            ...postData,
            author: authorData,
          };
        }));
        
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostItem item={item} />}
        keyExtractor={(item) => item.id}
        onRefresh={() => { /* Add refresh logic */ }}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
