import React from "react";
import { useEffect, useState } from "react";
import * as WebBrowser from 'expo-web-browser';
import { ResponseType, useAuthRequest } from 'expo-auth-session';
import { SocialIcon } from 'react-native-elements';
import {
  Text,
  View,
  TouchableOpacity,
  Alert
} from "react-native";
import config from '../config.json';
import { styles } from '../stylesheets/styles.js';

const HOST = config.SERVER_IP;
const PORT = config.SERVER_PORT;

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: config.SPOTIFY_CLIENT_ID,
  clientSecret: config.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'https://auth.expo.io/@glbrook2/SmartSpeakers'
});

export const LoginScreen = ({ navigation }) => {

  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: config.SPOTIFY_CLIENT_ID,
      scope: ["user-library-read", "user-read-private", "user-read-email", "user-read-recently-played", "playlist-read-collaborative", "user-top-read", "user-library-modify", "user-follow-read", "playlist-read-private", "playlist-modify-private"],
      usePKCE: false,
      redirectUri: 'https://auth.expo.io/@EXPO_ACCOUNT/SmartSpeakers'
    },
    discovery
  );

  const getPriority = (username) => {
    return new Promise((resolve) => {
      Alert.alert(
        "User Priority",
        `Is \'${username}\' a free user or a paid user?`,
        [
          {text: "Free", onPress: () => resolve(0)},
          {text: "Paid", onPress: () => resolve(1)},
        ],
        { cancelable: false }
      );
    })
  };

  useEffect(() => {
    if (response?.type === 'success') {
      if (response.params.access_token) {
        var access_token = response.params.access_token;
        var priority = -1;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.getMe().then(
          async function(data) {
            var username = data.body.id;
            priority = await getPriority(username);
            const options = {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({id: username, priority: priority})
            };
            fetch(`http://${HOST}:${PORT}/new_user`, options)
              .then(async response => {
                const isJson = response.headers.get('content-type')?.includes('application/json');
                const data = isJson && await response.json();
                navigation.navigate('TabNavigation', { screen: 'Queue', params: { token: access_token, username: username, priority: priority } });
              })
              .catch(error => {
                  console.error('There was an error adding song to playlist.');
                  console.error(error)
              });
          },
          function(err) {
            console.error(err);
          }
        )
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