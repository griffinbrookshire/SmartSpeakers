import React, {useState, useEffect} from "react";
import {
  Text,
  View,
  SafeAreaView,
  FlatList,
} from "react-native";
// import { Icon } from 'react-native-elements'
import config from '../config.json';
import { styles } from '../stylesheets/styles.js';
import { Song } from '../components/song.js';

const HOST = config.SERVER_IP;
const PORT = config.SERVER_PORT;

/**
 * The Ride History screen
 * @returns The Ride History screen
 */
export const QueueScreen = ({navigation, route}) => {

  // React Native removed an easy way to get params from parent screens {navigation.getParent().getParams()}
  // So this is what were working with now :(
  // let [params, setParams] = useState(route.params.params.params);

  let [queue, setQueue] = useState([]);
  let [state, setState] = useState({ isFetching: false });

  // const [authToken, setAuthToken] = useState(params.authToken);

  const getQueue = async () => {
    const options = {
      method: 'GET'
    };
    fetch(`http://${HOST}:${PORT}/current_queue`, options)
      .then(async response => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson && await response.json();
  
        // check for error response
        if (!response.ok) {
            // get error message from body or default to response status
            const error = (data && data.message) || response.status;
            return Promise.reject(error);
        }
        if (data.songs) {
          console.log(data);
          setQueue(data.songs);
          setState({ isFetching: false });
        }
      })
      .catch(error => {
          console.error('Failed to get current queue');
          console.error(error)
      });
  };

  useEffect(() => {
    getQueue();
  }, []);

  

  function onRefresh() {
    setState({ isFetching: true });
    getQueue();
  }

  const renderItem = ({ item }) => (
    <Song
      id={item.id}
      title={item.title}
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
        <Text style={styles.title}>Queue</Text>
      </View>
      <FlatList
        data={queue}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={() => onRefresh()}
        refreshing={state.isFetching}
        ItemSeparatorComponent = { FlatListItemSeparator }
      />
    </SafeAreaView>
  );
};
