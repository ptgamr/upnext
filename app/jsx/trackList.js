/** @jsx React.DOM */

window.TrackItem = React.createClass({

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
			<li id={'track-item-' + item.id} className='track-item'>
				<a className="original-link" href={item.originalUrl} title="View Original">
					<i className={fontIcon[item.origin]}></i>
	            </a>
				<div className='md-tile-left'>
					<div className='face'>
						<img src={item.artworkUrl} alt={item.title} />
						<div className="overlay"></div>
					</div>
					<span className="dynamic-icon icon icon-playing"></span>
	                <span className="dynamic-icon fa fa-play fa-lg"></span>
	                <span className="dynamic-icon fa fa-pause fa-lg"></span>
				</div>
				<div className='md-tile-content'>
					<h3 onClick={this.onClick}>{item.title}</h3>
					<h4>{item.user}</h4>
					<p className='statistic'>
						<i className='icon ion-headphone'></i><span>{item.viewCount}</span>
						<i className='icon ion-heart'></i><span>{item.likeCount}</span>
	                </p>
				</div>
				<div className="md-tile-hover">
	                <button className="md-button md-default-theme" title="Like">
	                    <i className="icon ion-android-star"></i>
	                </button>
	                <button className="md-button md-default-theme" title="Add to playlist">
	                    <i className="icon ion-android-add"></i>
	                </button>
	                <button className="md-button md-default-theme" title="Remove">
	                    <i className="icon ion-android-delete"></i>
	                </button>
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
		componentDidUpdate: React.PropTypes.func
	},
	render: function() {
		var items = this.props.tracks;
		var onTrackClick = this.props.onTrackClick;

		var rows = _.map(items, function(item) {
			return (
				<TrackItem item={item} player={player} onTrackClick={onTrackClick}/>
			);
		});

		return (
			<ul className="media-list">
				{rows}
			</ul>
		)

	},
	componentDidUpdate: function() {
		this.props.componentDidUpdate();
	}
});