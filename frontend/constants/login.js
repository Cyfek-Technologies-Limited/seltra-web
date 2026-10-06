export const formData = {
  login: {
    title: "Please Login to Continue",
    array: [
      { label: "Email", placeholder: "Email" },
      { label: "Password", placeholder: "********", type: "password" },
    ],
    btmText: "Don’t have an account? ",
    btmLabel: "Sign Up",
    btmRoute: "/signUp",
    btnText: "Login",
  },
  trouble: {
    title: "Trouble signing in?",
    array: [{ label: "Email Address", placeholder: "Email" }],
    btmText: "Remembered it?",
    btmLabel: "Login",
    btmRoute: "/login",
    route: "/resetPassword",
    btnText: "Submit",
    subtitle: "Let’s help you reset your password.",
  },
  newPass: {
    title: "Set a new Password",
    array: [
      { label: "New Password", placeholder: "********", type: "password" },
      {
        label: "Confirm New Password",
        placeholder: "********",
        type: "password",
      },
    ],
    submitFn: "()=>setType('newPass')",
    btmRoute: "/signUp",
    btnText: "Reset Password",
  },
};
