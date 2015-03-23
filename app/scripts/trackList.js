/** @jsx React.DOM */

window.TrackItem = React.createClass({displayName: "TrackItem",

	onClick: function() {
		this.props.onTrackClick(this.props.item);
	},
	render: function() {
		var item = this.props.item;

		var fontIcon = {
			sc: 'brand-icon fa fa-soundcloud',
            yt: 'brand-icon icon ion-social-youtube'
		};

		return (
			React.createElement("li", {id: 'track-item-' + item.id, className: "track-item"}, 
				React.createElement("a", {className: "original-link", href: item.originalUrl, title: "View Original"}, 
					React.createElement("i", {className: fontIcon[item.origin]})
	            ), 
				React.createElement("div", {className: "md-tile-left"}, 
					React.createElement("div", {className: "face"}, 
						React.createElement("img", {src: item.artworkUrl, alt: item.title}), 
						React.createElement("div", {className: "overlay"})
					), 
					React.createElement("span", {className: "dynamic-icon icon icon-playing"}), 
	                React.createElement("span", {className: "dynamic-icon fa fa-play fa-lg"}), 
	                React.createElement("span", {className: "dynamic-icon fa fa-pause fa-lg"})
				), 
				React.createElement("div", {className: "md-tile-content"}, 
					React.createElement("h3", {onClick: this.onClick}, item.title), 
					React.createElement("h4", null, item.user), 
					React.createElement("p", {className: "statistic"}, 
						React.createElement("i", {className: "icon ion-headphone"}), React.createElement("span", null, item.viewCount), 
						React.createElement("i", {className: "icon ion-heart"}), React.createElement("span", null, item.likeCount)
	                )
				), 
				React.createElement("div", {className: "md-tile-hover"}, 
	                React.createElement("button", {className: "md-button md-default-theme", title: "Like"}, 
	                    React.createElement("i", {className: "icon ion-android-star"})
	                ), 
	                React.createElement("button", {className: "md-button md-default-theme", title: "Add to playlist"}, 
	                    React.createElement("i", {className: "icon ion-android-add"})
	                ), 
	                React.createElement("button", {className: "md-button md-default-theme", title: "Remove"}, 
	                    React.createElement("i", {className: "icon ion-android-delete"})
	                )
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
		componentDidUpdate: React.PropTypes.func
	},
	render: function() {
		var items = this.props.tracks;
		var onTrackClick = this.props.onTrackClick;

		var rows = _.map(items, function(item) {
			return (
				React.createElement(TrackItem, {item: item, player: player, onTrackClick: onTrackClick})
			);
		});

		return (
			React.createElement("ul", {className: "media-list"}, 
				rows
			)
		)

	},
	componentDidUpdate: function() {
		this.props.componentDidUpdate();
	}
});