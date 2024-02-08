import React, {useState, useEffect} from "react";
import {
  View,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from "../stylesheets/styles";
import config from '../config.json';
import { Song } from './song.js';

const HOST = config.SERVER_HOST;
const PORT = config.SERVER_PORT;

let interval;

export const NowPlaying = () => {

  let [title, setTitle] = useState('Not Playing');
  let [artist, setArtist] = useState('----');
  let [imageUrl, setImageUrl] = useState('https://files.radio.co/humorous-skink/staging/default-artwork.png')

  function getCurrentlyPlaying() {
    const options = {
      method: 'GET'
    };
    fetch(`http://${HOST}:${PORT}/currently_playing`, options)
      .then(async response => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson && await response.json();

        if (data.name) setTitle(data.name);
        if (data.artist) setArtist(data.artist);
        if (data.image_url) setImageUrl(data.image_url);

      })
      .catch(error => {
          console.error('There was an error getting the current playing song.');
          console.error(error)
      });
  }

  const startNowPlayingRefresh = () => {
    getCurrentlyPlaying();
    interval = setInterval(() => {
        getCurrentlyPlaying();
    }, 5000);
  };

  useEffect(() => {
		startNowPlayingRefresh();
	}, [])

  return(
    <View style={styles.nowPlayingView}>
      <Song
        title={title}
        artist={artist}
        imageUrl={imageUrl}
      />
    </View>
)};