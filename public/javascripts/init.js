$(document).ready(function() {
    $('.button-collapse').sideNav({
      menuWidth: 300, // Default is 300
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true // Choose whether you can drag to open on touch screens
    }
  );
    $('.parallax').parallax();
    $("#loginpopup").modal();
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
      FB.init({
        appId: '1329352180491327',
        version: 'v2.7' // or v2.1, v2.2, v2.3, ...
      });     
      $('#loginbutton,#feedbutton').removeAttr('disabled');
      FB.getLoginStatus(updateStatusCallback);
    });

    $("#logout").click(function(){
      FB.logout((response)=>{

      });
    })
  });

/**
 * Funzione che gestisce la registrazione/login tramite Facebook
 */
function updateStatusCallback(response){ 
  if(response.status =="connected"){
      FB.api('/me',{access_token: response.authResponse.accessToken, fields:"first_name,last_name,gender,location,picture"}, function(response) {
        console.log(JSON.stringify(response));
    });
  }
}

/**
 * Funzione che gestisce la registrazione/login tramite Google
 */
function onSignIn(googleUser){

}
