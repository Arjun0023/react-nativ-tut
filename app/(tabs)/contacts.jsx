import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        });
        setContacts(data);
      }
    })();
  }, []);

  const handleContactPress = (contact) => {
    if (!contact?.id) {
      console.log('No contact ID found:', contact);
      return;
    }
    router.push({
      pathname: '/contact-details',
      params: { id: contact.id }
    });
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}>
      <ThemedView style={styles.avatarContainer}>
        <ThemedText style={styles.avatarText}>
          {item.name[0]}
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.contactName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactName: {
    fontSize: 16,
  },
});