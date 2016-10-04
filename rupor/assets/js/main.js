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

		hide: function () {
			if( !this.errElement ) return false;

			//this._errElement.removeClass("mdl-snackbar--active");

			this.errElement.cleanup_();
		},
		showErr: function (errData) {
			var notification = $('#mdl-snackbar');

			this.errElement = notification[0].MaterialSnackbar;

			//console.log(notification[0])


			var defCallback = function () {
				Error.hide();
			};

			var data = {
				message: errData.message || "Ошибка",
				actionHandler: errData.callback || defCallback,
				actionText: errData.btnLabel || "Ок",
				timeout: 60 * 60 * 1000
			};

			this.errElement.showSnackbar(data);
		},
		show: function (errData) {

			var self = this;
			$(window).on("load", function () {
				self.showErr(errData);
			});


		}
	};


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

			//trObj.push();

			//console.log(topTr)

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

				user.vkFriends = data;

				/*user.profile = data;

				 $("#profile-avatar").attr("src", user.profile.photo_50);
				 $("#side-name").html(user.profile.first_name + " " + user.profile.last_name );*/
			},
			lastRendered: 0,
			maxRenderCount: 20,
			htmlFriendsList: '',
			isRendered: false,
			renderFriends: function(){

				if( typeof user.vkFriends == "undefined" || !!this.isRendered ){
					return false;
				}

				//console.log(arguments.length);
				var vkFriendsCount = user.vkFriends.count - 1;
/*
				if( (this.lastRendered + this.maxRenderCount) > vkFriendsCount ) this.maxRenderCount = vkFriendsCount;
				else this.maxRenderCount = this.lastRendered + this.maxRenderCount;*/

				//user.vkFriends.count - 1

				var friends = '',
					frItems = user.vkFriends.items;

				for(var i = 0; i < vkFriendsCount; i++ ){
					if( frItems[i].deactivated ){
						continue;
					}

					friends += "<li class='vkFriends-list-item" + (i >= this.maxRenderCount ? " hidden" : "") + "' data-vkId='http://vk.com/id" + frItems[i].id + "'>" + "<img src='" + frItems[i].photo_50 + "' class='vkFriends-list-avatar'>" + "<span class='vkFriends-list-name name'>" + frItems[i].first_name + " " + frItems[i].last_name + "</span></li>";
				}

				//this.lastRendered = this.maxRenderCount;

				this.isRendered = false;

				return friends;
			},
			showHiddenFriends: function (min, max) {
				//console.log(min, max);
				this.htmlFriendsList.slice( min, max ).removeClass("hidden");

				//console.log(this.htmlFriendsList.slice( min, max ).removeClass("hidden"))
			},
			initListJs: function(){
				var options = {
					valueNames: [ 'name' ]
				};

				this.setButtonClass();

				if( !this.sortList ) this.sortList = new List('vkFriendsList', options);
				else this.sortList.reIndex();

				$("#btnInviteFriends").on("click", this.doInviteFriend);
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
			getFriendsData: function () {
				if( window.friends ){

					var friends = window.friends,
							friendsIds = $.map(friends, function (a) {
								return a.replace("id","");
							});

					var req = "https://api.vk.com/method/users.get?user_ids=" + friendsIds.join(",") + "&fields=photo_50&v=5.8";

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
										$(this).attr("src", data[i].photo_50);
									}
								}
							});
						}
					});
				}
			},
			doInviteFriend: function () {
				var dialog = $("#newUserDialog");

				var data = user.toInvite.length > 1 ? user.toInvite : user.toInvite[0];

				user.toInvite = [];

				userBehavior.setButtonClass();

				Loader.pasteInto( $("#vkFriendsList") );

				Loader.show();

				$.ajax({
					url : "/",
					type : "POST",
					data: {
						"new_part": data
					},
					success: function(msg){
						var toFriends;

						if( typeof data == "object" ){
							toFriends = $.map(data, function (a) {
								return a.match(/id[\d]+/)[0];
							});
						} else toFriends = data.match(/id[\d]+/)[0];

						window.friends = window.friends.concat(toFriends);

						$("#__List").html( $("#__List", msg).html() );

						dialog[0].close();

						Loader.hide();
						Loader.pasteDefault();
					}
				});

			}

		};

		var vkFriendsList = $("#vkFriendsList"),
			scrollOffset = 300,
			friendsWrap = $("#vkFriends"),
			lastMaxScroll = 0;

		vkFriendsList.parent().on( "scroll", function(){

			var offsetScroll = $(this).scrollTop() + $(this).height(),
				insideBlockHeight = vkFriendsList[0].offsetHeight;

			if(
				offsetScroll > lastMaxScroll &&
				offsetScroll >= insideBlockHeight - scrollOffset &&
				offsetScroll <= insideBlockHeight
			) {
				lastMaxScroll = offsetScroll + scrollOffset;

				userBehavior.lastRendered += userBehavior.maxRenderCount;

				userBehavior.showHiddenFriends(userBehavior.lastRendered, userBehavior.lastRendered + userBehavior.maxRenderCount);
			}


		});

		$("body").on("keydown", "#vkFriendsSearch", function () {
			friendsWrap.children("li").each(function () {
				if( !$(this).hasClass("hidden") ) return;

				$(this).removeClass("hidden");
			});
		});

		// event to open dialog with friends
		$("#addNewUser").on("click", function () {
			user.toInvite = [];



			if( !userBehavior.isRendered ){
				var rendered = userBehavior.renderFriends();

				if( !rendered ){
					var callee = arguments.callee;
					setTimeout(function () {
						callee.call();
					}, 300 );

					return false;
				}
				//.html(user.id)
				friendsWrap.attr("class", "vkFriends list").html( rendered );

				userBehavior.htmlFriendsList = $("#vkFriends li");


				setTimeout(function () {
					userBehavior.initListJs();
				}, 0);

				$("#newUserDialog")[0].showModal();
			} else{
				//userBehavior.renderedFriendsDefaults();

				$("#newUserDialog")[0].showModal();
			}



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
	}


	userBehavior.getFriendsData();


	window.user = user;
	window.Error = Error;
	window.Loader = Loader;

}(jQuery, window));

/*
* Number to Double string
* 9 -> "09"
* */
Number.prototype.toDouble = function () {
	var n = this;

	return (n < 10 ? "0" : "") + n.toString();
};

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
	doCallback: function (selfTimer) {
		//var selfTimer = this.timers
		var data = this.getTimeRemaining( selfTimer.endDate * 1000 );

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
		return (
				(data.days + "д.") + " " +
				(data.hours.toDouble() + ":") +
				(data.minutes.toDouble() + ":") +
				(data.seconds.toDouble())
		);
	},
	renderTimeRemaining: function ( id, data ) {
		var el = document.getElementById("countdown__" + id);

		if( el == null ) return false;

		el.innerHTML = this.renderTemplate( data );
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
