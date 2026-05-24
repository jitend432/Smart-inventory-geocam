import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import itemReducer from './slices/itemSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['items'],
};

const persistedReducer = persistReducer(persistConfig, itemReducer);

export const store = configureStore({
  reducer: {
    items: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);