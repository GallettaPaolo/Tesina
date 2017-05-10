(function($){
  $(function(){

    $('.button-collapse').sideNav();
    $('.parallax').parallax();
    $("#loginpopup").modal();
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/it_IT/sdk.js', function(){
    FB.init({
      appId: '1329352180491327',
      version: 'v2.7' // or v2.1, v2.2, v2.3, ...
    });     
    $('#loginbutton,#feedbutton').removeAttr('disabled');

  });
  }); // end of document ready
})(jQuery); // end of jQuery name space