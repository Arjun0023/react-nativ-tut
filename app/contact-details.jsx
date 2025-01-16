import { StyleSheet, TouchableOpacity,Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as Contacts from 'expo-contacts';
import * as Linking from 'expo-linking';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ContactDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [contact, setContact] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const contactData = await Contacts.getContactByIdAsync(id);
        
        // Format the contact data to handle iOS structure
        const sanitizedContact = {
          name: contactData?.firstName && contactData?.lastName 
            ? `${contactData.firstName} ${contactData.lastName}`
            : contactData?.firstName || contactData?.lastName || 'Unknown',
          phoneNumbers: contactData?.phoneNumbers || [],
          emails: contactData?.emails || [],
          imageAvailable: contactData?.imageAvailable || false,
          image: contactData?.image || null
        };
        
        setContact(sanitizedContact);
      } catch (error) {
        console.error('Error fetching contact:', error);
      }
    })();
  }, [id]);

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  if (!contact) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: contact.name }} />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>
              {contact.name[0]}
            </Text>
          </ThemedView>
          <ThemedText style={styles.name}>{contact.name}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
  <ThemedText style={styles.sectionTitle}>Phone Numbers</ThemedText>
  {(contact.phoneNumbers || []).map((phone, index) => (
    <TouchableOpacity
      key={index}
      style={styles.contactInfo}
      onPress={() => handleCall(phone?.number)}>
      <ThemedText style={styles.phoneNumber}>
        {phone?.number || 'No number'}
      </ThemedText>
      <IconSymbol name="phone.fill" size={20} color="#007AFF" />
    </TouchableOpacity>
  ))}
</ThemedView>

{contact.emails && contact.emails.length > 0 && (
  <ThemedView style={styles.section}>
    <ThemedText style={styles.sectionTitle}>Email Addresses</ThemedText>
    {contact.emails.map((email, index) => (
      <ThemedText key={index} style={styles.contactInfo}>
        {email?.email || 'No email'}
      </ThemedText>
    ))}
  </ThemedView>
)}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarTextLarge: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  phoneNumber: {
    fontSize: 16,
  },
});