import {
  Text,
  View
} from "react-native";

export const Song = ({ id, title }) => {
  return(
  <View>
    <Text>{id} - {title}</Text>
    {/* <View style={styles.itemTopRow}>
      <View style={styles.itemTopRowLeft}>
        <Text>{day}</Text>
        <Text>Pickup: {startTime}</Text>
      </View>
      <View style={styles.itemTopRowRight}>
        <Text>{duration} { duration === 1 ? 'minute' : 'minutes'}</Text>
      </View>
    </View>
    <View style={styles.itemBottomRow}>
      <View style={styles.itemBottomRowLeft}>
        <View style={styles.markerView}>
          <Icon name='location-pin' type='entypo' color='#517fa4' />
        </View>
        <View style={styles.nodeTextView}>
          <Text style={{fontSize: 12}}>{startNode}</Text>
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
          <Text style={{fontSize: 12}}>{endNode}</Text>
        </View>
      </View>
    </View> */}
  </View>
)};