import React, {Component} from 'react';

class ImgWithStatus extends Component {
	constructor(props) {
		super(props);

		this.state = {
			imageStatus: null,
			_className: props.className || "",
			className: props.className || ""
		};
		/*var obj = { a: 1 };
		 var copy = Object.assign({}, obj);
		 console.log(copy); // { a: 1 }*/
	}

	setImageStatus(status){
		this.setState((prevState, props) => {
			return {className: prevState._className + " " + status}
		});
	}

	handleImageLoaded() {
		this.setImageStatus("loaded");
	}

	handleImageErrored() {
		this.setImageStatus("errored");
	}

	render() {
		return <img
					src={this.props.src}
					onLoad={this.handleImageLoaded.bind(this)}
					onError={this.handleImageErrored.bind(this)}
				    className={ this.state.className }
		            alt=""
				/>;
	}
}
export default ImgWithStatus;