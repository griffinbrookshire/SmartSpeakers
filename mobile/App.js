import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import { LoginScreen } from './screens/LoginScreen.js';
import { QueueScreen } from './screens/QueueScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';
import { MusicScreen } from './screens/MusicScreen.js';

import { spotifyGreen } from './stylesheets/styles.js';

const Stack = createNativeStackNavigator();
const Tab = createMaterialBottomTabNavigator();

/**
 * Main controller of mobile app.
 * Controls all of the screens that are available.
 * Top screen is the default screen.
 * @returns A navigator object with all the screens
 */
 function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Allows children elements of 'TabNavigation' to all view the same params */}
        <Stack.Screen name="TabNavigation" >
          { (props) => (
            <Tab.Navigator barStyle={{ backgroundColor: spotifyGreen }}>
              <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                initialParams={ props.route.params }
                options={{
                  tabBarIcon: ({ color }) => (
                    <Icon name='account' size={24} color={color} />
                  ),
                  tabBarLabel: 'Profile'
                }}
              />
              <Tab.Screen
                name="Queue"
                component={QueueScreen}
                initialParams={ props.route.params }
                options={{
                  tabBarIcon: ({ color }) => (
                    <Icon name='playlist-music' size={24} color={color} />
                  ),
                  tabBarLabel: 'Queue'
                }}
              />
              <Tab.Screen
                name="Music"
                component={MusicScreen}
                initialParams={ props.route.params }
                options={{
                  tabBarIcon: ({ color }) => (
                    <Icon name='spotify' size={24} color={color} />
                  ),
                  tabBarLabel: 'Your Music'
                }}
              />
            </Tab.Navigator>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;