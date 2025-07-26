# if AdminUser.first.enabled_stripe_test
#   AdminUser.first.update_attribute :enabled_stripe_test, false
#   Rails.configuration.stripe = {
#     :publishable_key => ENV['PUBLISHABLE_KEY'],
#     :secret_key      => ENV['SECRET_KEY']
#   }
# else
#   AdminUser.first.update_attribute :enabled_stripe_test, true
#   Rails.configuration.stripe = {
#     :publishable_key => ENV['PUBLISHABLE_KEY_TEST'],
#     :secret_key      => ENV['SECRET_KEY_TEST']
#   }
# end
# Stripe.api_key = Rails.configuration.stripe[:secret_key]
