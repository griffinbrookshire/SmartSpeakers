import React from "react";
import { useEffect, useState } from "react";
import * as WebBrowser from 'expo-web-browser';
import { ResponseType, useAuthRequest } from 'expo-auth-session';
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
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

  const [token, setToken] = useState("");

  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: config.SPOTIFY_CLIENT_ID,
      scopes: ['user-read-playback-state', 'user-read-currently-playing',
               'user-follow-read', 'user-read-recently-played', 'user-top-read',
               'playlist-read-collaborative', 'playlist-read-private', 'user-read-email',
               'user-read-private', 'user-library-read'],
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: 'https://auth.expo.io/@glbrook2/SmartSpeakers'
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      if (response.params.access_token) {
        setToken(response.params.access_token);
      } else {
        console.log("in use effect")
        console.log(response)
      }
    }
  }, [response]);

  function login() {
    promptAsync({useProxy: true})
  }

  function printToken() {
    console.log(token);
  }

  function getUser() {
    console.log('getting user...')
    console.log(`using token: ${token}`)
    const options = {
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + token,
                'Proxy-Authorization': 'Bearer ' + token}
      // headers: {'Content-Type': 'application/json',
      //           'Authorization': 'Bearer ' + token}
    };
    console.log(options);
    fetch(`http://api.spotify.com/me`, options)
      .then(async response => {
        console.log('success...');
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson && await response.json();
        console.log(data);
        // navigation.navigate('TabNavigation', 
        //   { screen: 'HomeStack', params:
        //   { screen: 'Home', params: { email: data['email'], fname: data['fname'], lname: data['lname'], authToken: data['authToken'] }
        // }});
      })
      .catch(error => {
        console.log('error...')
        console.log(error)
      });
  }

  return (
    <View>
      <TouchableOpacity style={styles.loginButton} onPress={() => login()}>
        <Text>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={() => printToken()}>
        <Text>Print Token</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={() => getUser()}>
        <Text>Get User</Text>
      </TouchableOpacity>
    </View>
  );
}