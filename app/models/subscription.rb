class Subscription < ApplicationRecord
  belongs_to :account
  after_create :change_user_role

  def generate(customer, subscription, account)
    Subscription.create(
      plan_id: subscription.plan.id,
      customer_token: customer,
      subscription_id: subscription.id,
      amount: subscription.plan.amount,
      status: subscription.status,
      current_period_start: Time.at(subscription.current_period_start),
      current_period_end: Time.at(subscription.current_period_end),
      plan_name:  subscription.plan.name,
      interval: subscription.plan.interval,
      account_id: account.id
    )
  end

  def change_user_role
    unless self.account.role == 'admin' || self.account.role == 'host'
      if self.account.subscription.plan_id == 'MMOrg2' || self.account.subscription.plan_id == 'MMOrg1'
        self.account.update_attribute :role, 'organization'
      else
        self.account.update_attribute :role, 'user'
      end
    end
  end

end
