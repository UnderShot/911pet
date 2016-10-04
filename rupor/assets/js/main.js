/**
 * Created by undershot on 24.09.2016.
 */

(function($, window){

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
			renderFriends: function(){

				if( typeof user.vkFriends == "undefined" ){
					return false;
				}

				var friends = '',
					frItems = user.vkFriends.items;

				for(var i = 0, friendsCount = user.vkFriends.count - 1; i < friendsCount; i++ ){
					if( frItems[i].deactivated ){
						continue;
					}

					friends += "<li class='vkFriends-list-item' data-vkId='http://vk.com/id" + frItems[i].id + "'>" + "<img src='" + frItems[i].photo_50 + "' class='vkFriends-list-avatar'>" + "<span class='vkFriends-list-name name'>" + frItems[i].first_name + " " + frItems[i].last_name + "</span></li>";
				}

				return friends;
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
			doInviteFriend: function () {
				//alert( 123 );

				//console.log(user.toInvite);

				$.ajax({
					url : "/",
					type : "POST",
					data: {
						"new_part": user.toInvite.length > 1 ? user.toInvite : user.toInvite[0]
					},
					success: function(msg){
						//userBehavior.setProfile(msg.response[0])

						$("#newUserDialog")[0].close();

						//location.reload();
					}
				});

			}

		};

		// event to open dialog with friends
		$("#addNewUser").on("click", function () {
			var friendsWrap = $("#vkFriends");

			user.toInvite = [];

			var rendered = userBehavior.renderFriends();

			if( !rendered ){
				var callee = arguments.callee;
				setTimeout(function () {
					callee.call();
				}, 300 );

				return false;
			}
			//.html(user.id)
			friendsWrap.attr("class", "vkFriends list").html( userBehavior.renderFriends() );

			setTimeout(function () {
				userBehavior.initListJs();
			}, 0);

			$("#newUserDialog")[0].showModal();
		});


		var req;

		req = "https://api.vk.com/method/users.get?user_ids=" + user.vkId + "&fields=photo_50,city&v=5.8";

		// get VK users data
		$.ajax({
			url : req,
			type : "GET",
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


	if( window.friends ){

		var friends = window.friends,
			friendsIds = $.map(friends, function (a) {
				return a.replace("id","");
			});

		req = "https://api.vk.com/method/users.get?user_ids=" + friendsIds.join(",") + "&fields=photo_50&v=5.8";

		$.ajax({
			url : req,
			type : "GET",
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

			console.log(notification[0])


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






	window.user = user;
	window.Error = Error;

}(jQuery, window));


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
		return (
			(data.days + " " + this.declOfNum(data.days, "days")) +" " +
			(data.hours + " " + this.declOfNum(data.hours, "hours")) + " " +
			(data.minutes + " " + this.declOfNum(data.minutes, "minutes")) +" и " +
			(data.seconds + " " + this.declOfNum(data.seconds, "seconds"))
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
