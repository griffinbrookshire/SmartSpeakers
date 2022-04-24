import React, {useState, useEffect} from "react";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from "react-native";
import { Icon } from 'react-native-elements';
import config from '../config.json';
import { styles } from '../stylesheets/styles.js';

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: config.SPOTIFY_CLIENT_ID,
  clientSecret: config.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'https://auth.expo.io/@glbrook2/SmartSpeakers'
});

/**
 * The Profile screen
 * @returns The Profile screen
 */
export const ProfileScreen = ({navigation, route}) => {

  let [token, setToken] = useState(route.params.params.token);
  let [priority, setPriority] = useState(route.params.params.priority);
  let [profilePicUrl, setProfilePicUrl] = useState('');
  let [displayName, setDisplayName] = useState('');
  let [profileLink, setProfileLink] = useState('');
  spotifyApi.setAccessToken(token);

  useEffect(() => {
    getUser();
  }, []);

  function userIconComponent() {
    return (
      profilePicUrl.length > 0 ? 
      <Image style={styles.userIcon} source={{uri: profilePicUrl}}/> :
      <Icon name='user-circle' type='font-awesome' size = {100}/>
    );
  };

  function signOut() {
    Alert.alert(
        "Confirmation",
        "Are you sure you want to sign out?",
        [
          {text: "No", onPress: () => console.log('Dont logout')},
          {text: "Yes", onPress: () => navigation.navigate('Login')}
        ]
    );
  };

  function getUser() {
    // Get the authenticated user
    spotifyApi.getMe()
    .then(function(data) {
      setDisplayName(data.body.display_name);
      setProfileLink(data.body.external_urls.spotify);
      if (data.body.images.length > 0) {
        setProfilePicUrl(data.body.images[0].url);
      }
    }, function(err) {
      console.log('Something went wrong!', err);
    });
  };

  function openSpotifyAccount() {
    Linking.canOpenURL(profileLink).then(supported => {
      if (supported) {
        Linking.openURL(profileLink);
      } else {
        console.log("Don't know how to open URI: " + profileLink);
      }
    });
  }

  return (
    <SafeAreaView style={styles.tabsContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <TouchableOpacity style={styles.signoutBtn} onPress={() =>
        signOut()}>
        <Text style={styles.signoutBtnText}>Sign Out</Text>
      </TouchableOpacity>
      <View style={styles.userInfoView}>
        <View styles={styles.userIconView}>{userIconComponent()}</View>
        <Text style={styles.displayNameText}>{displayName}</Text>
        <Text style={{marginTop: 10, fontSize: 18}}>{ priority === 0 ? "Free User" : "Paid User"}</Text>
        <TouchableOpacity style={styles.profileBtn} onPress={() =>
          openSpotifyAccount()}>
          <Text style={styles.signoutBtnText}>Your Spotify Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
