/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Linking
} from "react-native";
import SafariView from "react-native-safari-view";
import InAppBrowser from "react-native-inappbrowser-android";

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

const url =
  "https://ehealth.auth.ap-southeast-2.amazoncognito.com/login?response_type=code&client_id=5sbs3b87bcmaoq7hrfohh4gh8e&redirect_uri=runningman://";

type Props = {};
export default class App extends Component<Props> {
  componentDidMount() {
    Linking.addEventListener("url", this.eventHandler);
  }

  eventHandler = event => {
    console.log("event", event);
    const code = event.url.match(/code=([^&]+)/)[1];
    Platform.OS === "ios" && SafariView.dismiss();
    this.getTokenbyCode(code);
  };

  getTokenbyCode = code => {
    const details = {
      grant_type: "authorization_code",
      code,
      client_id: "5sbs3b87bcmaoq7hrfohh4gh8e",
      redirect_uri: "runningman://"
    };
    const formBody = Object.keys(details)
      .map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(details[key])}`
      )
      .join("&");

    fetch(
      "https://ehealth.auth.ap-southeast-2.amazoncognito.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: formBody
      }
    )
      .then(res => {
        console.log(res);
      })
      .catch(error => {
        console.error(error);
      });
  };

  pressHandler = () => {
    Platform.OS === "ios"
      ? SafariView.show({
          url
        })
      : InAppBrowser.open(url, {
          showTitle: true,
          toolbarColor: "#6200EE",
          secondaryToolbarColor: "black",
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          headers: {
            "my-custom-header": "Neami SSO"
          }
        }).then(result => {
          console.log("result", JSON.stringify(result));
        });
  };
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
        <Button onPress={this.pressHandler} title="Login" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
