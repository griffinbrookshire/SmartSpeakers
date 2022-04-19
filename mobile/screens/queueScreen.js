import React, {useState, useEffect} from "react";
import {
  Text,
  View,
  SafeAreaView,
  FlatList,
} from "react-native";
import config from '../config.json';
import { styles } from '../stylesheets/styles.js';
import { Song } from '../components/song.js';

const HOST = config.SERVER_IP;
const PORT = config.SERVER_PORT;

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: config.SPOTIFY_CLIENT_ID,
  clientSecret: config.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'https://auth.expo.io/@glbrook2/SmartSpeakers'
});

/**
 * The Current Queue screen
 * @returns The Current Queue screen
 */
export const QueueScreen = ({navigation, route}) => {

  // React Native removed an easy way to get params from parent screens {navigation.getParent().getParams()}
  // So this is what were working with now :(
  // let [params, setParams] = useState(route.params.params.params);

  let [queue, setQueue] = useState([]);
  let [rawQueue, setRawQueue] = useState([]);
  let [state, setState] = useState({ isFetching: false, refresh: false });
  let [token, setToken] = useState(route.params.token);
  spotifyApi.setAccessToken(token);

  const getSong = async (song, index) => {
    const id = song.title.substring('spotify:track:'.length)
    var item = {
      id: song.title,
      title: '',
      artist: '',
      // Default imageUrl from random page on Google Images - might break
      imageUrl: 'https://files.radio.co/humorous-skink/staging/default-artwork.png',
    }
    spotifyApi.getTrack(id).then(
      function(data) {
        if (data.body.album.images && data.body.album.images.length > 0) {
          item.imageUrl = data.body.album.images[0].url;
        }
        item.title = data.body.name;
        item.artist = data.body.artists[0].name
        queue[index] = item;
      },
      function(err) {
        console.error(err);
      }
    )
  };

  const getQueue = async () => {
    setState({ isFetching: true, refresh: state.refresh });
    fetch(`http://${HOST}:${PORT}/current_queue`, {method: 'GET'})
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

          // Safe guard against making a bunch of API calls
          if (rawQueue.length !== 0 && !hasQueueChanged(data.songs)) {
            console.log('Not refreshing because no update to queue.');
            setState({ isFetching: false, refresh: state.refresh });
            return;
          }

          setRawQueue(data.songs);
          data.songs.forEach(getSong);

          // Yes, I know this is cheating... I just couldn't deal with JavaScripts promises/await/async bs
          setTimeout(function(){ 
            setState({ isFetching: false, refresh: !state.refresh });
          }, 800);
          
        }
      })
      .catch(error => {
          console.error('Failed to get current queue');
          console.error(error)
      });
  };

  function hasQueueChanged(incomingQueue) {
    for (var i=0; i<rawQueue.length; i++) {
      if (rawQueue[i].title !== incomingQueue[i].title) {
        return true
      }
    }
    return false
  }

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
      imageUrl={item.imageUrl}
      needsButton={false}
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
    <SafeAreaView style={styles.tabsContainer}>
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
        extraData={state.refresh}
      />
    </SafeAreaView>
  );
};
