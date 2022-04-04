import React, {useState, useEffect} from "react";
import {
  Text,
  View,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Icon } from 'react-native-elements'
import config from '../config.json';
import { styles } from '../stylesheets/style.js';

const HOST = config.VNC_HOST;
const PORT = config.VNC_PORT;

/**
 * The Ride History screen
 * @returns The Ride History screen
 */
export const RideHistoryScreen = ({navigation, route}) => {

  // React Native removed an easy way to get params from parent screens {navigation.getParent().getParams()}
  // So this is what were working with now :(
  let [params, setParams] = useState(route.params.params.params);

  let [rideHistoryList, setRideHistoryList] = useState([]);

  const [authToken, setAuthToken] = useState(params.authToken);

  const getRideHistory = async () => {
    const email = params.email;
    const options = {
      method: 'GET',
      headers: {
          "Authorization": `Bearer ${authToken}`
      }
    };
    fetch(`http://${HOST}:${PORT}/rideHistory/${email}`, options)
      .then(async response => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson && await response.json();
  
        // check for error response
        if (!response.ok) {
            // get error message from body or default to response status
            const error = (data && data.message) || response.status;
            return Promise.reject(error);
        }
        setRideHistoryList(data.reverse());
        setState({ isFetching: false })
      })
      .catch(error => {
          console.error('Failed to get ride history');
      });
  };

  useEffect(() => {
    getRideHistory();
  }, []);

  let [state, setState] = useState({ isFetching: false });

  function onRefresh() {
    setState({ isFetching: true });
    getRideHistory();
  }
  
  const Item = ({ day, startTime, duration, startNode, endNode }) => (
    <View style={styles.itemView}>
      <View style={styles.itemTopRow}>
        <View style={styles.itemTopRowLeft}>
          <Text>{day}</Text>
          <Text>Pickup: {startTime}</Text>
        </View>
        <View style={styles.itemTopRowRight}>
          <Text>{duration} { duration === 1 ? 'minute' : 'minutes'}</Text>
        </View>
      </View>
      <View style={styles.itemBottomRow}>
        <View style={styles.itemBottomRowLeft}>
          <View style={styles.markerView}>
            <Icon name='location-pin' type='entypo' color='#517fa4' />
          </View>
          <View style={styles.nodeTextView}>
            <Text style={{fontSize: 12}}>{startNode}</Text>
          </View>
        </View>
        <View style={styles.itemBottomRowCenter}>
          <Icon name='arrow-long-right' type='entypo' color='#517fa4' />
        </View>
        <View style={styles.itemBottomRowRight}>
          <View style={styles.markerView}>
            <Icon name='location-pin' type='entypo' color='#517fa4' />
          </View>
          <View style={styles.nodeTextView}>
            <Text style={{fontSize: 12}}>{endNode}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <Item
      day={item.day}
      startTime={item.tStart}
      duration={item.duration}
      startNode={item.startNode}
      endNode={item.endNode}
     />
  );

  function FlatListItemSeparator() {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#000",
        }}
      />
    );
  };

  return (
      <SafeAreaView style={styles.ridesContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Your Trips</Text>
        </View>
        <FlatList
          data={rideHistoryList}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onRefresh={() => onRefresh()}
          refreshing={state.isFetching}
          ItemSeparatorComponent = { FlatListItemSeparator }
        />
      </SafeAreaView>
  );
};
