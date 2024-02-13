import React, {useState, useEffect} from "react";
import {
  Text,
  View,
  SafeAreaView,
  FlatList,
} from "react-native";
import config from '../config.json';
import { styles } from '../stylesheets/styles.js';
import { Song } from '../shared/Song.js';
import { NowPlaying } from "../shared/NowPlaying.js";
import { FlatListItemSeparator } from "../shared/FlatListItemSeparator.js";

const HOST = config.SERVER_HOST;
const PORT = config.SERVER_PORT;

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: config.SPOTIFY_CLIENT_ID,
  clientSecret: config.SPOTIFY_CLIENT_SECRET,
  redirectUri: config.EXPO_REDIRECT_URI
});

/**
 * The Current Queue screen
 * @returns The Current Queue screen
 */
export const QueueScreen = ({navigation, route}) => {

  let [queue, setQueue] = useState([]);
  let [isRefreshing, setIsRefreshing] = useState(false);

  const getQueue = async () => {
    setIsRefreshing(true);
    fetch(`http://${HOST}:${PORT}/current_queue`, {method: 'GET'})
      .then(async response => {

        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.message) || response.status;
          return Promise.reject(error);
        }

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson && await response.json();

        console.log(data.songs)
        setQueue(data.songs)
        setIsRefreshing(false);

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
    getQueue();
  }

  const renderItem = ({ item }) => (
    <Song
      id={item.id}
      title={item.title}
      artist={item.artist}
      image={item.image}
      needsButton={false}
     />
  );

  return (
    <SafeAreaView style={styles.tabsContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Queue</Text>
      </View>
      <FlatList
        data={queue}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        ItemSeparatorComponent = {FlatListItemSeparator}
        extraData={queue.length}
      />
      <NowPlaying/>
    </SafeAreaView>
  );
};
