import React, {Component} from "react";
//import getMuiTheme from "material-ui/styles/getMuiTheme";
import RaisedButton from 'material-ui/RaisedButton';

//import CircularProgress from 'material-ui/CircularProgress';

import Logo from "../assets/img/logo.png";
import LogoBg from "../assets/img/logo-bg.png";


import "../assets/css/MainPage.css";
import ImgWithStatus from "../components/ImageWithStatus";


class MainPage extends Component {
	constructor(props){
		super(props);
		this.state = {
			name: props.name
		};

	}

	handleLoginForm() {
		console.log(123);
	}


	render(){
		//<CircularProgress color="#00daff" thickness="5" />

		return <div className="container__main">
			<div className="container__logo">
				<a href="/" className="container__logo-image">
					<ImgWithStatus src={LogoBg} className="container__logo-bg" />
					<ImgWithStatus src={Logo} className="container__logo-inside" />
				</a>
				<div className="block_spacer"></div>
				<h1 className="typography__logo">Ищейка</h1>
				<div className="typography__tagline">Найдем любую суку!</div>

				<div className="block_spacer block_spacer-80"></div>

				<RaisedButton label="Войти" className="mdl-button__primary--edited mdl-button__login" onTouchTap={this.handleLoginForm}/>

			</div>
		</div>
	}
}

export default MainPage;