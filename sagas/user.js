import { all, fork, takeLatest, call, put } from 'redux-saga/effects';
import { axiosInstance } from '../utils/http_handler';
import { LOAD_ME_FAILURE, LOAD_ME_SUCCESS, LOAD_ME_REQUEST } from '../actions';

function loadMeAPI(token) {
  return axiosInstance.get('/loadme', { headers: { authorization: token } });
}

function* loadMe(action) {
  try {
    const data = yield call(loadMeAPI, action.data);
    yield put({
      type: LOAD_ME_SUCCESS,
      data,
    });
  } catch (e) {
    yield put({
      type: LOAD_ME_FAILURE,
      data: e,
    });
  }
}

function* watchLoadMe() {
  yield takeLatest(LOAD_ME_REQUEST, loadMe);
}

export default function* userSaga() {
  yield all([
    fork(watchLoadMe),
  ]);
}
