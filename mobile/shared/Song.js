import {
  Text,
  View,
  Image,
  Alert
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles, spotifyGreen } from "../stylesheets/styles";
import config from '../config.json';

const HOST = config.SERVER_HOST;
const PORT = config.SERVER_PORT;

export const Song = ({ id, title, artist, image, needsButton, username }) => {

  function addToQueue() {
    Alert.alert(
      "Add to Queue",
      `Add \'${title}\' to the queue?`,
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
      body: JSON.stringify({id: id, title: title, artist: artist, image, image, user: username})
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
          "Queue Request Result",
          "Successfully queued your song",
          [
            {text: "OK"}
          ]
        );

      })
      .catch(error => {
          console.error('There was an error adding song to queue.');
          console.error(error)
      });
  }

  return(
  <View style={styles.itemView}>
    <Image source={image ? {uri: image} : {uri: 'https://files.radio.co/humorous-skink/staging/default-artwork.png'}} style={styles.albumCoverImage}/>
    <View style={styles.songInfo}>
      <Text>{title.substring(0,40)}</Text>
      <Text>{artist.substring(0,40)}</Text>
    </View>
    {needsButton ? <View style={styles.queueButtonView}><Icon name='playlist-plus' size={28} color={spotifyGreen} onPress={addToQueue}/></View>: null}
  </View>
)};