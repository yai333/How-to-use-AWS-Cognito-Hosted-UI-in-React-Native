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

const CLIENT_ID = "";
const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

const loginURL = `https://ehealth.auth.ap-southeast-2.amazoncognito.com/login?response_type=code&client_id=${CLIENT_ID}&redirect_uri=runningman://`;

const logoutURL = `https://ehealth.auth.ap-southeast-2.amazoncognito.com/logout?client_id=${CLIENT_ID}&logout_uri=runningman://?code=logout`;

type Props = {};
export default class App extends Component<Props> {
  componentDidMount() {
    Linking.addEventListener("url", this.eventHandler);
  }

  eventHandler = event => {
    const code =
      (/code=([^&]+)/.test(event.url) && event.url.match(/code=([^&]+)/)[1]) ||
      null;
    if (!code) return;
    Platform.OS === "ios" && SafariView.dismiss();
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        code
      )
    ) {
      this.loginStore
        .getTokenbyCode(code)
        .then(() => {
          this.bgService.initBackgroundLocation();
          this.configs.parseTagVariables(this.loginStore.userDetail.group);
          this.mapStore.getMarkersFromServer(this.configs);
          this.nav.navigate("Home");
          setTimeout(() => {
            this.bgService.configurePushNoti();
            if (!this.bgService.initialized) this.bgService.initialized = true;
          }, 2000);
        })
        .catch(err => {
          Alert.alert(err.message || "Login failed, please try again later.");
        });
    }
  };

  getTokenbyCode = code => {
    const details = {
      grant_type: "authorization_code",
      code,
      client_id: CLIENT_ID,
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

  pressHandler = url => {
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
        <Button onPress={() => this.pressHandler(loginURL)} title="Login" />
        <Button onPress={() => this.pressHandler(logoutURL)} title="Logout" />
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
