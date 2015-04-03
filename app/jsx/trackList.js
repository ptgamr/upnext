/** @jsx React.DOM */

window.TrackItem = React.createClass({
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
                <i className="remove-btn icon ion-close" onClick={this.onRemoveTrack} title="Remove"></i>
			);
		}

		if (context !== 'nowplaying') {
			playNextButton = (
				<i className="add-to-playlist-btn icon ion-log-in" title="Play Next" onClick={this.onPlayNext}></i>
			);
		}

		if (track.starred) {
			unstarButton = (
				<div className="starred">
					<i className="remove-btn icon ion-star" title="Remove Star" onClick={this.onStarTrack}></i>
				</div>
			)
		} else {
			starButton = (
				<i className="like-btn icon ion-star" title="Star" onClick={this.onStarTrack}></i>
			)
		}

		var className = 'track-item';

		if (track.error) {
			className += ' error';			
		}

		return (
			<li id={'track-item-' + track.id} className={className}>
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
			        {playNextButton}
			        <i className="add-to-playlist-btn icon ion-plus" title="Add to playlist" onClick={this.onAddTrackToPlaylist}></i>
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
					<TrackItem context={listContext} key={track.uuid} track={track} trackNumber={trackNumber} player={player} onTrackClick={onTrackClick} onAddTrackToPlaylist={onAddTrackToPlaylist} onRemoveTrack={onRemoveTrack} onStarTrack={onStarTrack} onPlayNext={onPlayNext}/>
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