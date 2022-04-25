import { StyleSheet, StatusBar } from "react-native";

export const styles = StyleSheet.create({

  loginContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: StatusBar.currentHeight || 0,
    height: "100%",
    width: "100%"
  },

  tabsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: StatusBar.currentHeight || 0,
    height: "100%",
    width: "100%"
  },

  titleText: {
    fontSize: 32,
    fontWeight: 'bold'
  },

  loginButton: {
    width: "80%",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "rgba(30,215,96,1.0)",
  },

  titleContainer: {
    marginTop: 20,
    marginBottom: 10,
    height: 30,
  },

  title: {
    fontSize: 26, 
    fontWeight: "bold",
    marginLeft: 20,
  },

  spotifyIconLogin: {
    position: 'absolute',
    left: -8,
    top: -8
  },

  itemView: {
    width: "100%",
    flexDirection: 'row',
  },

  albumCoverImage: {
    height: 45,
    width: 45,
  },

  queueButtonView: {
    position: 'absolute',
    right: 10,
    top: 10
  },

  songInfo: {
    flexDirection: 'column',
    paddingLeft: 10,
    paddingTop: 5,
    width: "100%"
  },

  signoutBtn: {
    position: 'absolute',
    right: 20,
    top: 30,
    width: "30%",
    borderRadius: 25,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    backgroundColor: "rgba(30,215,96,1.0)",
  },

  profileBtn: {
    width: "40%",
    borderRadius: 25,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    backgroundColor: "rgba(30,215,96,1.0)",
  },

  userIconView: {
    marginBottom: 50
  },

  userIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "rgba(30,215,96,1.0)",
    marginBottom: 20
  },

  userInfoView: {
    width: "100%",
    flexDirection: 'column',
    alignItems: "center",
    marginTop: 50
  },

  displayNameText: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  nowPlayingView: {
    backgroundColor: "rgba(30,215,96,1.0)",
    borderColor: "black",
    borderTopWidth: 3,
    borderBottomWidth: 3,
    position: "absolute",
    bottom: 0
  },

});