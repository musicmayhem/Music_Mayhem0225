if params[:spiff_id]
  spiff = Spiff.find_by_id(params[:spiff_id])
  spiffRedeemed = spiff&.update(redeemed_at: DateTime.now.strftime('%B %d, %Y'))
  spiff = current_account&.spiffs.order(redeemed_at: :desc)
  json.spiffs spiff
  json.spiffRedeemed(spiffRedeemed)
end
