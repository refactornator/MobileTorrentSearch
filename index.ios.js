/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var URI = require('URIjs');
var PrettyBytes = require('pretty-bytes');
var Moment = require('moment');
var He = require('he');
var { Icon, } = require('react-native-icons');
var React = require('react-native');
var {
  ActivityIndicatorIOS,
  TouchableHighlight,
  ActionSheetIOS,
  AsyncStorage,
  AppRegistry,
  StyleSheet,
  ListView,
  Text,
  View,
} = React;

var Login = require('./pages/Login');

var SearchBar = require('react-native-search-bar');
var kat = require('./support/kickass-torrents');

const STORAGE_KEY = '@Dropbox:ACCESS_KEY';

var ACCESS_KEY;

AsyncStorage.getItem(STORAGE_KEY).then(function(value) {
  ACCESS_KEY = value;
});

var BUTTONS = [
  'Download to Dropbox',
  'Hide',
  'Cancel',
];

var CATEGORY_TO_ICON_MAP = {
  'TV': 'material|tv',
  'Movies': 'material|movie',
  'Books': 'material|book',
  'Anime': 'material|flower-alt',
  'XXX': 'material|explicit',
  'Games': 'material|gamepad',
  'Music': 'material|album',
  'Other': 'material|archive'
}

var CANCEL_INDEX = 2;

var screen = require('Dimensions').get('window');
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
var MobileTorrentSearch = React.createClass({
  getInitialState: function() {
    return {
      searching: false,
      login: false,
      results: [],
      dataSource: ds.cloneWithRows([]),
    };
  },

  _renderRow: function(data, sectionID, rowID, highlightRow) {
    var title = He.decode(data.title);
    var readableSize = PrettyBytes(data.size);
    var iconName = data.category in CATEGORY_TO_ICON_MAP ? CATEGORY_TO_ICON_MAP[data.category] : CATEGORY_TO_ICON_MAP['Other'];
    var readablePublishDate = Moment(new Date(data.pubDate)).fromNow(true);

    return (
      <TouchableHighlight key={data.guid} onPress={() => this._pressRow(data.guid)}>
        <View style={[styles.row]}>
          <View style={styles.title}>
            <Icon
              name={iconName}
              size={15}
              color='black'
              style={styles.categoryIcon} />
            <Text style={{width: screen.width - 30}}>{title}</Text>
          </View>
          <View style={styles.stats}>
            <Text>{readablePublishDate} old</Text>
            <Text> | </Text>
            <Text>{data.seeds} S</Text>
            <Text> | </Text>
            <Text>{data.leechs} L</Text>
            <Text> | </Text>
            <Text>{data.files} files - {readableSize}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  },

  _pressRow: function(id) {
    var pressedResult = this.state.results.filter(function(item) {
      return id === item.guid;
    })[0];

    var torrentURL = URI(pressedResult.torrentLink).query('').toString();
    var title = pressedResult.title;

    ActionSheetIOS.showActionSheetWithOptions({
      options: BUTTONS,
      cancelButtonIndex: CANCEL_INDEX,
    },
    (buttonIndex) => {
      if(BUTTONS[buttonIndex] === 'Hide') {
        this._removeResult(id);
      } else if(BUTTONS[buttonIndex] === 'Download to Dropbox') {
        if(ACCESS_KEY !== null) {
          fetch(`https://api.dropbox.com/1/save_url/auto/${title}.torrent`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${ACCESS_KEY}`
            },
            body: `url=${torrentURL}`
          })
          .then((response) => {
            if(response.status === 401) {
              this.setState({
                login: true
              });
            } else if (response.status === 200) {
              this._removeResult(id);
            }
          })
          .catch((error) => {
            console.error(error);
          });
        } else {
          this.setState({
            login: true
          });
        }
      }
    });
  },

  _removeResult: function(id) {
    var newResults = this.state.results.filter(function(item) {
      return id !== item.guid;
    });

    this.setState({
      results: newResults,
      dataSource: ds.cloneWithRows(newResults),
    });
  },

  onSearch: function(value) {
    this.refs.searchBar.blur(); //Hide Keyboard

    this.setState({
      searching: true
    });

    kat.search(value).then((data) => {
      this.setState({
        results: data.results,
        dataSource: ds.cloneWithRows(data.results),
        searching: false
      });
    }).catch(function (error) {
        console.error(error);
    });
  },

  onCancel: function() {
    this.refs.searchBar.blur(); //Hide Keyboard
  },

  onChangeText: function(value) {
    if(value.length === 0) {
      this.setState({
        results: [],
        dataSource: ds.cloneWithRows([]),
        searching: false
      });
    }
  },

  onLogin: function(accessKey) {
    AsyncStorage.setItem(STORAGE_KEY, accessKey);
    ACCESS_KEY = accessKey;

    this.setState({
      login: false
    });
  },

  render: function() {
    var content;
    if(this.state.searching) {
      content = <View style={styles.centering}>
          <ActivityIndicatorIOS
            animating={true}
            style={{height: 80}}
            size="large"/>
        </View>;
    } else {
      content = <ListView
        dataSource={this.state.dataSource}
        renderRow={this._renderRow} />;
    }

    return (
      <View style={styles.container}>
        <SearchBar
          ref='searchBar'
          style={styles.searchBar}
          placeholder='Torrent Search'
          onChangeText={this.onChangeText}
          onSearchButtonPress={this.onSearch}
          onCancelButtonPress={this.onCancel} />

        {content}

        {this.state.login ? <Login onSuccessfulLogin={this.onLogin} /> : false}
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: '#fff'
  },
  searchBar: {
    height: 40,
    marginTop: 30
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'column',
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 4,
    padding: 4,
    backgroundColor: '#F6F6F6',
    borderRadius: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 1,
    shadowOffset: {
      height: 1,
      width: 0
    }
  },
  title: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  categoryIcon: {
    width: 16,
    height: 16
  },
});

AppRegistry.registerComponent('MobileTorrentSearch', () => MobileTorrentSearch);
