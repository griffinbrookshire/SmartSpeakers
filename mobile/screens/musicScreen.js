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
import { NowPlaying } from "../components/nowPlaying";

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: config.SPOTIFY_CLIENT_ID,
  clientSecret: config.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'https://auth.expo.io/@glbrook2/SmartSpeakers'
});

/**
 * The Your Music screen
 * @returns The Your Music screen
 */
export const MusicScreen = ({navigation, route}) => {

	let [music, setMusic] = useState([]);
	let [state, setState] = useState({ isFetching: false, refresh: false });
	let [token, setToken] = useState(route.params.params.token);
	let [username, setUsername] = useState(route.params.params.username);
	spotifyApi.setAccessToken(token);

	function getSong(song, index) {
		var item = {
			id: 'spotify:track:' + song.track.id,
			title: '',
			artist: '',
			// Default imageUrl from random page on Google Images - might break
			imageUrl: 'https://files.radio.co/humorous-skink/staging/default-artwork.png',
		}
		if (song.track.album.images && song.track.album.images.length > 0) {
			item.imageUrl = song.track.album.images[0].url;
		}
		item.title = song.track.name;
		item.artist = song.track.album.artists[0].name
		music[index] = item;
	}

	function getSavedSongs() {
		setState({ isFetching: true, refresh: state.refresh });
		// Get tracks in the signed in user's Your Music library
		spotifyApi.getMySavedTracks({
				limit : 50,
		})
		.then(function(data) {
			data.body.items.forEach(getSong);
			setState({ isFetching: false, refresh: !state.refresh });
		}, function(err) {
				console.log('Something went wrong!', err);
		});
	}

	useEffect(() => {
		getSavedSongs();
	}, [])

	function onRefresh() {
		getSavedSongs();
	}
	
	const renderItem = ({ item }) => (
		<Song
			id={item.id}
			title={item.title}
			artist={item.artist}
			imageUrl={item.imageUrl}
			needsButton={true}
			username={username}
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
				<Text style={styles.title}>Your Music</Text>
			</View>
			<FlatList
				data={music}
				renderItem={renderItem}
				keyExtractor={item => item.id.toString()}
				onRefresh={() => onRefresh()}
				refreshing={state.isFetching}
				ItemSeparatorComponent = { FlatListItemSeparator }
				extraData={state.refresh}
			/>
			<NowPlaying/>
		</SafeAreaView>
	);

};
