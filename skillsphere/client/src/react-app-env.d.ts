/// <reference types="react-scripts" />

interface ProcessEnv {
  REACT_APP_RAZORPAY_KEY_ID: string;
}

declare global {
  var process: {
    env: ProcessEnv;
  };
}
