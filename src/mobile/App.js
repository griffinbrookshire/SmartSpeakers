import React from "react";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { HomeScreen } from './screens/homeScreen.js';
import { LoginScreen } from './screens/loginScreen.js';
import { SignupScreen } from './screens/signupScreen.js';
import { RequestedScreen } from './screens/requestedScreen.js';
import { TransitScreen } from './screens/transitScreen.js';
import { ProfileScreen } from './screens/profileScreen.js';
import { RideHistoryScreen } from './screens/rideHistoryScreen.js';

const MainStack = createNativeStackNavigator();
const RideStack = createNativeStackNavigator();
const Tab = createMaterialBottomTabNavigator();

function HomeStackScreen() {
  return (
    <RideStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <RideStack.Screen name="Home" component={HomeScreen} />
      <RideStack.Screen name="Requested" component={RequestedScreen} />
      <RideStack.Screen name="Transit" component={TransitScreen} />
    </RideStack.Navigator>
  );
};

/**
 * Main controller of mobile app.
 * Controls all of the screens that are available.
 * Top screen is the default screen.
 * @returns A navigator object with all the screens
 */
function App() {
  return (
    <NavigationContainer>
      <MainStack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <MainStack.Screen name="Login" component={LoginScreen} />
        <MainStack.Screen name="Signup" component={SignupScreen} />
        {/* Allows children elements of 'TabNavigation' to all view the same params */}
        <MainStack.Screen name="TabNavigation" >
          { (props) => (
            <Tab.Navigator barStyle={{ backgroundColor: "rgba(232,40,49,1.0)" }}>
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
                name="HomeStack"
                component={HomeStackScreen}
                initialParams={ props.route.params }
                options={{
                  tabBarIcon: ({ color }) => (
                    <Icon name='car' size={24} color={color} />
                  ),
                  tabBarLabel: 'Ride'
                }}
              />
              <Tab.Screen
                name="RideHistory"
                component={RideHistoryScreen}
                initialParams={ props.route.params }
                options={{
                  tabBarIcon: ({ color }) => (
                    <Icon name='history' size={24} color={color} />
                  ),
                  tabBarLabel: 'Trips'
                }}
              />
            </Tab.Navigator>
          )}
        </MainStack.Screen>
      </MainStack.Navigator>
    </NavigationContainer>
  );
};

export default App;
