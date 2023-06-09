import React from 'react';
import './App.css';
import { SearchBar } from '../SearchBar/SearchBar';
import { SearchResults } from '../SearchResults/SearchResults';
import { Playlist } from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = { 
      searchResults: [], 
      playlistName: 'New Playlist',
      playlistTracks: []
    };
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    let tracks = this.state.playlistTracks;
    if (tracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    tracks.push(track);
    this.setState({ playlistTracks: tracks });
  }

  removeTrack(track) {
    let tracks = this.state.playlistTracks.filter(playlistTrack => playlistTrack.id !== track.id)
    this.setState({ playlistTracks: tracks });
  }

  savePlaylist() {
    let trackURIs = [];
    this.state.playlistTracks.forEach(track => trackURIs.push(track.uri));
    Spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
      this.setState({
        playlistName: 'New Playlist',
        playlistTracks: []
      });
    });
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name })
  }

  search(term) {
    Spotify.search(term).then(searchResults => {
      let results = [];
      let tracks = this.state.playlistTracks;

      searchResults.forEach(result => {
        if (!(tracks.map(track => track.uri).includes(result.uri))) {
          results.push(result);
        }
      });
      
      this.setState({ searchResults: results });
      
    });
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
        <SearchBar onSearch={this.search} />
        <div className="App-playlist">
        <SearchResults searchResults={this.state.searchResults} 
          onAdd={this.addTrack} />
        <Playlist name={this.state.playlistName} 
          playlistTracks={this.state.playlistTracks}
          onRemove = {this.removeTrack}
          onNameChange = {this.updatePlaylistName}
          onSave = {this.savePlaylist} />
        </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener('load', Spotify.search(''));
  }
}

export default App;
