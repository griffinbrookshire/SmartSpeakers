import { StatusBar } from "expo-status-bar";
import React, {useState, useEffect} from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { styles } from '../stylesheets/style.js'
import MapView, {Marker} from "react-native-maps";
import config from '../config.json';
import { Icon } from 'react-native-elements'

const LOGO = require('../assets/logo.png');
const HOST = config.VNC_HOST;
const PORT = config.VNC_PORT;
const TEN_SECOND_MS = 10000;

// Has to be defined outside of RequestedScreen or it keeps
// getting reset back to an empty object.
let mapTracker = {};

/**
 * Vehicle has picked up User and delivering them to destination.
 * User can stop ride. (Stops at closest station)
 * User can confirm they have left the vehicle. (Button hidden until GPS shows they are at station)
 * Text shows estimated time to arrival.
*/

export const TransitScreen = ({ navigation, route }) => {

    let [rideID, setRideID] = useState(route.params.rideID);

    let [email, setEmail] = useState(route.params.email);

    let [vehicle, setVehicle] = useState(null);

    let [vehicleID, setVehicleID] = useState("UNASSIGNED");

    let [destination, setDestination] = useState(route.params.destination);
    let [pickup, setPickup] = useState(route.params.pickup);

    const [mapRegion, setmapRegion] = useState(route.params.mapRegion);
    const [initialMapRegion, setInitialMapRegion] = useState(route.params.mapRegion);

    let [authToken, setAuthToken] = useState(route.params.authToken);

    let pickupJSX = [];
    pickupJSX.push(
        <Marker coordinate={{latitude: pickup.lat, longitude: pickup.lon}} title={pickup.title} key={"pickupNode"}>
        <Icon name='location-pin' type='entypo' color='#517fa4' /></Marker>
    );

    let destinationJSX = [];
    destinationJSX.push(
        <Marker coordinate={{latitude: destination.lat, longitude: destination.lon}} title={destination.title} key={"destinationNode"}>
        <Icon name='location-pin' type='entypo' color='#517fa4' /></Marker>
    );

    /**
     * Confirms the arrival, needs the rideID
     */
    const confirmArrival = async () => {
        const options = {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        };
        fetch(`http://${HOST}:${PORT}/confirmArrival/${rideID}`, options)
        .then(async response => {
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson && await response.json();

            // check for error response
            if (!response.ok) {
                // get error message from body or default to response status
                const error = (data && data.message) || response.status;
                return Promise.reject(error);
            }

            navigation.navigate('Home', {
                name: 'Confirm Arrival',
                mapRegion: route.params.mapRegion,
                email: email,
                authToken: authToken
            });
        })
        .catch(error => {
            console.error('Arrival could not be confirmed');
        });
    }

    const stopRide = async () => {
        const options = {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        };
        fetch(`http://${HOST}:${PORT}/stopRide/${rideID}`, options)
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
                "Ride Stop",
                "Ride is stopping at next station.",
                [
                    { text: "Confirm", onPress: () => console.log("Confirmation Acknowledged.") }
                ]
            );
        })
        .catch(error => {
            // TODO
            console.error('Stop Ride is not implemented.');
        });
    }

    const stopRideAlert = () => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to stop the ride?",
            [
                { text: "Yes", onPress: () => stopRide() },
                { text: "No", onPress: () => console.log("No Pressed") }
            ]
        );
    }

    const findVehicle = async () => {
        const options = {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        };
        fetch(`http://${HOST}:${PORT}/rides/${rideID}/vehicle`, options)
        .then(async response => {
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson && await response.json();

            // check for error response
            if (!response.ok) {
                // get error message from body or default to response status
                const error = (data && data.message) || response.status;
                return Promise.reject(error);
            }

            setVehicle(data);
            if (data) {
                setVehicleID(data.name);
            }
        })
        .catch(error => {
            console.error('Could not find Ride ' + rideID);
            console.log(error);
        });
    }

    let VehicleMarkerJSX = [];
    let VehicleObject = {};

    if(vehicle) {
        VehicleMarkerJSX.push(
            <Marker coordinate={{latitude: vehicle.lat, longitude: vehicle.lon}} title={vehicle.status} key={"vehicle_key"}>
            <Icon name='car' type='antdesign' color='red' size={15} /></Marker>
        );
        VehicleObject = {
            title: vehicle.status,
            lat: vehicle.lat,
            lon: vehicle.lon
        };
    }

    useEffect(() => {
        findVehicle();
        const interval = setInterval(() => {
            setmapRegion(mapTracker);
            findVehicle();
        }, TEN_SECOND_MS);
        return () => clearInterval(interval);
    }, []);

    function getConfirmationField() {
        return (
            VehicleObject.title === "TO_DEST" ?
            <TouchableOpacity style={styles.loginBtn} onPress={() =>
                confirmArrival()      }>
                <Text style={styles.buttonText}>Confirm Vehicle Arrival</Text>
            </TouchableOpacity> :
            null
        )
    }

    function getVehicleStatusText() {
        return (
            VehicleObject.title === "TO_DEST" ?
            <Text style={styles.infoText}><Text style={styles.infoTextNumber}>{vehicleID}</Text> has arrived at destination</Text> :
            <Text style={styles.infoText}><Text style={styles.infoTextNumber}>{vehicleID}</Text> is enroute to destination</Text>
        );
    };

    // Stop button will have no navigation, just an API request to modify waypoints for vehicle
    // (Make next station waypoint the last waypoint)
    return (
        <View style={styles.container}>

            <Image style={styles.image} source={LOGO} />

            <MapView style={{alignSelf: 'stretch', height: '50%'}} showsCompass={true} showsUserLocation={true} region={mapRegion} onRegionChange = {(region) => {
                mapTracker = region;
            }}>
                {VehicleMarkerJSX}
                {pickupJSX}
                {destinationJSX}
            </MapView>

            <StatusBar style="auto" />

            <TouchableOpacity style={styles.loginBtn} onPress={() =>
                stopRideAlert(navigation) }>
                <Text style={styles.buttonText}>Stop Ride</Text>
            </TouchableOpacity>

            {getConfirmationField()}

            <View style={styles.itemBottomRowRequested}>
                <View style={styles.itemBottomRowLeft}>
                    <View style={styles.markerView}>
                        <Icon name='location-pin' type='entypo' color='#517fa4' />
                    </View>
                    <View style={styles.nodeTextView}>
                        <Text style={{fontSize: 12}}>{pickup.title}</Text>
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
                        <Text style={{fontSize: 12}}>{destination.title}</Text>
                    </View>
                </View>
            </View>

            {getVehicleStatusText()}

        </View>
    );
};
