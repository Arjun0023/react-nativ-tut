import { StyleSheet, TouchableOpacity, View, Platform, SafeAreaView,Text } from 'react-native';
import React, { useState } from 'react';
import * as Linking from 'expo-linking';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function PhoneScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleNumberPress = (num) => {
    setPhoneNumber(prev => prev + num);
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const renderDialButton = (num, letters = '') => (
    <TouchableOpacity
      style={[
        styles.dialButton,
        isDark ? styles.dialButtonDark : styles.dialButtonLight,
      ]}
      onPress={() => handleNumberPress(num)}>
      <View style={styles.dialButtonContent}>
        <ThemedText style={[
          styles.dialButtonNumber,
          isDark ? styles.textDark : styles.textLight
        ]}>{num}</ThemedText>
        {letters && (
          <ThemedText style={[
            styles.dialButtonLetters,
            isDark ? styles.subTextDark : styles.subTextLight
          ]}>{letters}</ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.darkBg : styles.lightBg]}>
      <ThemedView style={styles.container}>
      <View style={styles.displayContainer}>
  <Text 
    numberOfLines={1} 
    style={[
      styles.phoneNumberText,
      isDark ? styles.textDark : styles.textLight,
    ]}>
    {phoneNumber || ''}
  </Text>
</View>
        
        <View style={styles.dialpad}>
          <View style={styles.dialpadRow}>
            {renderDialButton('1')}
            {renderDialButton('2', 'ABC')}
            {renderDialButton('3', 'DEF')}
          </View>
          <View style={styles.dialpadRow}>
            {renderDialButton('4', 'GHI')}
            {renderDialButton('5', 'JKL')}
            {renderDialButton('6', 'MNO')}
          </View>
          <View style={styles.dialpadRow}>
            {renderDialButton('7', 'PQRS')}
            {renderDialButton('8', 'TUV')}
            {renderDialButton('9', 'WXYZ')}
          </View>
          <View style={styles.dialpadRow}>
            {renderDialButton('*')}
            {renderDialButton('0', '+')}
            {renderDialButton('#')}
          </View>
        </View>

        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonsWrapper}>
            <TouchableOpacity 
              onPress={handleCall} 
              style={[
                styles.actionButton,
                styles.callButton,
                !phoneNumber && styles.callButtonDisabled
              ]}
              disabled={!phoneNumber}>
              <IconSymbol name="phone.fill" size={24} color="#fff" />
            </TouchableOpacity>
            
            {phoneNumber.length > 0 && (
              <TouchableOpacity 
                onPress={handleDelete} 
                style={[
                  styles.actionButton,
                  styles.deleteButton,
                  isDark ? styles.deleteButtonDark : styles.deleteButtonLight
                ]}>
                <IconSymbol 
                  name="delete.left" 
                  size={20} 
                  color={isDark ? '#fff' : '#666'} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  lightBg: {
    backgroundColor: '#fff',
  },
  darkBg: {
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 50,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: Platform.OS === 'ios' ? 90 : 20,
  },
  displayContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    paddingHorizontal: 0,
    width: '100%', // Ensure container takes full width
    padding: 10,
  },
  phoneNumberText: {
    marginTop:10,
    fontSize: 40,
    letterSpacing: 1,
    fontWeight: '300',
    textAlign: 'center',
  },
  dialpad: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 400,
  },
  dialpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  dialButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dialButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  dialButtonLight: {
    backgroundColor: '#f5f5f5',
  },
  dialButtonDark: {
    backgroundColor: '#2c2c2c',
  },
  dialButtonNumber: {
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 35,
  },
  dialButtonLetters: {
    fontSize: 10,
    marginTop: 0,
  },
  actionButtonsContainer: {
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 10,
  },
  actionButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: 70,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  callButton: {
    backgroundColor: '#2ecc71',
  },
  callButtonDisabled: {
    backgroundColor: '#a8e6bc',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
  },
  deleteButtonLight: {
    backgroundColor: '#e0e0e0',
  },
  deleteButtonDark: {
    backgroundColor: '#404040',
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  subTextLight: {
    color: '#666',
  },
  subTextDark: {
    color: '#999',
  },
});