module ActiveAdmin::ViewHelper
  def flash_notification(message)
    %Q( <div class="flashes"><div class="flash flash_notice">#{message}</div></div>)
  end

  def prompt_select_value(value)
    if value== "999999"
      return "Show All"
    else
      return value
    end
  end

  def get_title_section(song)
    "<div class = 'admin-song-title-section'>
      <div class='admin-song-title-form'>
        #{text_area_tag "song[title]", song.title, rows: 4, cols: 6}
        #{hidden_field_tag "song[id]", song.id}
        <br />
          <i class='fa fa-check admin-update-button-title' aria-hidden='true'></i>
          &nbsp; &nbsp;
          <i class='fa fa-times admin-cancel-button' aria-hidden='true'></i>
      </div>
      <div class='admin-song-title'>
        #{song.title}<i class='fa fa-pencil-square-o' aria-hidden='true'></i>
      </div>
    </div>".html_safe
  end

  def get_artist_section(song)
    "<div class = 'admin-song-artist-section'>
      <div class='admin-song-artist-form'>
        #{text_area_tag "song[artist]", song.artist, rows: 4, cols: 6}
        #{hidden_field_tag "song[id]", song.id}
        <br />
          <i class='fa fa-check admin-update-button-artist' aria-hidden='true'></i>
          &nbsp; &nbsp;
          <i class='fa fa-times admin-cancel-button' aria-hidden='true'></i>
      </div>
      <div class='admin-song-artist'>
        #{song.artist}<i class='fa fa-pencil-square-o' aria-hidden='true'></i>
      </div>
    </div>".html_safe
  end

  def get_year_section(song)
    "<div class = 'admin-song-year-section'>
      <div class='admin-song-year-form'>
        #{text_area_tag "song[year]", song.year, rows: 1, id:"text_area_year", maxlength: "4"}
        #{hidden_field_tag "song[id]", song.id}
        <br />
          <i class='fa fa-check admin-update-button-year' aria-hidden='true'></i>
          &nbsp; &nbsp;
          <i class='fa fa-times admin-cancel-button' aria-hidden='true'></i>
      </div>
      <div class='admin-song-year'>
        <span> #{song.year}</span><i class='fa fa-pencil-square-o' aria-hidden='true'></i>
      </div>
    </div>".html_safe
  end

  def get_genres_section(song)
    "<a href= '#' class = 'openModal' data-id=#{song.id}>
      #{ if song.genres.present?
          "<div class='admin-song-genres genre-link'>
            #{song.genres.map(&:name).join ', ' }<i class='fa fa-pencil-square-o' aria-hidden='true'></i>
          </div>".html_safe
         else
          "<div class='admin-song-genres'>
            Add<i class='fa fa-pencil-square-o' aria-hidden='true'></i>
          </div>".html_safe
         end
       }
    </a>
    <div class = 'modal'>
      <div class='modal-content'>
        <span class='close'>×</span>
        <strong> #{song.title}</strong>
        <br />
        <div class='admin-song-genres-form'>
          #{select_tag 'genre', options_for_select(@genre_names,song.genres.pluck(:name)), multiple:true, class:'multi-select' }
          #{hidden_field_tag 'song[id]', song.id }
          #{submit_tag 'Save', class:"admin-update-button-genres"}
        </div>
      </div >
    </div>".html_safe
  end

  def get_links_section(song)
    "<a href='#' class='openModal' data-id=#{song.id}> Actions </a>
    <div class = 'modal'>
      <div class='modal-content'>
        <span class='close'>×</span>
        <strong> #{song.title}</strong>
        #{link_to 'View', admin_song_path(song), target: "_blank", class: 'mm-button info'}
        #{link_to 'Edit', edit_admin_song_path(song), target: "_blank", class: 'mm-button'}
        #{if song.before_archive_path.blank?
          # render partial: "admin/songs/play_song", locals: {song:song}
          "<div class='archive-button'>
          #{link_to "Play", '#', class:'play-song mm-button success'}
          #{hidden_field_tag "song[id]", song.id}
            #{link_to "Archive", archive_song_path(song), data: {confirm: "Are you sure you want to archive this song?"}, remote: true, class: "archive-link mm-button danger"}
          </div>".html_safe
        else
          "<div class='archive-button'>
            #{link_to "Unarchive", unarchive_song_path(song), data: {confirm: "Are you sure you want to unarchive this song?"}, remote: true, class: "unarchive-link mm-button success" }
          </div>".html_safe
        end}
        #{if song.active
          "<div class='active-button'>
            #{link_to "Inactive", admin_active_inactive_song_path(song), data: {confirm: "Are you sure you want to make this song Inactive"},remote:true, class: 'admin-active-inactive-button mm-button danger'}
          </div>".html_safe
        else
          "<div class='active-button'>
            #{link_to "Active", admin_active_inactive_song_path(song), data: {confirm: "Are you sure you want to make this song Active"},remote:true, class: 'admin-active-inactive-button mm-button success'}
          </div>".html_safe
        end}
      </div>
    </div>".html_safe
  end

  def get_addtional_data_section(song)
    "<a href='#' class='openModal open-modal-expanded-data' data-id=#{song.id}> Expanded data </a>
    <div class='modal'>
      <!-- Modal content -->
      <div class='modal-content'>
        <span class='close'>×</span>
        #{ hidden_field_tag "song[id]", song.id }
        <div class='single-data-section'>
          #{ label_tag "song[single_custom_data]", "Additional Song Data Single" }
          <br  />
          #{link_to 'Add', '#', class: "add-field-expanded-data"}
          #{submit_tag 'Save', class: "submit-custom-data"}
        </div>
        <br  />
        <div class= 'double-data-section'>
          #{label_tag "song[double_custom_data]", "Additional Song Data Double"}
          <br  />
          #{link_to 'Add', '#', class: "add-field-expanded-double-data"}
          #{submit_tag 'Save', class: "submit-custom-double-data"}
        </div>
        <br  />
        <div class = 'question-answer-section'>
          #{label_tag "song[question_answer_pairs]", "Question Answer Pair"}
          <br  />
          #{link_to 'Add', '#', class: "add-field-expanded-question-data"}
          #{submit_tag 'Save', class: "submit-custom-question-data"}
        </div>
        <br  />
      </div>
    </div>".html_safe
  end
end
