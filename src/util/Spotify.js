let accessToken;

const clientID = '196af1492fa14bb2abfffd8b730f6647';
const redirectURI = "http://jamminggina.surge.sh";

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }
        
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = expiresInMatch[1];
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`
        }
    },

    search(term) {
        accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, 
        {
            headers: {Authorization: `Bearer ${accessToken}`}
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return [];
            } 
            return jsonResponse.tracks.items.map(track => ({
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri
                }));
        })
    },

    savePlaylist(name, trackURIs) {
        if (!name || !trackURIs.length) {
            return;
        }

        accessToken = Spotify.getAccessToken();
        const headers = {Authorization: `Bearer ${accessToken}`};
        let userID;
        
        //get current user's ID
        return fetch('https://api.spotify.com/v1/me', {
            headers: headers
        }).then(response => response.json()
        ).then(jsonResponse => {
            userID = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`,
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ name: name })
            }).then(response => response.json()
            ).then(jsonResponse => {
                let playlistID = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks
                `, 
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ uris: trackURIs })
                });
            });
        });
        }
    };

export default Spotify;