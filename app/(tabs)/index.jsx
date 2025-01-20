import { StyleSheet, TouchableOpacity, View, Platform, SafeAreaView,Text } from 'react-native';
import React, { useState,useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { AppState } from 'react-native';

export default function PhoneScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [recording, setRecording] = useState();
const [recordings, setRecordings] = useState([]);
const [isCallActive, setIsCallActive] = useState(false);
const [permissionsResponse, setPermissionsResponse] = useState();
const RECORDINGS_DIRECTORY = `${FileSystem.documentDirectory}recordings/`;
  const handleNumberPress = (num) => {
    setPhoneNumber(prev => prev + num);
  };
  const initializeRecordingsDirectory = async () => {
    const directoryInfo = await FileSystem.getInfoAsync(RECORDINGS_DIRECTORY);
    if (!directoryInfo.exists) {
      await FileSystem.makeDirectoryAsync(RECORDINGS_DIRECTORY, { intermediates: true });
    }
  };
  
  // Request permissions and initialize
  const setupRecording = async () => {
    try {
      const audioPermission = await Audio.requestPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      
      if (audioPermission.granted && mediaLibraryPermission.granted) {
        await initializeRecordingsDirectory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting up recording:', error);
      return false;
    }
  };
  
  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  // Configure audio recording
  const startRecording = async () => {
    try {
      const hasPermissions = await setupRecording();
      console.log('Permissions status:', hasPermissions);
      
      if (!hasPermissions) {
        console.log('Permissions not granted');
        return false;
      }
  
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      });
  
      // Verify directory exists
      const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIRECTORY);
      console.log('Directory info:', dirInfo);
      
      if (!dirInfo.exists) {
        console.log('Creating directory...');
        await FileSystem.makeDirectoryAsync(RECORDINGS_DIRECTORY, { intermediates: true });
      }
  
      const recordingOptions = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          // Add these specific settings for call recording
          audioSource: Audio.RECORDING_OPTION_ANDROID_AUDIO_SOURCE_VOICE_COMMUNICATION,
          maxFileSize: 1024 * 1024 * 10, // 10MB
        },
      };

      // Generate filename with timestamp and phone number
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${timestamp}_${phoneNumber}.m4a`;
      const fileUri = `${RECORDINGS_DIRECTORY}${fileName}`;
      console.log('Recording to file:', fileUri);

      if (Platform.OS === 'android') {
        try {
          // This requires a custom native module
          await NativeModules.CallRecordingModule.enableCallRecordingMode();
        } catch (error) {
          console.warn('Failed to enable call recording mode:', error);
        }
      }
      const { recording } = await Audio.Recording.createAsync(
        recordingOptions,
        (status) => console.log('Recording status:', status),
        fileUri
      );
      
      setRecording(recording);
      console.log('Recording started successfully');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  };
  
  // Update stopRecording function with better error handling
  const stopRecording = async () => {
    try {
      if (!recording) {
        console.log('No active recording to stop');
        return;
      }
  
      console.log('Stopping recording...');
      await recording.stopAndUnloadAsync();
      if (Platform.OS === 'android') {
        try {
          await NativeModules.CallRecordingModule.disableCallRecordingMode();
        } catch (error) {
          console.warn('Failed to disable call recording mode:', error);
        }
      }

      const uri = recording.getURI();
      console.log('Recording URI:', uri);
      
      if (uri) {
        // Verify file exists
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('Recorded file info:', fileInfo);
  
        if (fileInfo.exists) {
          // Save to media library
          const asset = await MediaLibrary.createAssetAsync(uri);
          console.log('Asset created:', asset);
          
          // Create album if it doesn't exist
          const album = await MediaLibrary.getAlbumAsync('CallRecordings');
          if (album === null) {
            await MediaLibrary.createAlbumAsync('CallRecordings', asset, false);
            console.log('New album created');
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
            console.log('Added to existing album');
          }
          
          // Update recordings list
          setRecordings(prev => [...prev, {
            uri,
            fileName: uri.split('/').pop(),
            timestamp: new Date().toISOString(),
            phoneNumber
          }]);
          console.log('Recording saved successfully');
        } else {
          console.error('Recording file does not exist after saving');
        }
      } else {
        console.error('No URI received from recording');
      }
      
      setRecording(undefined);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };
  const loadRecordings = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(RECORDINGS_DIRECTORY);
      const recordingsList = files.map(fileName => ({
        uri: `${RECORDINGS_DIRECTORY}${fileName}`,
        fileName,
        timestamp: fileName.split('_')[0],
        phoneNumber: fileName.split('_')[1].replace('.m4a', '')
      }));
      setRecordings(recordingsList);
    } catch (error) {
      console.error('Error loading recordings:', error);
    }
  };
  
  // Function to delete a recording
  const deleteRecording = async (uri) => {
    try {
      await FileSystem.deleteAsync(uri);
      setRecordings(prev => prev.filter(recording => recording.uri !== uri));
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };
  
  // Initialize on component mount
  useEffect(() => {
    setupRecording();
    loadRecordings();
    
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);
  const handleCall = async () => {
    if (phoneNumber) {
      try {
        if (Platform.OS === 'android') {
          const recordingSetup = await startRecording();
          console.log('Recording setup result:', recordingSetup);
          setIsCallActive(true);
        }
  
        const phoneUrl = Platform.select({
          ios: `tel:${phoneNumber}`,
          android: `tel://${phoneNumber}`
        });
  
        // Add a listener for when the app comes back to foreground
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
          if (nextAppState === 'active' && isCallActive) {
            console.log('Call ended, stopping recording');
            await stopRecording();
            setIsCallActive(false);
            subscription.remove();
          }
        });
  
        await Linking.openURL(phoneUrl);
      } catch (err) {
        console.error('Call error:', err);
        if (recording) {
          await stopRecording();
        }
        setIsCallActive(false);
      }
    }
  };
  useEffect(() => {
    setupRecording();
    loadRecordings();
    
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);
  console.log('Documents Directory:', FileSystem.documentDirectory);
  console.log('External Directory:', FileSystem.getInfoAsync(FileSystem.documentDirectory));

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
              <Ionicons name="call" size={24} color="#fff" />
            </TouchableOpacity>
            
            {phoneNumber.length > 0 && (
              <TouchableOpacity 
                onPress={handleDelete} 
                style={[
                  styles.actionButton,
                  styles.deleteButton,
                  isDark ? styles.deleteButtonDark : styles.deleteButtonLight
                ]}>
                <Ionicons 
                  name="backspace" 
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
    backgroundColor: '#1de02a',
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