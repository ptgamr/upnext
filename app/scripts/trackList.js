/** @jsx React.DOM */

window.TrackItem = React.createClass({displayName: "TrackItem",
    onClick: function() {
        if (this.props.onTrackClick)
            this.props.onTrackClick(this.props.track, this.props.trackNumber - 1);
    },
    onPlayNext: function() {
        if (this.props.onPlayNext)
            this.props.onPlayNext(this.props.track);
    },
    onAddTrackToPlaylist: function() {
        if (this.props.onAddTrackToPlaylist)
            this.props.onAddTrackToPlaylist(this.props.track);
    },
    onRemoveTrack: function() {
        if (this.props.onRemoveTrack)
            this.props.onRemoveTrack(this.props.track);
    },
    onStarTrack: function() {
        if (this.props.onStarTrack)
            this.props.onStarTrack(this.props.track);
    },
    seconds2time: function (value) {
        if (!value || value < 0) return 'N/A';
        var hours = Math.floor(value / 3600),
            mins = '0' + Math.floor((value % 3600) / 60),
            secs = '0' + Math.floor((value % 60));
            mins = mins.substr(mins.length - 2);
            secs = secs.substr(secs.length - 2);
        if(!isNaN(secs)){
            if (hours){
                return hours+':'+mins+':'+secs;
            } else {
                return mins+':'+secs;
            };
        } else {
            return '00:00';
        };
    },
    render: function() {
        var track = this.props.track;
        var context = this.props.context || 'nowplaying';

        if (!track) return;

        var fontIcon = {
            sc: 'brand-icon icon-soundcloud',
            yt: 'brand-icon icon ion-social-youtube-outline'
        };

        var removeButton, playNextButton, unstarButton, starButton;

        if (context === 'nowplaying' || context === 'playlist') {
            removeButton = (
                React.createElement("i", {className: "remove-btn icon ion-close", onClick: this.onRemoveTrack, title: "Remove"})
            );
        }

        if (context !== 'nowplaying') {
            playNextButton = (
                React.createElement("i", {className: "add-to-playlist-btn icon ion-log-in", title: "Play Next", onClick: this.onPlayNext})
            );
        }

        if (track.starred) {
            unstarButton = (
                React.createElement("div", {className: "starred"}, 
                    React.createElement("i", {className: "remove-btn icon ion-star", title: "Remove Star", onClick: this.onStarTrack})
                )
            )
        } else {
            starButton = (
                React.createElement("i", {className: "like-btn icon ion-star", title: "Star", onClick: this.onStarTrack})
            )
        }

        var className = 'track-item';

        if (track.error) {
            className += ' error';
        }

        return (
            React.createElement("li", {id: 'track-item-' + track.id, className: className}, 
                React.createElement("div", {className: "md-tile-left", onClick: this.onClick}, 
                    React.createElement("div", {className: "face"}, 
                        React.createElement("img", {src: track.artworkUrl, alt: track.title})
                    )
                ), 
                React.createElement("div", {className: "play-actions", onClick: this.onClick}, 
                    React.createElement("span", {className: "track-number"}, this.props.trackNumber), 
                    React.createElement("i", {className: "dynamic-icon icon icon-playing"}), 
                    React.createElement("i", {className: "dynamic-icon icon ion-ios-play"}), 
                    React.createElement("i", {className: "dynamic-icon icon ion-ios-pause"})
                ), 
                unstarButton, 
                React.createElement("div", {className: "md-tile-content"}, 
                    React.createElement("h3", {onClick: this.onClick}, track.title), 
                    React.createElement("p", {className: "statistic"}, 
                        React.createElement("a", {className: "original-link", href: track.originalUrl, title: "View Original"}, 
                            React.createElement("i", {className: fontIcon[track.origin]})
                        ), 
                        React.createElement("i", {className: "icon ion-headphone"}), React.createElement("span", null, parseInt(track.viewCount).toLocaleString()), 
                        React.createElement("i", {className: "icon ion-heart"}), React.createElement("span", null, parseInt(track.likeCount).toLocaleString()), 
                        React.createElement("i", {className: "icon ion-clock"}), React.createElement("span", null, this.seconds2time(track.duration))
                    )
                ), 
                React.createElement("div", {className: "md-tile-hover"}, 
                    starButton, 
                    playNextButton, 
                    React.createElement("i", {className: "add-to-playlist-btn icon ion-plus", title: "Add to playlist", onClick: this.onAddTrackToPlaylist}), 
                    removeButton
                )
            )
        );
    }
});

window.TrackList = React.createClass({displayName: "TrackList",
    propTypes: {
        tracks: React.PropTypes.array,
        trackClick: React.PropTypes.string,
        onTrackClick: React.PropTypes.func,
        onPlayNext: React.PropTypes.func,
        onAddTrackToPlaylist: React.PropTypes.func,
        onStarTrack: React.PropTypes.func,
        onRemoveTrack: React.PropTypes.func,
        componentDidUpdate: React.PropTypes.func,
        listContext: React.PropTypes.string
    },
    render: function() {
        var tracks = this.props.tracks;
        var onTrackClick = this.props.onTrackClick;
        var onAddTrackToPlaylist = this.props.onAddTrackToPlaylist;
        var onRemoveTrack = this.props.onRemoveTrack;
        var onStarTrack = this.props.onStarTrack;
        var onPlayNext = this.props.onPlayNext;
        var listContext = this.props.listContext;

        var trackNumber = 0;
        var rows = _.map(tracks, function(track) {

            trackNumber ++;

            if (track) {
                return (
                    React.createElement(TrackItem, {context: listContext, key: track.uuid, track: track, trackNumber: trackNumber, player: player, onTrackClick: onTrackClick, onAddTrackToPlaylist: onAddTrackToPlaylist, onRemoveTrack: onRemoveTrack, onStarTrack: onStarTrack, onPlayNext: onPlayNext})
                );
            }
        });

        return (
            React.createElement("ul", {className: "media-list"}, 
                rows
            )
        )

    },
    componentDidUpdate: function() {
        if (this.props.componentDidUpdate) {
            this.props.componentDidUpdate();
        }
    }
});