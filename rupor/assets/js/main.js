/**
 * Created by undershot on 24.09.2016.
 */

(function($, window){


	var Loader = {
		elem: $("#loader"),
		_elem: null,
		isActive: false,
		show: function () {
			if( this.isActive ) return false;

			this.elem.children("div.mdl-spinner").addClass("is-active");
			this.elem.addClass("is-active");

			this.isActive = true;
		},
		hide: function () {
			if( !this.isActive ) return false;

			this.elem.removeClass("is-active");
			this.elem.children("div.mdl-spinner").removeClass("is-active");

			this.isActive = false;
		},
		getCopy: function () {
			return this.elem.copy();
		},
		pasteInto: function (el) {
			el.append( this.elem );
		},
		pasteDefault: function () {
			this.pasteInto($(document.body));
		}
	};


	var Error = {

		errElement: null,

		init: function () {
			var mdlSnackbar = $('#mdl-snackbar');

			if( mdlSnackbar.length ) this.errElement = mdlSnackbar[0].MaterialSnackbar;
			this.runQueued();
		},
		runQueued: function () {
			var e = this.errQueued.length;
			if( !e ) return false;

			for( var i=0; i<e; i++ ){
				this.errQueued[i].call();
			}
		},
		hide: function () {
			if( !this.errElement ) return false;

			this.errElement.cleanup_();
		},
		showErr: function (errData) {

			var self = this,
				defCallback = function () {
					Error.hide();
				},
				f = function(){
					var data = {
						message: errData.message || "Ошибка",
						actionHandler: errData.callback || defCallback,
						actionText: errData.btnLabel || "Ок",
						timeout: 60 * 60 * 1000
					};

					self.errElement.showSnackbar(data);

					return data;
				};

			return !self.errElement ? self.errQueued.push(f) : f.call();
		},
		show: function (errData) {
			var self = this;

			return this.showErr(errData);
		},
		errQueued: []
	};


	$(window).on("load", function () {
		Error.init();
	});



	/* Ajax Serrings */
	$(document).ajaxError(function() {
		Error.show({
			message: "Неизвестная ошибка"
		})
	});





	$.fn.toggleText = function(t1, t2){
		if(this.text() == t1) this.html(t2);
		else                  this.html(t1);
		return this;
	};

	$("button.btn-task-wont").on("click", function(){
		$(this).toggleClass("mdl-color-text--black");

		$(this).toggleText( "Отменить", "Отказаться" );

		var taskId = $(this).data("taskid"),
				task = $("#task_not_form" + taskId);

		task.fadeToggle( 150, "linear" );
	});


	if( $("#sprites").length ){

		$(window).on("load", function () {
			var logo = $("a.main-logo-lg"),
				i = 0;


			logo.children("i.logo-lg-wave").each(function(i){
				var self = $(this);

				setTimeout(function () {
					self.addClass("animated");
				}, 200 * i);
			});
		});


	}
	var tbl = $("table.dashboard-table");


	if( tbl.length ){

		tbl.each(function(){

			var rows = $(this).find("tr"),
				topTr = rows.filter(".tl_title"),
				bRows = rows.filter(":not(.tl_title)"),
				trObj = [];

			topTr.children("td").map(function(a,b){
				trObj.push(b.innerHTML);
			});

			bRows.each(function(){
				for( var i=1, colsLength = trObj.length; i<colsLength; i++ ){
					$(this).children("td").eq(i).prepend("<span class='table-mobile-label mobile-only'>" + trObj[i] + "</span>");
				}

			});

		});

	}

	var user = window.user;



	$("dialog").each(function(){
		dialogPolyfill.registerDialog(this);
	});

	$("button.dialog-close").on("click", function () {
		var d = $(this).parents("dialog.mdl-dialog");
		d[0].close();

		Loader.hide();

		//d.removeClass("mdl-dialog-close");
	});



	if( user && user.id ){
		var userBehavior = {
			sortList: null,
			setProfile: function( data ){
				user.profile = data;

				$("#profile-avatar").attr("src", user.profile.photo_50);
				$("#side-name").html(user.profile.first_name + " " + user.profile.last_name );
			},
			setFriends: function( data ){
				data.items = $.grep(data.items, function(i){
					return !i.deactivated;
				});

				user.vkFriends = data;

				/*user.profile = data;

				 $("#profile-avatar").attr("src", user.profile.photo_50);
				 $("#side-name").html(user.profile.first_name + " " + user.profile.last_name );*/
			},
			lastRendered: 0,
			maxRenderCount: 20,
			htmlFriendsList: '',
			isRendered: false,
			lastMaxScroll: 0,
			mainRendered: "",
			renderFriends: function( /* [0] - custom friends items */ ){

				if( !arguments.length && (typeof user.vkFriends == "undefined" || !!this.isRendered) ){
					return false;
				}

				var items = !arguments.length ? user.vkFriends.items : arguments[0];

				var vkFriendsCount = items.length;
/*
				if( (this.lastRendered + this.maxRenderCount) > vkFriendsCount ) this.maxRenderCount = vkFriendsCount;
				else this.maxRenderCount = this.lastRendered + this.maxRenderCount;*/

				//user.vkFriends.count - 1

				var friends = '',
					frItems = items;

				for(var i = 0; i < vkFriendsCount; i++ ){
					friends += "<li class='vkFriends-list-item" + (i >= this.maxRenderCount ? " hidden" : "") + "' data-vkId='http://vk.com/id" + frItems[i].id + "'>" + "<img src='" + frItems[i].photo_50 + "' class='vkFriends-list-avatar'>" + "<span class='vkFriends-list-name name'>" + frItems[i].first_name + " " + frItems[i].last_name + "</span></li>";
				}

				//this.lastRendered = this.maxRenderCount;

				//this.isRendered = false;

				return friends;
			},
			pasteRenderedToModal: function ( appendTo, html ) {
				appendTo.attr("class", "vkFriends list").html( html );

				this.htmlFriendsList = $("#vkFriends li");

				this.lastMaxScroll = 0;
				this.lastRendered = 0;

				this.setButtonClass();
			},
			_checkTasksStatusTimer: null,
			_checkTasksStatusInterval: 10 * (60 * 1000),
			checkTasksStatus: function () {

				this._checkTasksStatusTimer = setInterval(function () {

					$.ajax({
						url: location.href,
						success: function (d) {
							var $msg = $(d);


							$("#__List").html( $msg.filter("#__List").html() );

							//__List	$()
						}
					});

				}, this._checkTasksStatusInterval);


			},
			showHiddenFriends: function (min, max) {
				this.htmlFriendsList.slice( min, max ).removeClass("hidden");
			},
			initListJs: function(){
				var options = {
					valueNames: [ 'name' ]
				};

				this.setButtonClass();

				/*if( !this.sortList ) this.sortList = new List('vkFriendsList', options);
				else this.sortList.reIndex();*/
			},
			maxInviteForOne: 1,
			canCheckUser: true,
			checkCanAdd: function(){
				this.canCheckUser = !(user.toInvite.length && user.toInvite.length == this.maxInviteForOne);
			},
			setButtonClass: function(){
				var inviteBtn = $("#btnInviteFriends");

				if( !!user.toInvite.length ){
					inviteBtn.removeAttr("disabled");
				} else if( !inviteBtn.attr("disabled") ){
					inviteBtn.attr("disabled", "disabled");
				}
			},
			getFriendsData: function (opts) {
				var defOpts = {
					photoSize: "photo_50",
					list: window.friends
				};

				opts = opts || defOpts;

				if( opts.list ){

					var friends = opts.list,
							friendsIds = $.map(friends, function (a) {
								return a.replace("id","");
							});

					var req = "https://api.vk.com/method/users.get?user_ids=" + friendsIds.join(",") + "&fields=photo_50,photo_100&v=5.8";

					$.ajax({
						url : req,
						type : "GET",
						async: true,
						dataType : "jsonp",
						success: function(msg){
							var data = msg.response;

							if( !data.length ) return false;

							$("img.table-avatar").each(function () {
								var s = $(this).data("vkid");

								for( var i = 0, di = data.length; i < di; i++ ){
									if( data[i].id == s.replace("id","") ){
										$(this).attr("src", data[i][opts.photoSize]);
									}
								}
							});
						}
					});
				}
			},
			lastListScrolled: 0,
			doInviteFriend: function () {
				var dialog = $("#newUserDialog");

				var data = user.toInvite.length > 1 ? user.toInvite : user.toInvite[0];

				userBehavior.setButtonClass();

				//Loader.pasteInto( $("#vkFriendsList") );

				Loader.show();

				$.ajax({
					url : "/",
					type : "POST",
					data: {
						"new_part": data
					},
					success: function(msg){
						var toFriends,
							$msg = $(msg),
							e = $msg.filter("#error");

						if( e.length ) {
							//#vkFriends

							Error.show({
								message: e.html()
							});
						} else{

							$.map( user.vkFriends.items, function (i, c) {
								if( typeof i != "object" ){
									return;
								}

								if( data.indexOf("http://vk.com/id" + i.id) != -1 ){
									user.vkFriends.items.splice(c, c + 1);
								}
							});

							if( typeof data == "object" ){
								toFriends = $.map(data, function (a) {
									return a.match(/id[\d]+/)[0];
								});
							} else toFriends = data.match(/id[\d]+/)[0];

							window.friends = window.friends.concat(toFriends);

							$("#__List").html( $msg.find("#__List").html() );

							userBehavior.getFriendsData();
						}

						dialog[0].close();

						Loader.hide();
						Loader.pasteDefault();
					},
					error: function() {
						dialog[0].close();

						Loader.hide();
						Loader.pasteDefault();
					}
				});
			}

		};

		function debounce(fn, delay) {
			var timer = null;
			return function () {
				var context = this, args = arguments;
				clearTimeout(timer);
				timer = setTimeout(function () {
					fn.apply(context, args);
				}, delay);
			};
		}

		var friendsSearch = {

			lastSearched: 0,
			searchInterval: 250,
			_keyword: "",


			isSearched: false,

			doSearch: function (keyword, token) {

				if (!keyword && !this._keyword || this._keyword == keyword || !token) return false;

				if( keyword == "" ) {
					userBehavior.pasteRenderedToModal( friendsWrap, userBehavior.mainRendered );
					return false;
				}



				this._keyword = keyword;

				this.lastSearched = +new Date();

				//var token = "e116bbecdd7a7b0fcb544193609a8e0a8db93604c36ef33456d2c71addb944f58f17e0b423e5a04f8a1f4";



				var req = "https://api.vk.com/method/friends.search?user_id=" + user.vkId + "&fields=photo_50&offset=0&q=" + encodeURIComponent(keyword) + "&v=5.6&access_token=" + token;

				Loader.show();

				// get VK users data
				$.ajax({
					url : req,
					type : "GET",
					async: true,
					dataType : "jsonp",
					success: function(msg){
						//userBehavior.setProfile(msg.response[0])

						try{
							Loader.hide();
							userBehavior.pasteRenderedToModal(
								friendsWrap,
								userBehavior.renderFriends( msg.response.items )
							);
						} catch(e){
							Error.show({message: "Ошибка при поиске"});
						}

						

						//console.log(userBehavior.renderFriends( msg.response.items ));
					},
					error: function () {
						Error.show()
					}
				});
			}
		};

		var vkFriendsList = $("#vkFriendsList"),
			scrollOffset = 300,
			friendsWrap = $("#vkFriends"),
			insideBlockHeight = 0;

		var vkFriendsListScroll = function() {
			var offsetScroll = $(this).scrollTop() + $(this).height();

			insideBlockHeight = vkFriendsList[0].offsetHeight;

			//console.log( offsetScroll, userBehavior.lastMaxScroll, insideBlockHeight );

			if(
					offsetScroll > userBehavior.lastMaxScroll &&
					offsetScroll >= insideBlockHeight - scrollOffset &&
					offsetScroll <= insideBlockHeight
			) {
				userBehavior.lastMaxScroll = offsetScroll + scrollOffset;

				userBehavior.lastRendered += userBehavior.maxRenderCount;

				userBehavior.showHiddenFriends(userBehavior.lastRendered, userBehavior.lastRendered + userBehavior.maxRenderCount);
			}
		};

		$("body").on("keyup", "#vkFriendsSearch", debounce(function () {

			var v = $.trim( this.value );

			friendsSearch.doSearch( v, window.vk_token );

		}, friendsSearch.searchInterval)).on("click", "#btnInviteFriends", userBehavior.doInviteFriend);

		// event to open dialog with friends

		$("#addNewUser").on("click", function () {
			user.toInvite = [];

			$("#vkFriendsSearch").val("");

			//console.log( userBehavior.lastMaxScroll );

			Loader.pasteInto( $("#vkFriendsList") );

			if( !userBehavior.isRendered ){
				userBehavior.mainRendered = userBehavior.renderFriends();

				if( !userBehavior.mainRendered ){
					var callee = arguments.callee;
					setTimeout(function () {
						callee.call();
					}, 300 );

					return false;
				}
				//.html(user.id)

				userBehavior.pasteRenderedToModal( friendsWrap, userBehavior.mainRendered );
			}

			vkFriendsList.parent().off().on( "scroll", vkFriendsListScroll);

			$("#newUserDialog")[0].showModal();

		});


		var req;

		req = "https://api.vk.com/method/users.get?user_ids=" + user.vkId + "&fields=photo_50,city&v=5.8";

		// get VK users data
		$.ajax({
			url : req,
			type : "GET",
			async: true,
			dataType : "jsonp",
			success: function(msg){
				userBehavior.setProfile(msg.response[0])
			},
			error: function () {
				Error.show()
			}
		});

		// Get user friends
		req = "https://api.vk.com/method/friends.get?user_id=" + user.vkId + "&order=hints&fields=city,domain,photo_50&v=5.8";

		// get VK user friends
		$.ajax({
			url : req,
			type : "GET",
			async: true,
			dataType : "jsonp",
			success: function(msg){
				userBehavior.setFriends(msg.response)
			}
		});



		$("body").on("click", "li.vkFriends-list-item", function(){
			var id = $(this).data("vkid"),
			    vkFriendsWrap = $("#vkFriends");

			if( userBehavior.canCheckUser || (user.toInvite.length ? user.toInvite.indexOf(id) != -1 : true) ) {
				if( !$(this).hasClass("active") ){
					$(this).addClass("active");

					user.toInvite.push( id );
				} else{
					$(this).removeClass("active");

					user.toInvite.splice(user.toInvite.indexOf(id), 1);
				}
			}

			userBehavior.checkCanAdd();

			userBehavior.setButtonClass();

			if( !userBehavior.canCheckUser ){
				vkFriendsWrap.addClass("max-users-reached");
			} else{
				vkFriendsWrap.removeClass("max-users-reached");
			}

			return false;
		});


		if( $("button.mdl-button_rang").length ) userBehavior.checkTasksStatus();
	}


	userBehavior.getFriendsData();


	var intro = introJs();

	intro.setOptions({
		showStepNumbers: false,
		showBullets: false,
		nextLabel: "Далее",
		prevLabel: "Назад",
		skipLabel: "Пропустить",
		doneLabel: "Готово",
		hidePrev: true,
		steps: [
			{
				intro: "Вас приветствует система коллективного оповещения «Рупор» - альтернатива классическим средствам массовой информации, построенная по принципу «сарафанного радио»"
			},
			{
				element: $("#nav-link__users")[0],
				intro: "Управляйте вашей подсетью пользователей",
				position: 'right'
			},
			{
				element: $("#nav-link__tasks")[0],
				intro: "Выполняя задачи Вы увеличивайте свои возможности в системе и помогаете другим людям узнать важную информацию",
				position: 'right'
			},
			{
				element: $("#nav-link__stat")[0],
				intro: "Познакомьтесь с другими пользователями системы и узнайте насколько громче Вас они могут крикнуть",
				position: 'right'
			},
			{
				element: $("#nav-link__my-net")[0],
				intro: "Визуализация Вашей подсети пользователей",
				position: 'right'
			}
		]
	});

	//$("table.dashboard-table").fixMe();

	var exitIntro = function () {
		if( !!localStorage.getItem("checkIntro") ) return false;

		localStorage.setItem("checkIntro", 1);
	};

	intro.onexit(exitIntro).oncomplete(exitIntro);

	if( !localStorage.getItem("checkIntro") ) intro.start();

	var myNetRelease = {
		init: function () {

			userBehavior.getFriendsData({
				photoSize: "photo_100",
				list: window.myNetList
			});
		}
	};

	if( $("#my-net-release").length ){
		myNetRelease.init();
	}

	var checkVkWall = function () {
		var req = "https://api.vk.com/method/wall.get?owner_id=" + user.vkId + "&v=5.8";

		Loader.pasteDefault();
		Loader.show();

		// get VK user friends
		$.ajax({
			url : req,
			type : "GET",
			async: true,
			dataType : "jsonp",
			success: function(msg){

				if( msg.error ){
					$("#vkWallError")[0].showModal();

					$("div.task-btns-wrap button.mdl-button_rang").attr("disabled", "disabled");
				}
				Loader.hide();

				//userBehavior.setFriends(msg.response)
			}
		});
	};

	var delLink = null,
		delModal = $("#confirmUserDelete");
	$("body").on("click", "a.table-link-del", function (e) {
		e.preventDefault();

		var m = delModal;

		if( !m.length ) return;

		m[0].showModal();

		delLink = this.href;

		return;
	});

	$("body").on("click", "#btnConfirmUserDelete", function () {
		delModal[0].close();

		location.href = delLink;

		return;
	});




	window.user = user;
	window.Error = Error;
	window.Loader = Loader;

	window.checkVkWall = checkVkWall;

}(jQuery, window));

/*
* Number to Double string
* 9 -> "09"
* */
Number.prototype.toDouble = function () {
	var n = this;

	return (n < 10 ? "0" : "") + n.toString();
};

if (!String.prototype.format) {
	String.prototype.format = function() {
		var str = this.toString();
		if (!arguments.length)
			return str;
		var args = typeof arguments[0],
				args = (("string" == args || "number" == args) ? arguments : arguments[0]);
		for (arg in args)
			str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
		return str;
	}
}

window.countdownTimer = {
	timers: [],
	names: {
		"days": ['день', 'дня', 'дней'],
		"hours": ['час', 'часа', 'часов'],
		"minutes": ['минута', 'минуты', 'минут'],
		"seconds": ['секунда', 'секунды', 'секунд'],
	},
	init: function () {
		if( !this.timers.length ) return false;

		var self = this;

		for( var i = 0, ti = this.timers.length, data; i < ti; i++ ){
			this.timers[i].timer = self.createTimer(self.timers[i]);
		}

	},
	_elapsedCallback: function (timer) {
		if( !timer.elapsedTime ) return;

		if( typeof timer.elapsedTime == "string" )
			return this._renderText(timer.id, timer.elapsedTime || "");

		else if( typeof timer.elapsedTime == "function" )
			return timer.elapsedTime.call(this, timer);
	},
	doCallback: function (selfTimer) {
		//var selfTimer = this.timers
		var data = this.getTimeRemaining( selfTimer.endDate * 1000 );

		data.tpl = selfTimer.tpl || "";

		if( data.total < 0 ) {
			this._elapsedCallback(selfTimer);

			return clearInterval(selfTimer.timer);
		}

		this.renderTimeRemaining( selfTimer.id, data );
	},
	createTimer: function (selfTimer) {
		var self = this;

		self.doCallback(selfTimer);


		return setInterval(function () {
			self.doCallback(selfTimer);
		}, 1000);
	},
	declOfNum: function (number, name) {
		var cases = [2, 0, 1, 1, 1, 2],
			titles = this.names[name];

		return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
	},
	renderTemplate: function (data) {
		/*return (
			(data.days + "д. " + this.declOfNum(data.days, "days")) +" " +
			(data.hours + " " + this.declOfNum(data.hours, "hours")) + " " +
			(data.minutes + " " + this.declOfNum(data.minutes, "minutes")) +" и " +
			(data.seconds + " " + this.declOfNum(data.seconds, "seconds"))
		);*/
		var tpl = data.tpl || "{days}д., {hours}:{minutes}:{seconds}";

		return tpl.format({
			days: data.days,
			hours: data.hours.toDouble(),
			minutes: data.minutes.toDouble(),
			seconds: data.seconds.toDouble()
		});
	},
	renderTimeRemaining: function ( id, data ) {

		this._renderText(id, this.renderTemplate( data ));

	},
	_renderText: function (id, text) {
		var el = document.getElementById("countdown__" + id);

		if( el == null ) {
			throw new Error("Not found Countdown Element.")
		}

		el.innerHTML = text;
	},
	getTimeRemaining: function(endtime) {
		var t = endtime - new Date().getTime();
		var seconds = Math.floor((t / 1000) % 60);
		var minutes = Math.floor((t / 1000 / 60) % 60);
		var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
		var days = Math.floor(t / (1000 * 60 * 60 * 24));

		return {
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		};
	}
};
