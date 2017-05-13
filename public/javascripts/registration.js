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
    });

    $(".fileExplorer").change(function(){
        var file = $(".fileExplorer")[0].files[0];
        var reader = new FileReader();
        reader.addEventListener("load",()=>{
            $("#profileImg").attr("src",reader.result);
        });
        if(file){
            reader.readAsDataURL(file);
        }
    });

    $("select").change(function(){
        if($("select").val() == "Atleta")
            $("select").parent().parent().parent().append(
            '<div class="col m3 s12">'+
            '<select>'+
            
            '</select'+
            '</div>'
            )

    })


})
