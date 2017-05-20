$(document).ready(function() {
  $('.button-collapse').sideNav({
    menuWidth: 300, // Default is 300
    edge: 'left', // Choose the horizontal origin
    closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
    draggable: true // Choose whether you can drag to open on touch screens
  });
  var socket = io.connect("http://localhost:3000");
  console.log(socket);
  gapi.load('auth2',function() {
    gapi.auth2.init();
  });

  $.ajaxSetup({
    cache: true
  });
  $.getScript('//connect.facebook.net/en_US/sdk.js', function() {
    FB.init({
      appId: '1329352180491327',
      version: 'v2.7' // or v2.1, v2.2, v2.3, ...
    });
  });


  $(".logout").click(() => {
    if ($(".auth").data("auth") == "google") {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function() {
        console.log('User signed out.');
        $(location).attr("href","http://localhost:3000/");
      });
    } else {
      if ($(".auth").data("auth") == "facebook") {
        FB.logout((response) => {
          console.log("User signed out.")
          $(location).attr("href","http://localhost:3000/")
        })
      }else {
        $(location).attr("href","http://locahost:3000/logout");
      }
    }

  })
})
