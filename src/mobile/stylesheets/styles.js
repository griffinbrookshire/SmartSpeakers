import { StyleSheet, StatusBar } from "react-native";

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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

  loginButtonText: {
    alignItems: "center",
    justifyContent: "center",
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

  queueContainer: {
    height: "100%",
  },

});