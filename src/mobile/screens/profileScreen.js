import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Icon } from 'react-native-elements';
import config from '../config.json';
import { styles } from '../stylesheets/style.js';

const HOST = config.VNC_HOST;
const PORT = config.VNC_PORT;

/**
 * The Profile screen
 * @returns The Profile screen
 */
export const ProfileScreen = ({navigation, route}) => {

  // React Native removed an easy way to get params from parent screens {navigation.getParent().getParams()}
  // So this is what were working with now :(
  let [params, setParams] = useState(route.params.params.params);

  // Google users get this param set
  const isGoogleUser = params.photoUrl ? true : false

  const [email, setEmail] = useState(params.email);
  const [firstName, setFirstName] = useState(params.fname);
  const [lastName, setLastName] = useState(params.lname);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authToken, setAuthToken] = useState(params.authToken);

  function revokeToken(navigation) {
    const options = {
      method: 'DELETE',
      headers: {
          "Authorization": `Bearer ${authToken}`
      }
    };
    fetch(`http://${HOST}:${PORT}/signOut`, options)
      .then(async response => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson && await response.json();

        // check for error response
        if (!response.ok) {
            // get error message from body or default to response status
            const error = (data && data.message) || response.status;
            return Promise.reject(error);
        }
        navigation.navigate('Login');
      })
      .catch(error => {
          console.log('Failed to revoke token (Might be expired or user didn\'t exist)');
          navigation.navigate('Login');
      });
  }

  function signOut(navigation) {
    Alert.alert(
        "Confirmation",
        "Are you sure you want to sign out?",
        [
          {text: "No", onPress: () => console.log("No Pressed")},
          {text: "Yes", onPress: () => revokeToken(navigation)}
        ]
    );
  };

  function userIconComponent() {
    return (
      isGoogleUser ? 
      <Image source={{uri: params.photoUrl}} style={styles.userIcon}/> : 
      <Icon name='user-circle' type='font-awesome' size = {80}/>
    );
  };

  function getPasswordFields() {
    return (
      isGoogleUser ? 
      null : 
      <View>
        <View style={styles.userProfileField}>

              <View style={styles.userProfileLabelTextContainer}>
                <Text style={styles.userProfileLabelText}>Password</Text>
              </View>

              <View style={styles.userProfileTextInput}>
                <TextInput
                  style={styles.TextInput}
                  placeholder="Password"
                  placeholderTextColor="#003f5c"
                  secureTextEntry={true}
                  onChangeText={(password) => setPassword(password)}
                  value={password}
                  autoCapitalize="none"
                />
              </View>

            </View>

            <View style={styles.userProfileField}>

              <View style={styles.userProfileLabelTextContainer}>
                <Text style={styles.userProfileLabelText}>Confirm Password</Text>
              </View>

              <View style={styles.userProfileTextInput}>
                <TextInput
                  style={styles.TextInput}
                  placeholder="Confirm Password"
                  placeholderTextColor="#003f5c"
                  secureTextEntry={true}
                  onChangeText={(confirmPassword) => setConfirmPassword(confirmPassword)}
                  value={confirmPassword}
                  autoCapitalize="none"
                />
              </View>

            </View>
          </View>
    );
  };

  const updateUser = async () => {
    if (firstName === '' || lastName === '' || email === '') {
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
      var user = { oldEmail: params.email, email: email, fname: firstName, lname: lastName, password: password };
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(user)
      };

      fetch(`http://${HOST}:${PORT}/updateUser`, options)
        .then(async response => {
          const isJson = response.headers.get('content-type')?.includes('application/json');
          const data = isJson && await response.json();

          // check for error response
          if (!response.ok) {
              // get error message from body or default to response status
              const error = (data && data.message) || response.status;
              return Promise.reject(error);
          };

          route.params.params.params.email = user.email;
          route.params.params.params.fname = user.fname;
          route.params.params.params.lname = user.lname;
          setParams(route.params.params.params);

          Alert.alert(
            "Congrats!",
            "Your profile has been updated successfully",
            [
              {text: "OK", onPress: () => console.log("OK Pressed")}
            ]
          );

          setPassword('');
          setConfirmPassword('');

        })
        .catch(error => {
          Alert.alert(
            "Oops!",
            "There was an error updating your profile",
            [
              {text: "OK", onPress: () => console.log("OK Pressed")}
            ]
          );
          console.log(error);
        });
    };
  };

  return (
    <SafeAreaView style={styles.ridesContainer}>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <TouchableOpacity style={styles.signoutBtn} onPress={() =>
        signOut(navigation)}>
        <Text style={styles.signoutBtnText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.userProfileContainer}>

        <View style={styles.userProfileIconContainer}>{userIconComponent()}</View>

        <View>

          <View style={styles.userProfileField}>

            <View style={styles.userProfileLabelTextContainer}>
              <Text style={styles.userProfileLabelText}>Email</Text>
            </View>

            <View style={isGoogleUser ?
              [styles.userProfileTextInput, {backgroundColor: 'rgba(186, 186, 186, 1.0)'}] :
               styles.userProfileTextInput}>
              <TextInput
                style={styles.TextInput}
                placeholder="Email"
                placeholderTextColor="#003f5c"
                onChangeText={(email) => setEmail(email)}
                value={email}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                editable={isGoogleUser ? false : true}
              />
            </View>

          </View>

          <View style={styles.userProfileField}>

            <View style={styles.userProfileLabelTextContainer}>
              <Text style={styles.userProfileLabelText}>First Name</Text>
            </View>

            <View style={styles.userProfileTextInput}>
              <TextInput
                style={styles.TextInput}
                placeholder="First Name"
                placeholderTextColor="#003f5c"
                onChangeText={(firstName) => setFirstName(firstName)}
                value={firstName}
                autoCapitalize="words"
                autoComplete="off"
                autoCorrect={false}
              />
            </View>

          </View>

          <View style={styles.userProfileField}>

            <View style={styles.userProfileLabelTextContainer}>
              <Text style={styles.userProfileLabelText}>Last Name</Text>
            </View>

            <View style={styles.userProfileTextInput}>
              <TextInput
                style={styles.TextInput}
                placeholder="Last Name"
                placeholderTextColor="#003f5c"
                onChangeText={(lastName) => setLastName(lastName)}
                value={lastName}
                autoCapitalize="words"
                autoComplete="off"
                autoCorrect={false}
              />
            </View>

          </View>

          {getPasswordFields()}

          <View style={styles.saveButtonContainer}>

            <TouchableOpacity style={styles.saveButton} onPress={() => updateUser()}>
              <Text style={styles.signoutBtnText}>Save</Text>
            </TouchableOpacity>

          </View>

        </View>

      </View>

    </SafeAreaView>

  );
};
