package com.myapp.tutorial.callrecording

import android.media.AudioManager
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class CallRecordingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val audioManager: AudioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    override fun getName(): String = "CallRecordingModule"

    @ReactMethod
    fun enableCallRecordingMode(promise: Promise) {
        try {
            audioManager.mode = AudioManager.MODE_IN_CALL
            audioManager.setParameters("input_source=Voice_Call")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun disableCallRecordingMode(promise: Promise) {
        try {
            audioManager.mode = AudioManager.MODE_NORMAL
            audioManager.setParameters("input_source=Default")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}