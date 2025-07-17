"use client";

import store, { persistor } from "../store";

import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";

function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

export default StoreProvider;
