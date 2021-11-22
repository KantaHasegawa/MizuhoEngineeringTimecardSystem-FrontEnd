import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

type User = {
  name: string;
  role: string;
};

export const isLogedInState = atom<Boolean>({
  key: 'isLogedInState',
  default: false,
  effects_UNSTABLE: [persistAtom],
});

export const userInfoState = atom<User>({
  key: 'userInfoState',
  default: { name: '', role: '' },
  effects_UNSTABLE: [persistAtom],
});

export const isUserLoadingState = atom<Boolean>({
  key: 'isUserLoadingState',
  default: false,
  effects_UNSTABLE: [persistAtom],
});

export const isUserErrorState = atom<Boolean>({
  key: 'isUserErrorState',
  default: false,
  effects_UNSTABLE: [persistAtom],
});

export const csrfTokenState = atom<string>({
  key: 'csrfTokenState',
  default: '',
  effects_UNSTABLE: [persistAtom],
});
