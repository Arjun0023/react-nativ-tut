// CallRecordingService.js
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';

class CallRecordingService {
  constructor() {
    this.recording = null;
    this.isRecording = false;
  }

  async requestPermissions() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async startRecording() {
    if (this.isRecording) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant audio recording permissions.');
      return;
    }

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: true,
      });

      // Create recording instance
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;
      console.log('Started recording...');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  }

  async stopRecording() {
    if (!this.isRecording || !this.recording) return;

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;
      this.recording = null;

      console.log('Recording stopped, file saved at:', uri);
      await this.uploadRecording(uri);
      
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  }

  async uploadRecording(uri) {
    if (!uri) return;

    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        type: 'audio/m4a',
        name: 'call-recording.m4a'
      });

      // Replace with your actual API endpoint
      const response = await fetch('https://your-api-endpoint.com/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      console.log('Recording uploaded successfully');
      
      // Clean up the local file
      await FileSystem.deleteAsync(uri);
    } catch (error) {
      console.error('Failed to upload recording:', error);
      Alert.alert('Error', 'Failed to upload recording.');
    }
  }
}

export default new CallRecordingService();