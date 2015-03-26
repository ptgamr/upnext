/** @jsx React.DOM */

window.TrackItem = React.createClass({
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

		if (!track) return;

		var fontIcon = {
			sc: 'brand-icon fa fa-soundcloud',
            yt: 'brand-icon icon ion-social-youtube-outline'
		};

		var removeButton, unstarButton, starButton;
		
		if (this.props.showRemoveButton === 'true') {
			removeButton = (
                <i className="remove-btn icon ion-android-delete" onClick={this.onRemoveTrack} title="Remove"></i>
			);
		}

		if (track.starred) {
			unstarButton = (
				<div className="starred">
					<i className="remove-btn icon ion-ios-star" title="Remove Star"></i>
				</div>
			)
		} else {
			starButton = (
				<i className="like-btn icon ion-android-star" onClick={this.onStarTrack}></i>
			)
		}

		return (
			<li id={'track-item-' + track.id} className='track-item'>
				<div className='md-tile-left' onClick={this.onClick}>
					<div className='face'>
						<img src={track.artworkUrl} alt={track.title} />
					</div>
				</div>
				<div className="play-actions" onClick={this.onClick}>
					<span className="track-number">{this.props.trackNumber}</span>
					<i className="dynamic-icon icon icon-playing"></i>
					<i className="dynamic-icon icon ion-ios-play"></i>
					<i className="dynamic-icon icon ion-ios-pause"></i>
				</div>
				{unstarButton}
				<div className='md-tile-content'>
					<h3 onClick={this.onClick}>{track.title}</h3>
					<p className='statistic'>
						<a className="original-link" href={track.originalUrl} title="View Original">
							<i className={fontIcon[track.origin]}></i>
			            </a>
						<i className='icon ion-headphone'></i><span>{parseInt(track.viewCount).toLocaleString()}</span>
						<i className='icon ion-heart'></i><span>{parseInt(track.likeCount).toLocaleString()}</span>
	                </p>
				</div>
				<div className="md-tile-hover">
			        {starButton}
			        <i className="add-to-playlist-btn icon ion-android-add" onClick={this.onAddTrackToPlaylist}></i>
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
					<TrackItem track={track} trackNumber={trackNumber} player={player} onTrackClick={onTrackClick} onAddTrackToPlaylist={onAddTrackToPlaylist} onRemoveTrack={onRemoveTrack} showRemoveButton={showRemoveButton} onStarTrack={onStarTrack}/>
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