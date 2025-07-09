class UserMailer < ApplicationMailer
	default from: "\"Music Mayhem\" <games@gomayhem.com>"

	def feedback_email(subject,user,message,name)
		@message = message
		@email=user
		@name = name
		mail(to: "games@gomayhem.com", subject: subject, from: @email)
	end

	def score_mailer(name,rank,score,email)
		@name = name
		@rank = rank
		@score = score
		mail(to: email, subject: "Music Mayhem League Update" )
	end

	def confirmation_instructions(user, otp)
  	@user = user
  	@otp = otp
  	email = @user.email.presence || @user.unconfirmed_email
  	mail(to: email, subject: "Your Otp")
	end
end
