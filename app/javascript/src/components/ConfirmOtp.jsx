import React from "react";
import { connect } from "react-redux";
import { confirmOtp } from "../actions/accountAction";
import { RESEND_EMAIL_CONFIRMATION } from "../constants/authConstants";
import { postRequest } from "../actions/gameAction";

// CSS styles for the component
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px",
    maxWidth: "500px",
    margin: "0 auto",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  subtitle: {
    color: "#666",
    marginBottom: "24px",
    textAlign: "center",
  },
  otpContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
    gap: "8px",
  },
  otpInput: {
    width: "48px",
    height: "48px",
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "bold",
    border: "1px solid #ccc",
    borderRadius: "6px",
    outline: "none",
  },
  otpInputFocus: {
    border: "1px solid #3b82f6",
    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
  },
  errorMessage: {
    marginBottom: "16px",
    textAlign: "center",
    color: "#dc2626",
  },
  successMessage: {
    textAlign: "center",
    color: "#666",
    marginBottom: "24px",
  },
  button: {
    width: "100%",
    padding: "12px 16px",
    marginBottom: "16px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  buttonHover: {
    backgroundColor: "#2563eb",
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
    cursor: "not-allowed",
  },
  resendContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  },
  resendText: {
    color: "#666",
  },
  resendButton: {
    marginLeft: "8px",
    color: "#3b82f6",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  resendButtonDisabled: {
    color: "#9ca3af",
    cursor: "not-allowed",
  },
  successContainer: {
    textAlign: "center",
  },
  successIcon: {
    fontSize: "64px",
    color: "#16a34a",
    marginBottom: "16px",
  },
  successTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  continueButton: {
    padding: "12px 16px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};

class ConfirmOtp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      otp: new Array(4).fill(""),
      error: "",
      success: false,
      isVerifying: false,
      resendDisabled: false,
      timer: 0,
    };

    this.inputRefs = [];
    this.timerInterval = null;
  }

  componentDidMount() {
    // Focus on first input when component mounts
    if (this.inputRefs[0]) {
      this.inputRefs[0].focus();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Handle timer for resend functionality
    if (prevState.timer !== this.state.timer) {
      if (this.state.timer > 0 && !this.timerInterval) {
        this.timerInterval = setInterval(() => {
          this.setState((prevState) => ({
            timer: prevState.timer - 1,
          }));
        }, 1000);
      } else if (this.state.timer === 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.setState({ resendDisabled: false });
      }
    }
    if (
      !prevProps.auth.otpVerificationFailed &&
      this.props.auth.otpVerificationFailed
    ) {
      this.setState(
        {
          otp: new Array(4).fill(""),
        },
        () => {
          // Focus on first input after clearing
          if (this.inputRefs[0]) {
            this.inputRefs[0].focus();
          }
        }
      );
    }
  }

  componentWillUnmount() {
    // Clear interval when component unmounts
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...this.state.otp];
    newOtp[index] = element.value;

    this.setState({ otp: newOtp }, () => {
      // Auto-focus next input
      if (element.value !== "" && index < 3) {
        this.inputRefs[index + 1].focus();
      }
    });

    // Clear error on input change
    if (this.state.error) {
      this.setState({ error: "" });
    }
  };

  handleKeyDown = (e, index) => {
    // Handle backspace - focus previous input
    if (e.key === "Backspace" && !this.state.otp[index] && index > 0) {
      this.inputRefs[index - 1].focus();
    }
  };

  handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");

    // Check if pasted content is a number and has correct length
    if (/^\d+$/.test(pastedData)) {
      const pastedOtp = pastedData.substring(0, 4).split("");
      const newOtp = [...this.state.otp];

      // Fill in OTP fields as much as possible
      pastedOtp.forEach((digit, idx) => {
        if (idx < 4) newOtp[idx] = digit;
      });

      this.setState({ otp: newOtp }, () => {
        // Focus last filled input or the next empty one
        const lastIndex = Math.min(pastedOtp.length, 3);
        this.inputRefs[lastIndex].focus();
      });
    }
  };

  verifyOTP = () => {
    if (this.state.otp.some((digit) => digit === "")) {
      this.setState({ error: "Please enter all digits" });
      return;
    }

    this.setState({ isVerifying: true, error: "" });
    const enteredOTP = this.state.otp.join("");
    this.props.confirmOtp({
      email: this.props.auth.data.account.email,
      otp: enteredOTP,
    });
  };

  resendOTP = () => {
    this.props.postRequest("player/resend_email_confirmation", {
      type: RESEND_EMAIL_CONFIRMATION,
      values: { email: this.props.auth.data.account.email },
    });
    this.setState(
      {
        otp: new Array(4).fill(""),
        error: "",
        success: false,
        resendDisabled: true,
        timer: 30,
      },
      () => {
        // Focus first input
        this.inputRefs[0].focus();

        // Show brief success message for resend
      }
    );
  };

  playGame() {
    localStorage.removeItem("temp_user");
    // this.props.history.push("/player/" + this.props.match.params.game_code);
    window.location.href = `/player/${this.props.game.game.code}`;
  }

  render() {
    return (
      <div style={styles.container}>
        {!this.props.auth.optVerified ? (
          <div>
            <div style={styles.otpContainer}>
              {this.state.otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (this.inputRefs[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => this.handleChange(e.target, index)}
                  onKeyDown={(e) => this.handleKeyDown(e, index)}
                  onPaste={index === 0 ? this.handlePaste : null}
                  style={styles.otpInput}
                />
              ))}
            </div>

            {this.state.error && (
              <p
                style={
                  this.state.error.includes("sent")
                    ? { ...styles.errorMessage, color: "#16a34a" }
                    : styles.errorMessage
                }
              >
                {this.state.error}
              </p>
            )}

            <button
              onClick={this.verifyOTP}
              disabled={this.props.auth.verifyingOTP}
              style={
                this.props.auth.verifyingOTP
                  ? { ...styles.button, ...styles.buttonDisabled }
                  : styles.button
              }
            >
              {this.props.auth.verifyingOTP ? "Verifying..." : "Verify Code"}
            </button>

            <div style={styles.resendContainer}>
              <span style={styles.resendText}>Didn't receive the code?</span>
              <button
                onClick={this.resendOTP}
                disabled={this.state.resendDisabled}
                style={
                  this.state.resendDisabled
                    ? { ...styles.resendButton, ...styles.resendButtonDisabled }
                    : styles.resendButton
                }
              >
                {this.state.resendDisabled
                  ? `Resend in ${this.state.timer}s`
                  : "Resend"}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✓</div>
            <h3 style={styles.successTitle}>Verification Successful</h3>
            <p style={styles.successMessage}>
              Your account has been verified successfully.
            </p>
            <button
              style={styles.continueButton}
              onClick={() => {
                // Navigate to next step or dashboard
                this.playGame();
              }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    confirmOtp: (params) => dispatch(confirmOtp(params)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  };
};
export default connect((state) => {
  return {
    auth: state.auth,
    account: state.account,
    game: state.game,
  };
}, mapDispatchToProps)(ConfirmOtp);
