$(document).ready(function(){
    $('select').material_select();
    $(".openFile").click(function(){
        console.log("devo triggerare l'input");
        $(".fileExplorer").trigger("click");
    });
    $("#urlPopup").modal();
    $("#confirmEmail").keypress(function(){
        if($("#confirmEmail").val() != $("#email").val())
            $("#confirmEmail").addClass("invalid");
        else
            $("#confirmEmail").removeClass("invalid");
    });
    $("#confirmEmail").blur(function(){
        if($("#confirmEmail").val() != $("#email").val())
            $("#confirmEmail").addClass("invalid");
        else
            $("#confirmEmail").removeClass("invalid");
    })

    $("#confirmPassword").keypress(function(){
        if($("#confirmPassword").val() != $("#password").val())
            $("#confirmPassword").addClass("invalid");
        else
            $("#confirmPassword").removeClass("invalid");
    });
    $("#confirmPassword").blur(function(){
        if($("#confirmPassword").val() != $("#password").val())
            $("#confirmPassword").addClass("invalid");
        else
            $("#confirmPassword").removeClass("invalid");
    })
})