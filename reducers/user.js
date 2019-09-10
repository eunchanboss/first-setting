import producer from 'immer';
import { LOAD_ME_REQUEST, LOAD_ME_SUCCESS } from '../actions';

export const initialState = {
  loaddingMe: false,
  isLoggedIn: false,
  me: {
    uid: '',
    email: '',
    nickname: '',
    type: '',
    certifiedYn: 'N',
  },
};

const reducer = (state = initialState, action) => {
  const { type, data } = action;
  return producer(state, (draft) => {
    switch (type) {
      case LOAD_ME_REQUEST: {
        draft.loaddingMe = true;
        break;
      }
      case LOAD_ME_SUCCESS: {
        draft.me = data;
        draft.loaddingMe = false;
        draft.isLoggedIn = true;
        break;
      }
      default: {
        break;
      }
    }
  });
};

export default reducer;
