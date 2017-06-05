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
    console.log(usrId);
    socket.emit("athleteId", { userId: usrId });
  })
  socket.on("subscription", (data) => {
    Materialize.toast("Richiesta inviata!", 2000);
    $("#iscrizioni").children(".badge").removeClass("hide");
  })

  socket.on("trainer-subscribed", (data) => {
    var subscribed = "Il tuo allenatore ti ha iscritto a: ";
    if ($.isArray(data)) {
      data.forEach(function (competition) {
        subscribed += competition.description + ", ";
      });
      subscribed = subscribed.substring(0, subscribed.length - 2);
    } else {
      subscribed += data.description;
    }
    Materialize.toast(subscribed, 6000);
  })
  /*gapi.load('auth2', function () {
    gapi.auth2.init();
  });*/

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
  $("#addGroup").modal();
  $("#listaallenamenti").click(function () {
    $.get("http://localhost:3000/listTrainings", (response) => {
      $(".content").empty();
      $(".content").append(response);
    })
  })
  $("#calendario").click(function () {
    var compCode;
    $.get("http://localhost:3000/competitions", (response) => {
      $(".content").empty();
      $(".content").append(response);
      $(".subscribe").click(function () {
        console.log("Invio iscrizione");
        $.post("http://localhost:3000/subscribe", {
          compId: $(this).data("code"),
          data: date.getDate() + "/" + date.getMonth() + "/" + date.getUTCFullYear()
        })
      })

      $("#addGroup .modal-action").click(function () {
        var idsAthletes = [];
        console.log("Iscrivo a: " + compCode);
        $("#addGroup .modal-content ul li .secondary-content input:checked").each(function (element) {
          idsAthletes.push($(this).attr("id"));
        })
        $.post("http://localhost:3000/subscribeAthlete", {
          athletes: idsAthletes,
          competition: compCode,
          data: date.getDate() + "/" + date.getMonth() + "/" + date.getUTCFullYear()
        }, (response) => {
          if (response)
            Materialize.toast('Gli atleti selezionati sono stati iscritti!', 4000) // 4000 is the duration of the toast
        })
      })

      $(".subscribeAthlete").click(function () {
        compCode = $(this).data("code");
        $.get("http://localhost:3000/getTrainerAthletes", (response) => {
          $("#addGroup .athletes").empty();
          response.forEach(function (element) {
            $("#addGroup .athletes").append(
              '<li class="collection-item avatar">'
              + ' <img src="' + element.imgUrl + '" alt="" class="circle">'
              + ' <p>' + element.name + ' <br>' + element.surname + '</p>'
              + '  <p href="#!" class="secondary-content"><input id="' + element._id + '" type="checkbox" /><label for="' + element._id + '"></label></p>'
              + '</li>'
            );
          }, this);
          $("#addGroup").modal('open');
        })

      })
    });
  })

  $("#calendario").trigger("click");

  if ($(".incomplete").data("incomplete"))
    $("#askmore").modal('open');


  $("#allenamenti").click(function () {
    var programsToUpload = [];
    var files;
    $.get("http://localhost:3000/addTrain", (response) => {
      $(".content").empty();
      $(".content").append(response);
      $("select").material_select();
      var athletesForRow = [];
      $('input[type="file"]').change(function () {
        files = $('input[type="file"]')[0].files;
        function readFiles(file) {
          var reader = new FileReader();
          reader.onload = function () {
            console.log(this.result);
            updatePrograms({ name: file.name, content: this.result });
            reader.abort();
          };
          reader.readAsDataURL(file);
        }
        function updatePrograms(objToPush) {

          programsToUpload.push(objToPush);
          console.log(JSON.stringify(programsToUpload));
          if (programsToUpload.length == files.length) {
            $(".toastTitle").text("I file sono pronti per essere caricati");
            $(".preloader-wrapper").remove();
            $(".toastContent").append('<i class="material-icons green-text">done</i>')
            $.get("/getTrainerAthletes", (athletes) => {
              $("table").removeClass("hide");
              var i = 0;
              programsToUpload.forEach((file) => {
                $("tbody").append("<tr>");
                $("tbody").append("<td>" + file.name + "</td>");
                var select = '<td><div class="input-field col s12 m6">' +
                  '<select class="icons ' + i + '" multiple>' +
                  '<option value ="Default" disabled selected >Seleziona gli atleti</option>';
                athletes.forEach((athlete) => {
                  select += '<option value="' + athlete.email + '" data-icon="' + athlete.imgUrl + '" class="left circle">' + athlete.name + " " + athlete.surname + '</option>'
                });
                select += "</select></div></td>";
                $("tbody").append(select);
                $("tbody").append('<td><i class="material-icons align-center delProgram" data-fileName="' + file.name + '">delete</i></td>');
                $("tbody").append("</tr>");
                i++;
              });
              $(".delProgram").click(() => {
                var deleted = false;
                for (var i = 0; i < programsToUpload.length && !deleted; i++) {
                  console.log("Current file" + programsToUpload[i].name);
                  var fileToRemove = $(".delProgram").data("filename");
                  console.log(fileToRemove);
                  if (programsToUpload[i].name == fileToRemove) {
                    programsToUpload.splice(i, 1);
                    deleted = true;
                  }
                }
                console.log(JSON.stringify(programsToUpload));
              })
              $("select").material_select();
            })
            setTimeout(() => {
              $(".toast").remove();
            }, 2000)
          }
        }
        if (files) {
          var $toastContent = $('<div class="scale-transition toastContent valign-wrapper"><span class="toastTitle"style="margin-right:30px">Sto caricando i programmi</span><div class="preloader-wrapper small active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>');
          Materialize.toast($toastContent);
          [].forEach.call(files, readFiles);
        }
      })
      $(".upload").click(() => {
        if (programsToUpload.length > 0) {
          emailAthletes = [];
          $("tbody tr").each((index) => {
            var newValuesArr = [],
              select = $("." + index);
            ul = select.prev();
            ul.children('li').toArray().forEach(function (li, i) {
              if ($(li).hasClass('active')) {
                newValuesArr.push(select.children('option').toArray()[i].value);
              }
            });
            athletesForRow.push({ athletes: newValuesArr });
          })
          console.log(JSON.stringify(athletesForRow));
          var i = 0;
          programsToUpload.forEach((program) => {
            $.post("http://localhost:3000/storeProgram", {
              name: program.name,
              content: program.content,
              athletesEmail: athletesForRow[i]
            }, (response) => {
              console.log(response);
            })
            i++;
          })
        }
      })
    });
  })

  $("#richieste").click(function () {
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
          Materialize.toast("Devi selezionare le gare da accettare", 2000);
        } else {
          $.post("http://localhost:3000/acceptAthlete", {
            athlete: athId,
            competitions: competitions,
            data: date.getDate() + "/" + date.getMonth() + "/" + date.getUTCFullYear()
          }, (response) => {
            if (response)
              Materialize.toast('Gli atleti selezionati sono stati iscritti!', 4000) // 4000 is the duration of the toast
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
    $.get("http://localhost:3000/subscriptions", (response) => {
      $(".content").empty();
      $(".content").append(response);
      $('.collapsible').collapsible();
    });
  })

  $("#gruppo").click(function () {
    $.get("http://localhost:3000/athleteGroup", (response) => {
      $(".content").empty();
      $(".content").append(response);
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
        console.log('User signed out.');
        $(location).attr("href", "http://localhost:3000/");
      });
    } else {
      if ($(".auth").data("auth") == "facebook") {
        FB.logout((response) => {
          console.log("User signed out.")
          $(location).attr("href", "http://localhost:3000/")
        })
      } else {
        $(location).attr("href", "http://localhost:3000/logout");
      }
    }

  })
})
