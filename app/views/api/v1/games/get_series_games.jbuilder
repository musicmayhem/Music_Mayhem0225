series_data = []
series = Series.all
series.each do |s|
  code = []
  s.open_sessions.each do |os|
    code << os.games.pluck(:code)
  end
  s = s.attributes.merge({code: code.length > 1 ? code.uniq.join('|') : code})
  series_data << s
end
json.series (series_data)
