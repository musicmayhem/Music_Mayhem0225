class OtpController < ApplicationController
  OTP_EXPIRATION_TIME = 5.minutes.ago

  def validate_otp
    user = User.find_by_confirmation_token(permitted_params[:otp])

    if user && user.confirmation_sent_at >= OTP_EXPIRATION_TIME
      user.confirm
      user.update(confirmation_token: nil)
      redirect_to confirmations_success_invitations_users_path, notice: "Email confirmed successfully!"
    else
      flash[:alert] = "Invalid or expired OTP. Please try again."
      redirect_to success_invitations_users_path(id: params[:user][:id])
    end
  end

  def resend_otp
    user = User.find_by(id: params[:user][:id])
    user.send_confirmation_instructions
    redirect_to success_invitations_users_path(id: params[:user][:id])
  end

  private

  def permitted_params
    params.require(:user).permit(:otp)
  end
end