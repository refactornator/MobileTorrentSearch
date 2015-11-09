'use strict';

var URI = require('URIjs');
var React = require('react-native');
var {
  StyleSheet,
  Animated,
  Easing,
  WebView,
  View,
} = React;

var screen = require('Dimensions').get('window');

class Login extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      slidingAnimationValue: new Animated.ValueXY({ x: 0, y: screen.height })
    };

    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
  }

  onNavigationStateChange(navState) {
    if(navState.url.startsWith('https://wl3.me/')) {
      var uri = URI(navState.url);
      var matches = uri.fragment().match(/access_token=(.*?)&/);
      if(matches.length === 2) {
        var accessToken = matches[1];
        this.props.onSuccessfulLogin(accessToken);
      }

      const animationConfig = {
        duration: 1000, // milliseconds
        delay: 0, // milliseconds
        easing: Easing.in(Easing.ease),
      }

      const value = this.state.slidingAnimationValue;
      const slidingInAnimation = Animated.timing(value, {
        ...animationConfig, // ES6 spread operator
        toValue: {
          x: 0,
          y: screen.height,
        },
      }).start();
    }
  }

  render(): ReactElement {
    return (
      <Animated.View
        style={[styles.container, {
          transform: this.state.slidingAnimationValue.getTranslateTransform()
        }]}>
        <WebView
          ref="webview"
          automaticallyAdjustContentInsets={false}
          style={{
            flex: 1,
          }}
          url="https://www.dropbox.com/1/oauth2/authorize?response_type=token&client_id=bjhv2i2vkyggj0e&redirect_uri=https://wl3.me"
          javaScriptEnabledAndroid={true}
          onNavigationStateChange={this.onNavigationStateChange}
          onShouldStartLoadWithRequest={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </Animated.View>
    );
  }
  componentDidMount() {
    const animationConfig = {
      duration: 1000, // milliseconds
      delay: 0, // milliseconds
      easing: Easing.in(Easing.ease),
    }

    const value = this.state.slidingAnimationValue;
    const slidingInAnimation = Animated.timing(value, {
      ...animationConfig, // ES6 spread operator
      toValue: {
        x: 0,
        y: 0,
      },
    }).start();
  }
}

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'red',
    justifyContent: 'center',
  },
});

module.exports = Login;