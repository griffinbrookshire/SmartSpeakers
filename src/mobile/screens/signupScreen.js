import { StatusBar } from "expo-status-bar";
import Icon from 'react-native-vector-icons/AntDesign';
import React, { useState } from 'react';
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import config from '../config.json';
import { styles } from '../stylesheets/style.js';

const LOGO = require('../assets/logo.png');
const HOST = config.VNC_HOST;
const PORT = config.VNC_PORT;

/**
 * The signup screen
 * @returns The signup screen
 */
export const SignupScreen = ({ navigation }) => {

  const [fname, setFirstName] = useState('');
  const [lname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const signUp = async () => {
    if (fname === '' || lname === '' || email === '' || password === '' || confirmPassword === '') {
      Alert.alert(
        "Oops!",
        "Please fill in all fields",
        [
          {text: "OK", onPress: () => console.log("OK Pressed")}
        ]
      );
    } else if (password !== confirmPassword) {
      Alert.alert(
        "Oops!",
        "Passwords do not match",
        [
          {text: "OK", onPress: () => console.log("OK Pressed")}
        ]
      );
    } else {
      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: email, fname: fname, lname: lname, password: password})
      };

      fetch(`http://${HOST}:${PORT}/signUp`, options)
        .then(async response => {
          const isJson = response.headers.get('content-type')?.includes('application/json');
          const data = isJson && await response.json();

          // check for error response
          if (!response.ok) {
              // get error message from body or default to response status
              const error = (data && data.message) || response.status;
              return Promise.reject(error);
          };

          navigation.navigate('TabNavigation', 
            { screen: 'HomeStack', params:
            { screen: 'Home', params: { email: data['email'], fname: data['fname'], lname: data['lname'], authToken: data['authToken'] }
          }});
        })
        .catch(error => {
          Alert.alert(
            "Oops!",
            "Account with that email already exists",
            [
              {text: "OK", onPress: () => console.log("OK Pressed")}
            ]
          );
        });
    };
  };

  return (
    <View style={styles.container}>

      <Icon name="left" style={styles.backArrow} size={28} color="rgba(232,40,49,1.0)" onPress={() =>
        navigation.navigate('Login', { name: 'Back' })}/>

      <Image style={styles.image} source={LOGO}/>

      <StatusBar style="auto"/>

      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="First name"
          placeholderTextColor="#003f5c"
          onChangeText={(first_name) => setFirstName(first_name)}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Last name"
          placeholderTextColor="#003f5c"
          onChangeText={(last_name) => setLastName(last_name)}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Email"
          placeholderTextColor="#003f5c"
          onChangeText={(email) => setEmail(email)}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Password"
          placeholderTextColor="#003f5c"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Confirm Password"
          placeholderTextColor="#003f5c"
          secureTextEntry={true}
          onChangeText={(confirmPassword) => setConfirmPassword(confirmPassword)}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={() => signUp()}>
        <Text style={styles.loginText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}