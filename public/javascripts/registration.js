$(document).ready(function() {
  $('select').material_select();
  $(".openFile").click(function() {
    console.log("devo triggerare l'input");
    $(".fileExplorer").trigger("click");
  });
  $("#urlPopup").modal();
  $("#confirmEmail").keypress(function() {
    if ($("#confirmEmail").val() != $("#email").val())
      $("#confirmEmail").addClass("invalid");
    else
      $("#confirmEmail").removeClass("invalid");
  });
  $("#confirmEmail").blur(function() {
    if ($("#confirmEmail").val() != $("#email").val())
      $("#confirmEmail").addClass("invalid");
    else
      $("#confirmEmail").removeClass("invalid");
  })

  $("#confirmPassword").keypress(function() {
    if ($("#confirmPassword").val() != $("#password").val())
      $("#confirmPassword").addClass("invalid");
    else
      $("#confirmPassword").removeClass("invalid");
  });
  $("#confirmPassword").blur(function() {
    if ($("#confirmPassword").val() != $("#password").val())
      $("#confirmPassword").addClass("invalid");
    else
      $("#confirmPassword").removeClass("invalid");
  });

  $(".fileExplorer").change(function() {
    var file = $(".fileExplorer")[0].files[0];
    var reader = new FileReader();
    reader.addEventListener("load", () => {
      $("#profileImg").attr("src", reader.result);
    });
    if (file) {
      reader.readAsDataURL(file);
    }
  });

  $(".rolesDiv select").change(() => {
    var sel = $(".rolesDiv input").val().trim();
    if (sel == "Atleta") {
      $(".specDiv").removeClass("hide");
      $(".rolesDiv").addClass("m7");
    } else {
      if ($(".rolesDiv").hasClass("m7")) {
        $(".specDiv").addClass("hide");
        $(".rolesDiv").removeClass("m7");
      }
    }
  })

  $(".allCard").click(() => {
    $.post(
      "http://localhost:3000/signup", {
          name: $("#name").val(),
          surname: $("#surname").val(),
          imgUrl: $("#profileImg").attr("src"),
          email: $("#email").val(),
          authType: "athager",
          password: md5($("#password").val()),
          role: $("#role").val(),
          speciality: $(".specDiv input").val().trim()
      }, (response) => {
        if(response==true)
          $(location).attr("href","/main");
      }
    )
  });

})
