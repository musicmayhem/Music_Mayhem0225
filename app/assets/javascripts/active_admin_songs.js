$(document).ready(function() {
  let timeOffset = -new Date().getTimezoneOffset() * 60;
  document.cookie = "time_offset=" + timeOffset;
  if ($(document).find(".modal").length) {
    $(".multi-select").select2();
    $(".genre-link")
      .parent()
      .addClass("grey-links");
    $(".dropdown_menu_list .batch_action").click(function() {
      $(".ui-dialog").css({
        top: "112px",
        height: "40em",
        "overflow-y": "auto",
      });
    });
  }
  // For Song Title
  $(".admin-song-title-section").click(function() {
    $(this)
      .find(".admin-song-title")
      .hide();
    $(this)
      .find(".admin-song-title-form")
      .show();
  });
  $(".admin-update-button-title").click(function(e) {
    var songData = {
      id: $(this)
        .closest("div")
        .find("input")
        .val(),
      title: $(this)
        .closest("div")
        .find("textarea")
        .val(),
    };
    updateSongData(songData);
    e.stopPropagation();
  });
  // For Song Artist
  $(".admin-song-artist-section").click(function() {
    $(this)
      .find(".admin-song-artist")
      .hide();
    $(this)
      .find(".admin-song-artist-form")
      .show();
  });
  $(".admin-update-button-artist").click(function(e) {
    var songData = {
      id: $(this)
        .closest("div")
        .find("input")
        .val(),
      artist: $(this)
        .closest("div")
        .find("textarea")
        .val(),
    };
    updateSongData(songData);
    e.stopPropagation();
  });
  // For Song Year
  $(".admin-song-year-section").click(function() {
    $(this)
      .find(".admin-song-year")
      .hide();
    $(this)
      .find(".admin-song-year-form")
      .show();
  });
  $(".admin-update-button-year").click(function(e) {
    var songData = {
      id: $(this)
        .closest("div")
        .find("input")
        .val(),
      year: $(this)
        .closest("div")
        .find("textarea")
        .val(),
    };
    updateSongData(songData);
    e.stopPropagation();
  });
  $("#text_area_year").keypress(function(e) {
    var a = [];
    var k = e.which;

    for (i = 48; i < 58; i++) a.push(i);

    if (!(a.indexOf(k) >= 0)) e.preventDefault();
  });

  $(".admin-update-button-genres").click(function(e) {
    e.preventDefault();
    var songData;
    if (
      $(this)
        .closest("div")
        .find("select")
        .val().length > 0
    ) {
      songData = {
        id: $(this)
          .closest("div")
          .find("#song_id")
          .val(),
        genres: $(this)
          .closest("div")
          .find("select")
          .val(),
      };
    } else {
      songData = {
        id: $(this)
          .closest("div")
          .find("#song_id")
          .val(),
        genres: ["None"],
      };
    }
    updateSongData(songData);
    e.stopPropagation();
  });

  $(".admin-cancel-button").click(function(e) {
    $(this)
      .parent()
      .hide();
    $(this)
      .parent()
      .next()
      .show();
    e.stopPropagation();
  });
  // Play song
  $(".play-song").click(function(e) {
    e.preventDefault();
    var songData = {
      id: $(this)
        .next()
        .val(),
    };
    $.ajax({
      url: "/admin/songs/" + songData["id"] + "/play_song",
      dataType: "json",
      method: "GET",
      data: songData,
      async: false,
      success: function(data) {
        playingUrl = data.playing_url;
        window.open(playingUrl);
      },
    });
  });
  // Js for modal in admin songs page
  var modal;
  // When the user clicks the button, open the modal
  $(".openModal").click(function(e) {
    e.preventDefault();
    modal = $(this).next();
    $(this)
      .next()
      .css({
        display: "block",
      });
  });

  // When the user clicks on <span> (x), close the modal
  $(".close").click(function(e) {
    modal.css({
      display: "none",
    });
  });

  // Trigger these js on admin/songs page only
  if ($(document).find(".modal").length) {
    // When the user clicks anywhere outside of the modal, close it
    $(window).click(function(e) {
      if (typeof modal !== "undefined") {
        if ($(event.target)[0] == modal[0]) {
          modal.css({
            display: "none",
          });
        }
      }
    });
    // To fix the header of the table
    // $(".index_table").wrap($('<div class="scroll-table"> </div>'));
    var $table = $(".index_table");
    // $table.floatThead({
    //   scrollContainer: function($table) {
    //     return $('.scroll-table')
    //   },
    //   zIndex: 1,
    // })
    $(".dropdown_menu_button").click(function(e) {
      e.preventDefault();
    });
    $(".batch_action").click(function(e) {
      e.preventDefault();
    });
  }
  $(".batch_action").click(function(e) {
    switch (e.target.text) {
      case "Push Mirror Selected":
        $("#dialog_confirm")
          .prev()
          .find("span")
          .text("Please Select Game Code");
        break;
      case "Add To Playlist Selected":
        $("#dialog_confirm")
          .prev()
          .find("span")
          .text("Please Select Playlist");
        break;
      case "Add To Session Selected":
        $("#dialog_confirm")
          .prev()
          .find("span")
          .text("Please Select Open Session");
        break;
    }
    $(
      ".ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.active_admin_dialog.ui-dialog-buttons.ui-draggable.ui-resizable"
    ).css({ height: "400px", "overflow-y": "auto" });
  });

  $(".add-field-expanded-data").click(function(e) {
    e.preventDefault();
    $(this).before(
      '<input type="text"> </input><i class="fa fa-times remove-expanded-song-field" aria-hidden="true"></i>'
    );
    removeExpandedSongField();
  });

  $(".add-field-expanded-double-data").click(function(e) {
    e.preventDefault();
    $(this).before(
      '<input type="text" class="song_double_custom_data_1"> </input><input type="text" class="song_double_custom_data_2"> </input><i class="fa fa-times remove-expanded-double-song-field" aria-hidden="true"></i>'
    );
    removeExpandedSongDoubleField();
  });

  $(".add-field-expanded-question-data").click(function(e) {
    e.preventDefault();
    $(this).before(
      '<input type="text" class="song_question_answer_pairs_1"> </input><input type="text" class="song_question_answer_pairs_1"> </input><i class="fa fa-times remove-expanded-double-song-field" aria-hidden="true"></i>'
    );
    removeExpandedSongDoubleField();
  });

  // To get the values from database
  $(".open-modal-expanded-data").one("click", function(e) {
    var link = $(this);
    var songData = { id: $(this).data("id") };
    var data = getExpandedData(songData);
    $.each(data.single_datas, function(index, value) {
      var label = link
        .next()
        .find(".single-data-section label")
        .after(
          '<br /><input type ="text"> </input><i class="fa fa-times remove-expanded-song-field" aria-hidden="true"></i>'
        );
      label
        .next()
        .next()
        .val(value.single_custom_data);
    });
    $.each(data.double_datas, function(index, value) {
      var label = link.next().find(".double-data-section label");
      label.after(
        '<br /><input type="text" class="song_double_custom_data_1" value=""> </input><input type="text" class="song_double_custom_data_2"> </input><i class="fa fa-times remove-expanded-double-song-field" aria-hidden="true"></i>'
      );
      label
        .next()
        .next()
        .val(value.double_custom_data1);
      label
        .next()
        .next()
        .next()
        .val(value.double_custom_data2);
    });
    $.each(data.question_answer_datas, function(index, value) {
      var label = link.next().find(".question-answer-section label");
      label.after(
        '<br /><input type="text" class="song_question_answer_pairs_1" value=""> </input><input type="text" class="song_question_answer_pairs_1"> </input><i class="fa fa-times remove-expanded-double-song-field" aria-hidden="true"></i>'
      );
      label
        .next()
        .next()
        .val(value.question);
      label
        .next()
        .next()
        .next()
        .val(value.answer);
    });
    removeExpandedSongField();
    removeExpandedSongDoubleField();
  });

  // To save custom single data
  $(".modal .submit-custom-data").click(function(e) {
    e.preventDefault();
    var songId = $(this)
      .parent()
      .parent()
      .find("#song_id")
      .val();
    var singleData = [];
    $.each(
      $(this)
        .parent()
        .find("input[type=text]"),
      function(index, value) {
        singleData.push($(this).val());
      }
    );
    var songData = { id: songId, single_data: singleData };
    saveExpandedData(songData);
  });

  // To save custom double data
  $(".modal .submit-custom-double-data").click(function(e) {
    e.preventDefault();
    var songId = $(this)
      .parent()
      .parent()
      .find("#song_id")
      .val();
    var doubleData = {};
    var custom1 = [];
    var custom2 = [];
    $.each(
      $(this)
        .parent()
        .find("input[type=text]"),
      function(index, value) {
        if (index % 2 === 0) custom1.push($(this).val());
        else custom2.push($(this).val());
      }
    );
    $.each(custom1, function(index, value) {
      doubleData[value] = custom2[index];
    });
    var songData = { id: songId, double_data: doubleData };
    saveExpandedData(songData);
  });

  // To save question answer data
  $(".modal .submit-custom-question-data").click(function(e) {
    e.preventDefault();
    var songId = $(this)
      .parent()
      .parent()
      .find("#song_id")
      .val();
    var questionAnswerData = {};
    var question = [];
    var answer = [];
    $.each(
      $(this)
        .parent()
        .find("input[type=text]"),
      function(index, value) {
        if (index % 2 === 0) question.push($(this).val());
        else answer.push($(this).val());
      }
    );
    $.each(question, function(index, value) {
      questionAnswerData[value] = answer[index];
    });
    var songData = { id: songId, question_data: questionAnswerData };
    saveExpandedData(songData);
  });
});

function getExpandedData(songData) {
  var result = [];
  $.ajax({
    url: "/admin/songs/" + songData.id + "/get_expanded_data",
    dataType: "json",
    method: "GET",
    data: songData,
    async: false,
    success: function(data) {
      result = data;
    },
  });
  return result;
}

function saveExpandedData(songData) {
  $.ajax({
    url: "/admin/songs/" + songData.id + "/update_song_custom_data",
    dataType: "json",
    method: "POST",
    data: songData,
    async: false,
    success: function(data) {
      alert("Successfully Added");
    },
  });
}

function updateSongData(songData) {
  $.ajax({
    url: "/admin/songs/" + songData.id + "/update_song",
    dataType: "json",
    method: "PATCH",
    data: songData,
    async: false,
    success: function(data) {
      if (songData.title) {
        $("#song_" + data.id)
          .find(".admin-song-title-form")
          .hide();
        $("#song_" + data.id)
          .find(".admin-song-title")
          .show();
        $("#song_" + data.id)
          .find(".admin-song-title")
          .text(data.title);
      } else if (songData.artist) {
        $("#song_" + data.id)
          .find(".admin-song-artist-form")
          .hide();
        $("#song_" + data.id)
          .find(".admin-song-artist")
          .show();
        $("#song_" + data.id)
          .find(".admin-song-artist")
          .text(data.artist);
      } else if (songData.year) {
        $("#song_" + data.id)
          .find(".admin-song-year-form")
          .hide();
        $("#song_" + data.id)
          .find(".admin-song-year")
          .show();
        $("#song_" + data.id)
          .find(".admin-song-year")
          .text(data.year);
      } else {
        $("#song_" + data.id)
          .find(".admin-song-genres")
          .text(data.genre_names || "Add");
        $("#song_" + data.id)
          .find(".admin-song-genres")
          .parent()
          .addClass("grey-links");
        $("#song_" + data.id)
          .find(".modal")
          .css({
            display: "none",
          });
      }
    },
  });
}

function removeExpandedSongField() {
  $(".remove-expanded-song-field").click(function(e) {
    $(this)
      .prev()
      .remove();
    $(this).remove();
  });
}

function removeExpandedSongDoubleField() {
  $(".remove-expanded-double-song-field").click(function(e) {
    $(this)
      .prev()
      .prev()
      .remove();
    $(this)
      .prev()
      .remove();
    $(this).remove();
  });
}
