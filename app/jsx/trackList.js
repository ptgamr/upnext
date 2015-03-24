/** @jsx React.DOM */

window.TrackItem = React.createClass({
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
		
		if (this.props.showRemoveButton === 'true') {
			removeButton = (
				<button className="remove-btn md-button md-default-theme" onClick={this.onRemoveTrack} title="Remove">
	                <i className="icon ion-android-delete"></i>
	            </button>
			);
		}

		return (
			<li id={'track-item-' + track.id} className='track-item'>
				<a className="original-link" href={track.originalUrl} title="View Original">
					<i className={fontIcon[track.origin]}></i>
	            </a>
				<div className='md-tile-left' onClick={this.onClick}>
					<div className='face'>
						<img src={track.artworkUrl} alt={track.title} />
						<div className="overlay"></div>
					</div>
					<span className="dynamic-icon icon icon-playing"></span>
	                <span className="dynamic-icon fa fa-play fa-lg"></span>
	                <span className="dynamic-icon fa fa-pause fa-lg"></span>
				</div>
				<div className='md-tile-content'>
					<h3 onClick={this.onClick}>{track.title}</h3>
					<h4>{track.user}</h4>
					<p className='statistic'>
						<i className='icon ion-headphone'></i><span>{parseInt(track.viewCount).toLocaleString()}</span>
						<i className='icon ion-heart'></i><span>{parseInt(track.likeCount).toLocaleString()}</span>
	                </p>
				</div>
				<div className="md-tile-hover">
	                <button className="like-btn md-button md-default-theme" title="Like">
	                    <i className="icon ion-android-star"></i>
	                </button>
	                <button className="add-to-playlist-btn md-button md-default-theme" onClick={this.onAddTrackToPlaylist} title="Add to playlist">
	                    <i className="icon ion-android-add"></i>
	                </button>
	                {removeButton}
	            </div>
			</li>
		);
	}
});

window.TrackList = React.createClass({
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
		var showRemoveButton = this.props.showRemoveButton;

		var rows = _.map(tracks, function(track) {

			if (track) {
				return (
					<TrackItem track={track} player={player} onTrackClick={onTrackClick} onAddTrackToPlaylist={onAddTrackToPlaylist} onRemoveTrack={onRemoveTrack} showRemoveButton={showRemoveButton}/>
				);
			}
		});

		return (
			<ul className="media-list">
				{rows}
			</ul>
		)

	},
	componentDidUpdate: function() {
		if (this.props.componentDidUpdate) {
			this.props.componentDidUpdate();
		}
	}
});