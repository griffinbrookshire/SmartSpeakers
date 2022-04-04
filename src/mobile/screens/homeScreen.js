// import {StatusBar} from "expo-status-bar";
import React, {useState, useEffect} from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Alert,
} from "react-native";
import {styles} from '../stylesheets/style.js'

import * as Location from 'expo-location';
import MapView, {Marker} from 'react-native-maps';
import SelectDropdown from 'react-native-select-dropdown'
import {Icon} from 'react-native-elements'
import config from '../config.json';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Warning: Failed child context type']);

const LOGO = require('../assets/logo.png');
const HOST = config.VNC_HOST;
const PORT = config.VNC_PORT;
const PICKUP_TEXT = "Select Pickup";
const DESTINATION_TEXT = "Select Destination";
const TEN_SECOND_MS = 10000;

// Has to be defined outside of HomeScreen or it keeps
// getting reset back to an empty object.
let mapTracker = {};
let outOfFocus = true;
let interval;


export const HomeScreen = ({navigation, route}) => {

    let [latitude, setLatitude] = useState(0.0);

    let [longitude, setLongitude] = useState(0.0);

    let [destination, setDestination] = useState('');
    let [pickup, setPickup] = useState('');

    let [geocode, setGeocode] = useState(null);

    const [mapRegion, setmapRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const [initialMapRegion, setInitialMapRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    let [locationNodes, setLocationNodes] = useState(null);
    let [vehicles, setVehicles] = useState(null);

    let [pickupText, setPickupText] = useState(PICKUP_TEXT);

    let [destinationText, setDestinationText] = useState(DESTINATION_TEXT);

    let [authToken, setAuthToken] = useState(route.params.authToken);

    //Only update state at launch.
    useEffect(() => {
        getLocationAsync().then(r => console.log(r))
    }, []);

    const getGeocodeAsync = async (location) => {
        let geocode = await Location.reverseGeocodeAsync(location)
        setGeocode(geocode);
    }

    const getLocationAsync = async () => {
        let {status} = await Location.requestForegroundPermissionsAsync();
        // console.log(status);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }
        let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
        const {latitude, longitude} = location.coords
        await getGeocodeAsync({latitude, longitude})
        setLatitude(latitude);
        setLongitude(longitude);
        // console.log(latitude);
        // console.log(longitude);
        setmapRegion({
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        })
        setInitialMapRegion({
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        })
    };

    /**
     * Request a ride, requires the
     *      riderEmail
     *      riderLat
     *      riderLon
     *      destLat
     *      destLon
     *      time
     * Returns the rideID
     */
     const requestRide = async () => {
        let email = route.params.email;
        // Check that locations have been set
        if (pickup === '' || destination === '') {
            // Locations have not been set
            Alert.alert(
                "Oops!",
                "Please select both a pickup and destination for your ride!",
                [
                  {text: "OK", onPress: () => console.log("OK Pressed")}
                ]
            );
        } else if (pickupText === destinationText || pickup === destination) {
            // Locations equal each other
            Alert.alert(
                "Oops!",
                "Please make sure your pickup and destination are different!",
                [
                  {text: "OK", onPress: () => console.log("OK Pressed")}
                ]
            );
        } else {
            // Send the request
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    riderEmail: email,
                    riderLat: pickup.lat,
                    riderLon: pickup.lon,
                    destLat: destination.lat,
                    destLon: destination.lon,
                    time: 50,
                })
            };
            console.log(options);
            fetch(`http://${HOST}:${PORT}/rides`, options)
            .then(async response => {
                const isJson = response.headers.get('content-type')?.includes('application/json');
                const data = isJson && await response.json();

                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response status
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }
                let rideID = await response.text();
                console.log(rideID);
                outOfFocus = true;
                clearInterval(interval);
                navigation.navigate('Requested', {
                    name: 'Request Ride',
                    rideID: rideID,
                    mapRegion: initialMapRegion,
                    email: email,
                    pickup: pickup,
                    destination: destination,
                    authToken: authToken
                });
            })
            .catch(error => {
                console.log(error);
                console.error('Ride Request failed');
            });
        }
    }

    const getLocationNodes = () => {
        const options = {
            method: 'GET'
        };
        fetch(`http://${HOST}:${PORT}/locationNodes`, options)
            .then(async response => {
                const isJson = response.headers.get('content-type')?.includes('application/json');
                const data = isJson && await response.json();

                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response status
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }

                setLocationNodes(data);

            })
            .catch(error => {
                console.log(error);
                console.error('Location Nodes failed');
            });
    }

    /**
     * Sets the first dropdown to marker if empty,
     * else sets the second dropdown if empty,
     * else does nothing.
     * @param {*} markerData The marker data to set the location to.
     */
    const onMarkerPress = (markerData) => {
        if (pickupText === PICKUP_TEXT) {
            setmapRegion(mapTracker);
            setPickupText(markerData.title);
            setPickup(markerData);
        } else if (destinationText === DESTINATION_TEXT) {
            setmapRegion(mapTracker);
            setDestinationText(markerData.title);
            setDestination(markerData);
        }
    }

    const getVehicleLocations = () => {
        const options = {
            method: 'GET'
        };
        fetch(`http://${HOST}:${PORT}/vehicles`, options)
            .then(async response => {
                const isJson = response.headers.get('content-type')?.includes('application/json');
                const data = isJson && await response.json();

                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response status
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }

                setVehicles(data);
            })
            .catch(error => {
                console.log(error);
                console.error('Location Nodes failed');
            });
    }
    useEffect(() => {
        getLocationNodes();
    }, []);


    // Start the 10 second interval
    const startVehicleTimer = () => {
        getVehicleLocations();
        interval = setInterval(() => {
            setmapRegion(mapTracker);
            getVehicleLocations();
        }, TEN_SECOND_MS);
    };

    // Check if user has a ride in requested or transit
    const checkUserRide = async () => {
        let email = route.params.email;
        const options = {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        };
        fetch(`http://${HOST}:${PORT}/users/${email}/ride`, options)
        .then(async response => {
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson && await response.json();

            // check for error response
            if (!response.ok) {
                // get error message from body or default to response status
                const error = (data && data.message) || response.status;
                return Promise.reject(error);
            }

            // Check if ride exists
            if (data) {
                // If ride exists, if Arrived field is true, do nothing
                let arrivedByte = data.arrived.charCodeAt(0);
                let canceledByte = data.canceled.charCodeAt(0);
                if (arrivedByte || canceledByte) {
                    return;
                }
                // If ride exists, check pickedup field
                outOfFocus = true;
                clearInterval(interval);
                const regexDouble = /[-]?[\d]+\.[\d]+/g;
                const foundPickupCoords = data.startNode.match(regexDouble);
                const foundDestinationCoords = data.endNode.match(regexDouble);
                let pickupNode = {
                    title: data.startNodeText,
                    lat: parseFloat(foundPickupCoords[0]),
                    lon: parseFloat(foundPickupCoords[1])
                };

                let destinationNode = {
                    title: data.endNodeText,
                    lat: parseFloat(foundDestinationCoords[0]),
                    lon: parseFloat(foundDestinationCoords[1])
                };
                let pickupMapRegion = {
                    latitude: pickupNode.lat,
                    longitude: pickupNode.lon,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                };
                let pickedUpByte = data.pickedUp.charCodeAt(0);
                if(pickedUpByte) {
                    // Go to transit screen
                    navigation.navigate('Transit', {
                        name: 'Transit Screen',
                        rideID: data.id,
                        mapRegion: pickupMapRegion,
                        email: email,
                        pickup: pickupNode,
                        destination: destinationNode,
                        authToken: authToken
                    });
                } else {
                    // Go to requested screen
                    navigation.navigate('Requested', {
                        name: 'Requested Screen',
                        rideID: data.id,
                        mapRegion: pickupMapRegion,
                        email: email,
                        pickup: pickupNode,
                        destination: destinationNode,
                        authToken: authToken
                    });
                }
            } else {
                console.log("User did not have a ride.");
            }
        })
        .catch(error => {
            console.error('Checking for User ride errored.' + error);
        });
    };
    // Clear the fields for pickup and destination
    const clearFields = () => {
        setPickup('');
        setDestination('');
        setPickupText(PICKUP_TEXT);
        setDestinationText(DESTINATION_TEXT);
    };

    // Functions to run when navigating to screen
    // Start the 10 second interval
    // Check if user is in requested or transit
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if(outOfFocus){
                outOfFocus = false;
                startVehicleTimer();
                checkUserRide();
                clearFields();
            }
        });
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            outOfFocus = true;
            clearInterval(interval);
        });
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    let MarkerList = [];
    let MarkerObjectList = [];

    // Make this a method, called in useEffect, because stations don't update?
    if (locationNodes) {
        let markerRegion = {};
        let markerTitle = "";
        for (let i = 0; i < locationNodes.length; i++) {
            markerRegion = {latitude: locationNodes[i].lat, longitude: locationNodes[i].lon};
            markerTitle = locationNodes[i].nodeName;

            MarkerObjectList.push({
                title: markerTitle,
                lat: locationNodes[i].lat,
                lon: locationNodes[i].lon
            });
            MarkerList.push(
                <Marker coordinate={markerRegion} title={markerTitle} key={"locationNode" + i}
                        onPress={onMarkerPress.bind(this, MarkerObjectList[i])}>
                    <Icon name='location-pin' type='entypo' color='#517fa4'/>
                </Marker>
            );
        }
    }

    let VehicleList = [];
    let VehicleObjectList = [];

    if (vehicles) {
        let markerRegion = {};
        let markerTitle = "";
        for (let i = 0; i < vehicles.length; i++) {
            markerRegion = {latitude: vehicles[i].lat, longitude: vehicles[i].lon};
            markerTitle = vehicles[i].status;

            VehicleList.push(
                <Marker coordinate={markerRegion} title={markerTitle} key={"vehicle" + i}>
                <Icon name='car' type='antdesign' color='red' size={15} /></Marker>
            );
            VehicleObjectList.push({
                title: markerTitle,
                lat: vehicles[i].lat,
                lon: vehicles[i].lon
            });
        }
    }

    function getVehicleInfoText() {
        if (!vehicles) return null
        return (
            vehicles.length === 1 ?
            <Text style={styles.infoText}>There is <Text style={styles.infoTextNumber}>{vehicles.length}</Text> vehicle currently available</Text> :
            <Text style={styles.infoText}>There are <Text style={styles.infoTextNumber}>{vehicles.length}</Text> vehicles currently available</Text>
        );
    }

    return (
        <View style={styles.container}>
            <Image style={styles.image} source={LOGO}/>

            <MapView style={{alignSelf: 'stretch', height: '50%'}} showsCompass={true} showsUserLocation={true} region={mapRegion} onRegionChange = {(region) => {
                mapTracker = region;
            }}>
                {MarkerList}
                {VehicleList}
            </MapView>

            <SelectDropdown
                data={MarkerObjectList}
                onSelect={(selectedItem, index) => {
                    setPickup(selectedItem);
                    setPickupText(selectedItem.title);
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                    // text represented after item is selected
                    // if data array is an array of objects then return selectedItem.property to render after item is selected
                    return selectedItem.title;
                }}
                rowTextForSelection={(item, index) => {
                    // text represented for each item in dropdown
                    // if data array is an array of objects then return item.property to represent item in dropdown
                    return item.title;
                }}
                defaultButtonText={pickupText}
                buttonStyle={styles.dropdown1BtnStyle}
                buttonTextStyle={styles.dropdown1BtnTxtStyle}
                dropdownStyle={styles.dropdown1DropdownStyle}
                rowStyle={styles.dropdown1RowStyle}
                rowTextStyle={styles.dropdown1RowTxtStyle}
            />

            <SelectDropdown
                data={MarkerObjectList}
                onSelect={(selectedItem, index) => {
                    setDestination(selectedItem);
                    setDestinationText(selectedItem.title);
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                    // text represented after item is selected
                    // if data array is an array of objects then return selectedItem.property to render after item is selected
                    return selectedItem.title;
                }}
                rowTextForSelection={(item, index) => {
                    // text represented for each item in dropdown
                    // if data array is an array of objects then return item.property to represent item in dropdown
                    return item.title;
                }}
                defaultButtonText={destinationText}
                buttonStyle={styles.dropdown1BtnStyle}
                buttonTextStyle={styles.dropdown1BtnTxtStyle}
                dropdownStyle={styles.dropdown1DropdownStyle}
                rowStyle={styles.dropdown1RowStyle}
                rowTextStyle={styles.dropdown1RowTxtStyle}
            />

            <TouchableOpacity style={styles.loginBtn} onPress={() =>
                requestRide()}>
                <Text style={styles.buttonText}>Request Ride</Text>
            </TouchableOpacity>

            <View style={styles.infoTextWrapper}>{getVehicleInfoText()}</View>
        </View>
    );

};
