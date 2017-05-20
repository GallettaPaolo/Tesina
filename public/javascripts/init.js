var loggedUser;
$(document).ready(function() {
  $('.button-collapse').sideNav({
    menuWidth: 300, // Default is 300
    edge: 'left', // Choose the horizontal origin
    closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
    draggable: true // Choose whether you can drag to open on touch screens
  });
  $('.parallax').parallax();
  $("#loginpopup").modal();
  $.ajaxSetup({
    cache: true
  });
  $.getScript('//connect.facebook.net/en_US/sdk.js', function() {
    FB.init({
      appId: '1329352180491327',
      version: 'v2.7' // or v2.1, v2.2, v2.3, ...
    });
    $('#loginbutton,#feedbutton').removeAttr('disabled');
    FB.getLoginStatus(updateStatusCallback);
  });

  $("#logout").click(function() {
    FB.logout((response) => {

    });
  })


  $(".login").click(() => {
    $.post("http://localhost:3000/login", {
      email: $("#email").val(),
      password: md5($("#password").val())
    }, (response) => {
      $(location).attr("href", response);
    })
  })
});

/**
 * Funzione che gestisce la registrazione/login tramite Facebook
 */
function updateStatusCallback(response) {
  if (response.status == "connected") {
    FB.api('/me', {
      access_token: response.authResponse.accessToken,
      fields: "first_name,last_name,email,picture"
    }, function(response) {
      var currentUser = new User(response.first_name, response.last_name, response.picture.data.url, (response.email == undefined) ? null : response.email, "facebook");
      setAutoLogin(currentUser);
      console.log("invio richiesta al server" + currentUser);
      $.post(
        "http://localhost:3000/users/logUserIn", {
          user: JSON.stringify(currentUser)
        }, (response) => {
          alert(response)
        }
      );
    });
  }
}

function setAutoLogin(user) {
  loggedUser = user;
  $(".roundImg").attr("src", user.imgUrl);
  $(".welcome").text("Benvenuto " + user.name);

  if (!$("#loginpopup").is(":visible")) {
    $("#login-button").click(() => {
      $.get("http://localhost:3000/autoLog", {
        curUser: JSON.stringify(user)
      }, (response) => {
        $(location).attr("href", response);
      })
    })
  } else {
    $.get("http://localhost:3000/autoLog", {
      curUser: JSON.stringify(user)
    }, (response) => {
      $(location).attr("href", response);
    })
  }
}


/**
 * Funzione che gestisce la registrazione/login tramite Google
 */
function onSignIn(googleUser) {
  var temp = googleUser.getBasicProfile();
  var currentUser = new User(temp.getGivenName(), temp.getFamilyName(), temp.getImageUrl(), temp.getEmail(), "google");
  setAutoLogin(currentUser);
}

var User = function(name, surname, imgUrl, email, authType) {
  this.name = name;
  this.surname = surname;
  this.imgUrl = imgUrl;
  this.email = email;
  this.authType = authType;
}
