/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  ListView,
  Text,
  View,
} = React;

var SearchBar = require('react-native-search-bar');

var MobileTorrentSearch = React.createClass({
  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      dataSource: ds.cloneWithRows(['row 1', 'row 2']),
    };
  },

  onSearch: function(value) {
    console.log('search for:', value);
  },

  render: function() {
    return (
      <View>
        <SearchBar
          placeholder='Search'
          onSearchButtonPress={this.onSearch} />
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

AppRegistry.registerComponent('MobileTorrentSearch', () => MobileTorrentSearch);
