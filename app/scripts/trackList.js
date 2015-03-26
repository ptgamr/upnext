/** @jsx React.DOM */

window.TrackItem = React.createClass({displayName: "TrackItem",
	onClick: function() {
		if (this.props.onTrackClick)
			this.props.onTrackClick(this.props.track, this.props.trackNumber - 1);
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
	render: function() {
		var track = this.props.track;

		var fontIcon = {
			sc: 'brand-icon fa fa-soundcloud',
            yt: 'brand-icon icon ion-social-youtube-outline'
		};

		var removeButton, unstarButton, starButton;
		
		if (this.props.showRemoveButton === 'true') {
			removeButton = (
                React.createElement("i", {className: "remove-btn icon ion-android-delete", onClick: this.onRemoveTrack, title: "Remove"})
			);
		}

		if (track.starred) {
			unstarButton = (
				React.createElement("div", {className: "starred"}, 
					React.createElement("i", {className: "remove-btn icon ion-ios-star", title: "Remove Star"})
				)
			)
		} else {
			starButton = (
				React.createElement("i", {className: "like-btn icon ion-android-star", onClick: this.onStarTrack})
			)
		}

		return (
			React.createElement("li", {id: 'track-item-' + track.id, className: "track-item"}, 
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
						React.createElement("i", {className: "icon ion-heart"}), React.createElement("span", null, parseInt(track.likeCount).toLocaleString())
	                )
				), 
				React.createElement("div", {className: "md-tile-hover"}, 
			        starButton, 
			        React.createElement("i", {className: "add-to-playlist-btn icon ion-android-add", onClick: this.onAddTrackToPlaylist}), 
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
		onAddTrackToPlaylist: React.PropTypes.func,
		onStarTrack: React.PropTypes.func,
		onRemoveTrack: React.PropTypes.func,
		componentDidUpdate: React.PropTypes.func,
		showRemoveButton: React.PropTypes.bool
	},
	render: function() {
		var tracks = this.props.tracks;
		var onTrackClick = this.props.onTrackClick;
		var onAddTrackToPlaylist = this.props.onAddTrackToPlaylist;
		var onRemoveTrack = this.props.onRemoveTrack;
		var showRemoveButton = this.props.showRemoveButton;
		var onStarTrack = this.props.onStarTrack;

		var trackNumber = 0;
		var rows = _.map(tracks, function(track) {

			trackNumber ++;

			if (track) {
				return (
					React.createElement(TrackItem, {track: track, trackNumber: trackNumber, player: player, onTrackClick: onTrackClick, onAddTrackToPlaylist: onAddTrackToPlaylist, onRemoveTrack: onRemoveTrack, showRemoveButton: showRemoveButton, onStarTrack: onStarTrack})
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