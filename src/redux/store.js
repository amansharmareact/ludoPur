import reduxStorage from './storage';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  REGISTER,
  PERSIST,
  PURGE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import rootReducer from './rootReducer';
import {configureStore} from '@reduxjs/toolkit';

const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  blacklist: [],
  whitelist: ['game'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, REGISTER, PAUSE, PURGE, PERSIST],
      },
    }),
});

export const persistor = persistStore(store);
