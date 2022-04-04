import {StatusBar} from "expo-status-bar";
import React, {useState, useEffect} from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Alert,
} from "react-native";
import {styles} from '../stylesheets/style.js'
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
 * Vehicle is on the way.
 * User can cancel ride at any time.
 * User can confirm they have entered the ride (Button hidden until GPS shows vehicle is at station).
 * Text shows estimated time till vehicle picks up user.
 */

export const RequestedScreen = ({navigation, route}) => {

    let [vehicleID, setVehicleID] = useState("UNASSIGNED");
    let [vehicle, setVehicle] = useState(null);

    let [rideID, setRideID] = useState(route.params.rideID);

    let [email, setEmail] = useState(route.params.email);

    let [destination, setDestination] = useState(route.params.destination);
    let [pickup, setPickup] = useState(route.params.pickup);

    let [authToken, setAuthToken] = useState(route.params.authToken);

    const [mapRegion, setmapRegion] = useState(route.params.mapRegion);
    const [initialMapRegion, setInitialMapRegion] = useState(route.params.mapRegion);

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
     * Confirms the pickup, needs the rideID
     */
    const confirmPickup = async () => {
        const options = {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        };
        fetch(`http://${HOST}:${PORT}/confirmPickup/${rideID}`, options)
        .then(async response => {
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson && await response.json();

            // check for error response
            if (!response.ok) {
                // get error message from body or default to response status
                const error = (data && data.message) || response.status;
                return Promise.reject(error);
            }

            navigation.navigate('Transit', {
                name: 'Confirm Pickup',
                mapRegion: route.params.mapRegion,
                email: email,
                rideID, rideID,
                pickup: pickup,
                destination: destination,
                authToken: authToken
            });
        })
        .catch(error => {
            console.error('Ride could not be confirmed');
        });
    }

    /**
     * Cancels the ride, needs the rideID
     */
     const cancelRide = async () => {
        const options = {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        };
        fetch(`http://${HOST}:${PORT}/rides/${rideID}`, options)
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
                name: 'Cancel Request',
                mapRegion: route.params.mapRegion,
                email: email,
                authToken: authToken
            });
        })
        .catch(error => {
            console.error('Ride could not be cancelled');
            console.log(error);
        });
    }

    const cancelAlert = () =>
        Alert.alert(
            "Confirmation",
            "Are you sure you want to cancel the ride?",
            [
                {text: "Yes", onPress: () => cancelRide()},
                {text: "No", onPress: () => console.log("No Pressed")}
            ]
        );

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
            VehicleObject.title === "TO_RIDER" ?
            <TouchableOpacity style={styles.loginBtn} onPress={() =>
                confirmPickup()}>
                <Text style={styles.buttonText}>Confirm Pickup</Text>
            </TouchableOpacity> :
            null
        )
    }

    function getVehicleStatusText() {
        return (
            VehicleObject.title === "TO_RIDER" ?
            <Text style={styles.infoText}><Text style={styles.infoTextNumber}>{vehicleID}</Text> has arrived at pickup</Text> :
            <Text style={styles.infoText}><Text style={styles.infoTextNumber}>{vehicleID}</Text> is is enroute to pickup</Text>
        );
    };

    return (
        <View style={styles.container}>

            <Image style={styles.image} source={LOGO}/>

            <MapView style={{alignSelf: 'stretch', height: '50%'}} showsCompass={true} showsUserLocation={true} region={mapRegion} onRegionChange = {(region) => {
                mapTracker = region;
            }}>
                {VehicleMarkerJSX}
                {pickupJSX}
                {destinationJSX}
            </MapView>

            <TouchableOpacity style={styles.loginBtn} onPress={() =>
                cancelAlert(navigation)}>
                <Text style={styles.buttonText}>Cancel Request</Text>
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
