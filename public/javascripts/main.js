var toastDuration = toastDuration;
$(document).ready(function () {
  $('.button-collapse').sideNav({
    menuWidth: 300, // Default is 300
    edge: 'left', // Choose the horizontal origin
    closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
    draggable: true // Choose whether you can drag to open on touch screens
  });

  var date = new Date();


  var socket = io.connect("http://localhost:3000");
  socket.on("sendUserId", () => {
    var usrId = $(".usrImg").data("id");
    socket.emit("athleteId", { userId: usrId });
  })

  socket.on("trainer-set", (data) => {
    Materialize.toast("Sei nel gruppo di allenamento di: " + data, toastDuration)
  })
  socket.on("subscription", function (data) {
    if ($("#iscrizioni").hasClass("selected"))
      $("#iscrizioni").trigger("click");
    if ($(".role").text() == "Allenatore") {
      Materialize.toast(data.name + " ha richiesto di iscriversi a: " + data.competition, toastDuration);
    } else {
      Materialize.toast("Richiesta inviata!", toastDuration);
    }

  })

  socket.on("program-seen", (data) => {
    Materialize.toast(data.name + " ha visualizzato il programma: " + data.program, toastDuration);
  })

  socket.on("program-stored", (data) => {
    Materialize.toast("Il tuo allenatore ha caricato un programma per te!", toastDuration);
  })

  socket.on("trainer-subscribed", (data) => {
    var subscribed = "Il tuo allenatore ti ha iscritto a: ";
    if ($("#iscrizioni").hasClass("selected"))
      $("#iscrizioni").trigger("click");
    if ($.isArray(data)) {
      data.forEach(function (competition) {
        subscribed += competition.description + ", ";
      });
      subscribed = subscribed.substring(0, subscribed.length - 2);
    } else {
      subscribed += data.description;
    }
    Materialize.toast(subscribed, toastDuration);
  })

  $.ajaxSetup({ async: false });
  r = Math.round(Math.random() * 10000);
  $.get("http://yoursite.com/somefile.png", { subins: r }, function (d) {
    gapi.load('auth2', function () {
      gapi.auth2.init();
    });
  }).error(function () {
    ;
  });



  $.ajaxSetup({
    cache: true
  });
  $.getScript('//connect.facebook.net/en_US/sdk.js', function () {
    FB.init({
      appId: '1329352180491327',
      version: 'v2.7' // or v2.1, v2.2, v2.3, ...
    });
  });
  $('select').material_select();

  $("#askmore").modal();

  $(".userView").click(function () {
    $("#nav-mobile").find(".selected").removeClass("selected");
    $.get("http://localhost:3000/changeProfileData", (response) => {
      $(".content").empty();
      $(".content").append(response);
      $("#confirmPassword").keypress(function () {
        if ($("#confirmPassword").val() != $("#password").val())
          $("#confirmPassword").addClass("invalid");
        else
          $("#confirmPassword").removeClass("invalid");
      });
      $("#confirmPassword").blur(function () {
        if ($("#confirmPassword").val() != $("#password").val())
          $("#confirmPassword").addClass("invalid");
        else
          $("#confirmPassword").removeClass("invalid");
      });

      $('button[type="submit"]').click(() => {
        if ($("#oldPsw").val() != "" && $("#confirmPassword").val() != "" && $("#password").val() != "")
          Materialize.toast("La password è stata cambiata!", 4000);
        else
          Materialize.toast("Devi impostare i campi prima!", 4000);
      })
    })
  })


  $("#athleteTrainings").click(function () {
    $("#nav-mobile").find(".selected").removeClass("selected");
    $(this).addClass("selected");
    $.get("http://localhost:3000/athleteTrainings", function (response) {
      $(".content").empty();
      $(".content").append(response);
      $(".collapsible").collapsible();
      $(".tooltipped").tooltip({delay:30});
    })
  })

  $("#listaallenamenti").click(function () {
    $("#nav-mobile").find(".selected").removeClass("selected");
    $("#listaallenamenti").addClass("selected");
    $.get("http://localhost:3000/listTrainings", (response) => {
      $(".content").empty();
      $(".content").append(response);
      $(".tooltipped").tooltip({delay:30});
      $(".download").click(function () {
        var today = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
        $.post("/setSeen", {
          program: $(this).data("program"),
          date: today
        })
      })
    })
  })
  $("#calendario").click(function () {
    $("#nav-mobile").find(".selected").removeClass("selected");
    $(this).addClass("selected");
    var compCode;
    $.get("http://localhost:3000/competitions", (response) => {
      $(".content").empty();
      $(".content").append(response);
      $("#subscribe").modal();
      $(".subscribe").click(function () {
        $.post("http://localhost:3000/subscribe", {
          compId: $(this).data("code"),
          data: date.getDate() + "/" + date.getMonth() + "/" + date.getUTCFullYear()
        })
      })

      $(".subscribeAthlete").click(function () {
        compCode = $(this).data("code");
        $.get("http://localhost:3000/getTrainerAthletes", (response) => {
          console.log(JSON.stringify(response));
          $("#subscribe .athletes").empty();
          response.forEach(function (element) {
            $("#subscribe .athletes").append(
              '<li class="collection-item avatar">'
              + ' <img src="' + element.imgUrl + '" alt="" class="circle">'
              + ' <p>' + element.name + ' <br>' + element.surname + '</p>'
              + '  <p href="#!" class="secondary-content"><input id="' + element._id + '" type="checkbox" /><label for="' + element._id + '"></label></p>'
              + '</li>'
            );
          }, this);
          $("#subscribe").modal('open');
        })

      })
      $("#subscribe .modal-action").click(function () {
        console.log("Devo fare una registrazione");
        var idsAthletes = [];
        $("#subscribe .modal-content ul li .secondary-content input:checked").each(function (element) {
          idsAthletes.push($(this).attr("id"));
        })
        $.post("http://localhost:3000/subscribeAthlete", {
          athletes: idsAthletes,
          competition: compCode,
          data: date.getDate() + "/" + date.getMonth() + "/" + date.getUTCFullYear()
        }, (response) => {
          if (response)
            Materialize.toast('Gli atleti selezionati sono stati iscritti!', toastDuration)
        })



      })
    });
  })

  $("#calendario").trigger("click");

  if ($(".incomplete").data("incomplete"))
    $("#askmore").modal('open');


  $("#allenamenti").click(function () {
    $("#nav-mobile").find(".selected").removeClass("selected");
    $(this).addClass("selected");
    var programsToUpload = [];
    var files;
    $.get("http://localhost:3000/addTrain", (response) => {
      $(".content").empty();
      $(".content").append(response);
      $("select").material_select();
      var athletesForRow = [];
      var cnt = 0;
      $('input[type="file"]').change(function () {
        files = $('input[type="file"]')[0].files;
        if (files.length > 0) {
          function readFiles(file) {
            var reader = new FileReader();
            reader.onload = function () {
              console.log("devo caricare");
              updatePrograms({ name: file.name, content: this.result, shown: false });
              reader.abort();
            };
            reader.readAsDataURL(file);
          }
          function updatePrograms(objToPush) {
            console.log("spingo");
            programsToUpload.push(objToPush);
            cnt++;
            if (programsToUpload.length == cnt) {
              $(".toastTitle").text("I file sono pronti per essere caricati");
              $(".preloader-wrapper").remove();
              $(".toastContent").append('<i class="material-icons green-text">done</i>')
              $.get("/getTrainerAthletes", (athletes) => {
                $("table").removeClass("hide");

                var select = '<td><div class="input-field col s12 m6">' +
                  '<select class="icons athletesToChoose" multiple>' +
                  '<option value ="Default" disabled selected >Seleziona gli atleti</option>';
                for (var i = 0; i < athletes.length; i++) {
                  var athlete = athletes[i];
                  select += '<option value="' + athlete.email + '" data-icon="' + athlete.imgUrl + '" class="left circle">' + athlete.name + " " + athlete.surname + '</option>'
                }
                select += "</select></div></td>";

                programsToUpload.forEach((file) => {
                  if (!file.shown) {
                    $("tbody").append("<tr><td>" + file.name + "</td>" + select + '<td><i style="cursor:pointer"class="material-icons align-center delProgram" data-fileName="' + file.name + '">delete</i></td></tr>');
                    file.shown = true;
                  }
                });
                $(".delProgram").click(function () {

                  var deleted = false;
                  for (var i = 0; i < programsToUpload.length && !deleted; i++) {

                    var fileToRemove = $(this).data("filename");
                    if (programsToUpload[i].name == fileToRemove) {
                      programsToUpload.splice(i, 1);
                      deleted = true;
                    }
                  }
                  if (deleted) {
                    var tmp = $(this).data("filename");
                    $(this).parent().parent().remove();
                    Materialize.toast("Il file: " + tmp + ", è stato rimosso dalla coda di upload", toastDuration);
                    if (programsToUpload.length == 0)
                      $("table").addClass("hide");
                    cnt--;
                  }
                })
                $("select").material_select();
              })
              setTimeout(() => {
                $(".toast").remove();
              }, 2000)
            }
          }
          if (files) {
            var $toastContent = $('<div class="scale-transition toastContent valign-wrapper"><span class="toastTitle"style="margin-right:30px">Sto caricando i programmi</span><div class="preloader-wrapper small selected"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>');
            Materialize.toast($toastContent);
            [].forEach.call(files, readFiles);
          }
        }
      })
      $(".upload").click(function () {
        if (programsToUpload.length > 0) {
          emailAthletes = [];
          $("tbody tr").each(function (index) {
            var newValuesArr = [],
              select = $(this).find(".athletesToChoose");
            ul = select.prev();
            ul.children('li').toArray().forEach(function (li, i) {
              console.log("Lista");
              if ($(li).hasClass('active')) {
                console.log(newValuesArr);
                newValuesArr.push(select.children('option').toArray()[i].value);
              }
            });
            athletesForRow.push({ athletes: newValuesArr });
          })
          var i = 0;
          var results = [];
          console.log(JSON.stringify(athletesForRow));
          programsToUpload.forEach((program) => {
            $.post("http://localhost:3000/storeProgram", {
              name: program.name,
              content: program.content,
              athletesEmail: athletesForRow[i]
            }, (response) => {
              if (response) {
                results.push(response);
                if (results.length == programsToUpload.length) {
                  programsToUpload = [];
                  $("tbody").empty();
                }
              }
            })
            i++;
          })
        }
      })
    });
  })

  $("#richieste").click(function () {
    $("#nav-mobile").find(".selected").removeClass("selected");
    $(this).addClass("selected");
    $.get("http://localhost:3000/subscriptionRequests", (response) => {
      $(".content").empty();
      $(".content").append(response);
      $(".collapsible").collapsible();
      var check = false;
      $(".checkAll").click(function () {
        var currentId = $(".checkAll").attr("id");
        $("." + currentId + " ul li .collapsible-header ul li div .secondary-content input").each(function (index) {
          if ($(this).attr("disabled") == undefined) {
            $(this).prop("checked", !check);
          }
        });
        check = !check;
      })
      $(".subscribeSingle").click(function () {
        var athId = $(this).data("athleteid");
        var competitions = [];
        $("." + athId + " ul li .collapsible-header ul li div .secondary-content input").each(function (index) {
          if ($(this).attr("disabled") == undefined && $(this).prop("checked")) {
            competitions.push($(this).attr("id"));
          }
        })
        if (competitions.length == 0) {
          Materialize.toast("Devi selezionare le gare da accettare", toastDuration);
        } else {
          $.post("http://localhost:3000/acceptAthlete", {
            athlete: athId,
            competitions: competitions,
            data: date.getDate() + "/" + date.getMonth() + "/" + date.getUTCFullYear()
          }, (response) => {
            if (response)
              Materialize.toast('Gli atleti selezionati sono stati iscritti!', toastDuration)
          })
        }
      })
    })
  })

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

  $(".addInfo").click(() => {
    $.post("http://localhost:3000/addInfo", {
      email: $(".email").text().trim(),
      fields: ["role", "speciality"],
      values: [$(".rolesDiv input").val().trim(), $(".specDiv input").val().trim()]
    }, (response) => {
      if (response)
        $.get("http://localhost:3000/getActions?role=" + values[0], (acts) => {
          $(".actions").empty();
          $(".actions").append('<li><a id="' + acts[0].action.toLowerCase() + '" class="waves-effect ' + acts[0].action.toLowerCase() + '"><i class="material-icons"> ' + acts[0].icon + '  </i>  ' + acts[0].action + ' </a></li>')
          $.each(acts, (i, act) => {
            $(".actions").append('<li><a id="' + act.action.toLowerCase() + '" class="waves-effect ' + act.action.toLowerCase() + '"><i class="material-icons"> ' + act.icon + '  </i>  ' + act.action + ' </a></li>')
          })
          $(".actions").append('<li><a id="' + acts[acts.length - 1].action.toLowerCase() + '" class="waves-effect ' + acts[acts.length - 1].action.toLowerCase() + '"><i class="material-icons"> ' + acts[acts.length - 1].icon + '  </i>  ' + acts[acts.length - 1].action + ' </a></li>')
        })
    })
  })

  $("#iscrizioni").click(function () {
    $("#nav-mobile").find(".selected").removeClass("selected");
    $(this).addClass("selected");
    $.get("http://localhost:3000/subscriptions", (response) => {
      $(".content").empty();
      $(".content").append(response);
      $('.collapsible').collapsible();
    });
  })

  $("#gruppo").click(function () {
    $("#nav-mobile").find(".selected").removeClass("selected");
    $(this).addClass("selected");
    $.get("http://localhost:3000/athleteGroup", (response) => {
      console.log("devo aggiongere")
      $(".content").empty();
      $(".content").append(response);
      $("#addGroup").modal();
      $('.collapsible').collapsible();
      $(".addGroup").click(function () {
        $(".athletes").empty();
        $.get("http://localhost:3000/allAthletes", (response) => {
          response.forEach(function (element) {
            $(".athletes").append(
              '<li class="collection-item avatar">'
              + ' <img src="' + element.imgUrl + '" alt="" class="circle">'
              + ' <p>' + element.name + ' <br>' + element.surname + '</p>'
              + '  <p href="#!" class="secondary-content"><input id="' + element._id + '" type="checkbox" /><label for="' + element._id + '"></label></p>'
              + '</li>'
            );
          }, this);
          $("#addGroup").modal('open')
          $("#addGroup .modal-action").click(function () {
            var idsAthletes = [];
            $("#addGroup .modal-content ul li .secondary-content input:checked").each(function (element) {
              idsAthletes.push($(this).attr("id"));
            })
            $.post("http://localhost:3000/addAthletes", {
              athletes: idsAthletes
            }, (response) => {
              if (response)
                $("#gruppo").trigger("click");
            })
          })
        })
      })
    })
  })


  $(".logout").click(() => {
    if ($(".auth").data("auth") == "google") {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        $(location).attr("href", "http://localhost:3000/");
      });
    } else {
      if ($(".auth").data("auth") == "facebook") {
        FB.logout((response) => {
          $(location).attr("href", "http://localhost:3000/")
        })
      } else {
        $(location).attr("href", "http://localhost:3000/logout");
      }
    }

  })
})
