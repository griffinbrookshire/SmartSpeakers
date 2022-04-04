import { StatusBar } from "expo-status-bar";
import React, { useState } from 'react';
import * as Google from 'expo-google-app-auth';
import { SocialIcon } from 'react-native-elements';
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
import { styles } from '../stylesheets/style.js';

const LOGO = require('../assets/logo.png');
const HOST = config.VNC_HOST;
const PORT = config.VNC_PORT;
const GOOGLE_CONFIG_IOS = {"iosClientId":config.iosClientId};
const GOOGLE_CONFIG_ANDROID = {"androidClientId":config.androidClientId};
const GOOGLE_CONFIG = Platform.OS === "ios" ? GOOGLE_CONFIG_IOS : GOOGLE_CONFIG_ANDROID;

/**
 * The login & signup screen
 * @returns The login & signup screen
 */
export const LoginScreen = ({ navigation }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async () => {
    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: email, password: password})
    };
    fetch(`http://${HOST}:${PORT}/signIn`, options)
      .then(async response => {
          const isJson = response.headers.get('content-type')?.includes('application/json');
          const data = isJson && await response.json();

          // check for error response
          if (!response.ok) {
              // get error message from body or default to response status
              const error = (data && data.message) || response.status;
              return Promise.reject(error);
          }

          setEmail('');
          setPassword('');
          navigation.navigate('TabNavigation', 
            { screen: 'HomeStack', params:
            { screen: 'Home', params: { email: data['email'], fname: data['fname'], lname: data['lname'], authToken: data['authToken'] }
          }});
      })
      .catch(error => {
        Alert.alert(
          "Oops!",
          "Incorrect email or password",
          [
            {text: "OK", onPress: () => console.log("OK Pressed")}
          ]
        );
      });
  };

  const googleSignIn = async () => {
    const { type, accessToken, user } = await Google.logInAsync(GOOGLE_CONFIG);
    if (type === 'success') {
      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: user['email'], fname: user['givenName'], lname: user['familyName'] })
      };
      fetch(`http://${HOST}:${PORT}/signInGoogle`, options)
        .then(async response => {
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson && await response.json();
  
            // check for error response
            if (!response.ok) {
                // get error message from body or default to response status
                const error = (data && data.message) || response.status;
                return Promise.reject(error);
            }
  
            setEmail('');
            setPassword('');
            navigation.navigate('TabNavigation', 
              { screen: 'HomeStack', params:
              { screen: 'Home', params: { email: user['email'], fname: user['givenName'], lname: user['familyName'], photoUrl: user['photoUrl'], authToken: data['authToken'] }
            }});
        })
        .catch(error => {
            console.error('There was a problem checking your email with our database');
        });
    } else {
      console.error('There was a problem signing into Google');
    }
  };

  return (
    <View style={styles.container}>

      <Image style={styles.loginLogo} source={LOGO}/>

      <StatusBar style="auto"/>

      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Email"
          placeholderTextColor="#003f5c"
          onChangeText={(email) => setEmail(email)}
          value={email}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Password"
          placeholderTextColor="#003f5c"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          value={password}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={() => signIn()}>
        <Text style={styles.loginText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleSignInBtn} onPress={() => googleSignIn()}>
        <SocialIcon type='google' style={styles.googleIcon}/>
        <Text style={styles.googleLoginText}>Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => console.log('Reset Password')}>
        <Text style={styles.forgot_button}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.createAccountBtn} onPress={() =>
        navigation.navigate('Signup', { name: 'Create User' })}>
        <Text style={styles.loginText}>Create Account</Text>
      </TouchableOpacity>

    </View>
  );
};
