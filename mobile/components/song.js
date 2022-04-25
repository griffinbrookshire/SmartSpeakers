import {
  Text,
  View,
  Image,
  Alert
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from "../stylesheets/styles";
import config from '../config.json';

const HOST = config.SERVER_IP;
const PORT = config.SERVER_PORT;

export const Song = ({ id, title, artist, imageUrl, needsButton, username }) => {

  function addToQueue() {
    Alert.alert(
      "Add to Playlist",
      `Add \'${title}\' to the playlist?`,
      [
        {text: "No", onPress: () => console.log('Sike, you thought')},
        {text: "Yes", onPress: () => postSongToQueue()}
      ]
    );
  }

  function postSongToQueue() {
    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id: id, user_id: username})
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

        Alert.alert(
          "Song Request Result",
          data.message,
          [
            {text: "OK"}
          ]
        );

      })
      .catch(error => {
          console.error('There was an error adding song to playlist.');
          console.error(error)
      });
  }

  return(
  <View style={styles.itemView}>
    <Image source={{uri: imageUrl}} style={styles.albumCoverImage}/>
    <View style={styles.songInfo}>
      <Text>{title.substring(0,42)}</Text>
      <Text>{artist.substring(0,42)}</Text>
    </View>
    {needsButton ? <View style={styles.queueButtonView}><Icon name='playlist-plus' size={28} color={"rgba(30,215,96,1.0)"} onPress={addToQueue}/></View>: null}
  </View>
)};