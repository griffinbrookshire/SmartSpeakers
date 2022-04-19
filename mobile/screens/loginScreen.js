import React from "react";
import { useEffect, useState } from "react";
import * as WebBrowser from 'expo-web-browser';
import { ResponseType, useAuthRequest } from 'expo-auth-session';
import { SocialIcon } from 'react-native-elements';
import {
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import config from '../config.json';
import { styles } from '../stylesheets/styles.js';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export const LoginScreen = ({ navigation }) => {

  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: config.SPOTIFY_CLIENT_ID,
      scope: ["user-library-read", "user-read-currently-playing", "playlist-read-collaborative"],
      usePKCE: false,
      redirectUri: 'https://auth.expo.io/@glbrook2/SmartSpeakers'
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      if (response.params.access_token) {
        navigation.navigate('TabNavigation', { screen: 'Queue', params: { token: response.params.access_token } });
      } else {
        console.log("No token yet")
        console.log(response)
      }
    }
  }, [response]);

  function login() {
    promptAsync({useProxy: true})
  }

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.titleText}>SmartSpeakers</Text>
      <TouchableOpacity style={styles.loginButton} onPress={() => login()}>
        <SocialIcon type='spotify' style={styles.spotifyIconLogin} iconSize={45}/>
        <Text>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}