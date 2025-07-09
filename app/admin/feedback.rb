ActiveAdmin.register Feedback do
  menu parent: 'Misc'

  remove_filter :any_suggestions_or_ideas
  index do
    render partial: 'admin/shared/set_current_playlist_form', locals: {resource: "feedbacks"}
    selectable_column
    column :had_fun? do |feedback|
      feedback.did_you_have_fun ? "Yes" : "No"
    end
    column :everything_worked? do |feedback|
      feedback.did_everything_work ? "Yes" : "No"
    end
    column :contact_me? do |feedback|
      feedback.contact_me ? "Yes" : "No"
    end
    column :comments
    column :game_id do |g|
      link_to g.game_id, admin_game_path(g.game.code) if g.game
    end
    column :account_id do |g|
      link_to g.account_id, admin_account_path(g.account.id) if g.account
    end
    column :player do |feedback|
      feedback.player_id
    end
    actions
  end
end
