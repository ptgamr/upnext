/** @jsx React.DOM */

window.TrackItem = React.createClass({displayName: "TrackItem",
	onClick: function() {
		if (this.props.onTrackClick)
			this.props.onTrackClick(this.props.track);
	},
	onAddTrackToPlaylist: function() {
		if (this.props.onAddTrackToPlaylist)
			this.props.onAddTrackToPlaylist(this.props.track);
	},
	onRemoveTrack: function() {
		if (this.props.onRemoveTrack)
			this.props.onRemoveTrack(this.props.track);
	},
	render: function() {
		var track = this.props.track;

		var fontIcon = {
			sc: 'brand-icon fa fa-soundcloud',
            yt: 'brand-icon icon ion-social-youtube'
		};

		var removeButton;

		if (this.props.showRemoveButton) {
			removeButton = (
				React.createElement("button", {className: "remove-btn md-button md-default-theme", onClick: this.onRemoveTrack, title: "Remove"}, 
	                React.createElement("i", {className: "icon ion-android-delete"})
	            )
			);
		}

		return (
			React.createElement("li", {id: 'track-item-' + track.id, className: "track-item"}, 
				React.createElement("a", {className: "original-link", href: track.originalUrl, title: "View Original"}, 
					React.createElement("i", {className: fontIcon[track.origin]})
	            ), 
				React.createElement("div", {className: "md-tile-left", onClick: this.onClick}, 
					React.createElement("div", {className: "face"}, 
						React.createElement("img", {src: track.artworkUrl, alt: track.title}), 
						React.createElement("div", {className: "overlay"})
					), 
					React.createElement("span", {className: "dynamic-icon icon icon-playing"}), 
	                React.createElement("span", {className: "dynamic-icon fa fa-play fa-lg"}), 
	                React.createElement("span", {className: "dynamic-icon fa fa-pause fa-lg"})
				), 
				React.createElement("div", {className: "md-tile-content"}, 
					React.createElement("h3", {onClick: this.onClick}, track.title), 
					React.createElement("h4", null, track.user), 
					React.createElement("p", {className: "statistic"}, 
						React.createElement("i", {className: "icon ion-headphone"}), React.createElement("span", null, parseInt(track.viewCount).toLocaleString()), 
						React.createElement("i", {className: "icon ion-heart"}), React.createElement("span", null, parseInt(track.likeCount).toLocaleString())
	                )
				), 
				React.createElement("div", {className: "md-tile-hover"}, 
	                React.createElement("button", {className: "like-btn md-button md-default-theme", title: "Like"}, 
	                    React.createElement("i", {className: "icon ion-android-star"})
	                ), 
	                React.createElement("button", {className: "add-to-playlist-btn md-button md-default-theme", onClick: this.onAddTrackToPlaylist, title: "Add to playlist"}, 
	                    React.createElement("i", {className: "icon ion-android-add"})
	                ), 
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
		onRemoveTrack: React.PropTypes.func,
		componentDidUpdate: React.PropTypes.func,
		showRemoveButton: React.PropTypes.bool
	},
	render: function() {
		var tracks = this.props.tracks;
		var onTrackClick = this.props.onTrackClick;
		var onAddTrackToPlaylist = this.props.onAddTrackToPlaylist;
		var onRemoveTrack = this.props.onRemoveTrack;
		var showRemoveButton = typeof this.props.showRemoveButton === 'undefined' ? true : this.props.showRemoveButton;

		var rows = _.map(tracks, function(track) {
			return (
				React.createElement(TrackItem, {track: track, player: player, onTrackClick: onTrackClick, onAddTrackToPlaylist: onAddTrackToPlaylist, onRemoveTrack: onRemoveTrack, showRemoveButton: showRemoveButton})
			);
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