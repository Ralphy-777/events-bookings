import AsyncStorage from '@react-native-async-storage/async-storage';

type TokenKey = 'clientToken' | 'organizerToken' | 'clientUserName' | 'clientUserId';

export const saveToken = (key: TokenKey, value: string) =>
  AsyncStorage.setItem(key, value);

export const getToken = (key: TokenKey) =>
  AsyncStorage.getItem(key);

export const removeToken = (key: TokenKey) =>
  AsyncStorage.removeItem(key);

export const clearAllTokens = () =>
  Promise.all([
    AsyncStorage.removeItem('clientToken'),
    AsyncStorage.removeItem('organizerToken'),
    AsyncStorage.removeItem('clientUserName'),
    AsyncStorage.removeItem('clientUserId'),
  ]);
