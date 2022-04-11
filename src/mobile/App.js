import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import { LoginScreen } from './screens/loginScreen.js';

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
      <Tab.Navigator barStyle={{ backgroundColor: "rgba(232,40,49,1.0)" }}>
        {/* <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          initialParams={ props.route.params }
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name='account' size={24} color={color} />
            ),
            tabBarLabel: 'Profile'
          }}
        /> */}
        <Tab.Screen name="Home" component={LoginScreen} />
        {/* <Tab.Screen
          name="Queue"
          component={LoginScreen}
          // initialParams={ props.route.params }
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name='car' size={24} color={color} />
            ),
            tabBarLabel: 'Queue'
          }}
        /> */}
        {/* <Tab.Screen
          name="RideHistory"
          component={RideHistoryScreen}
          initialParams={ props.route.params }
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name='history' size={24} color={color} />
            ),
            tabBarLabel: 'Trips'
          }}
        /> */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;