class Charge < ApplicationRecord
  belongs_to :account

  def generate(charge, email, account)
    Charge.create(stripe_id: charge.id,
                  amount: charge.amount,
                  currency: charge.currency,
                  description: charge.description,
                  customer: charge.customer,
                  name: charge.source.name,
                  brand: charge.source.brand,
                  country: charge.source.country,
                  exp_month: charge.source.exp_month,
                  exp_year: charge.source.exp_year,
                  last4: charge.source.last4,
                  status: charge.status,
                  credited_at: charge.created,
                  funding: charge.source.funding,
                  email: email,
                  account_id: account,
                  expiring_at: Time.now+24.hours
                  )
  end
end
