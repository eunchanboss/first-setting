import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Provider, useSelector } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import withReduxSaga from 'next-redux-saga'; // next용 redux-saga
import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import axios from 'axios';
import Helmet from 'react-helmet';
import { Container } from 'next/app';
import rootSaga from '../sagas';
import reducer from '../reducers';
import Layout from '../containers/common/Layout';
import { auth, getToken } from '../utils/auth';

// 페이지들이 공통적인 부분을 모아준다.
// Next 에서 _app.js에 Component 를 넣어줌(page의 내용)

// store props는 어떻게 넣어주는지? -> next-redux-wrapper가 처리해 줌
// app.js 의 헬멧은 모든 페이지에 공통으로 적용할 헤더값


const StoryJam = ({ Component, store, pageProps }) => {
  return (
    <Container>
      <Provider store={store}>
        <Helmet
          title="StoryJam"
          htmlAttributes={{ class: 'no-js', lang: 'ko' }}
          meta={[
            { charset: 'UTF-8' },
            {
              name: 'viewport',
              content: 'width=device-width,initial-scale=1,maximum-scale=1, user-scalable=0, viewport-fit=cover',
            },
            {
              'http-equiv': 'X-UA-Compatible', content: 'IE=edge',
            }, {
              name: 'description', content: 'React Sample Page',
            }, {
              property: 'og:title', content: 'React Sample',
            }, {
              property: 'og:description', content: 'React Sample Page',
            }, {
              property: 'og:type', content: 'website',
            },
          ]}
          link={[
            { rel: 'stylesheet', href: '/css/common.css' },
            { rel: 'stylesheet', href: '/css/ReactCrop.css' },
          ]}
          bodyAttributes={{ ontouchstart: '' }}
        />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </Container>
  );
};

StoryJam.propTypes = {
  Component: PropTypes.elementType.isRequired,
  store: PropTypes.object.isRequired,
  pageProps: PropTypes.object.isRequired,
};
// 각 컴포넌트에서 getInitialProps 를 실행하기 위함.
// getInitialProps 는 pages 폴더의 component에서만 사용해야 한다.
StoryJam.getInitialProps = async (context) => {
  // console.log(context);
  const { ctx, Component } = context;

  const token = ctx.isServer ? auth(ctx) : getToken();
  console.log('app.js token:', token);

  if (token) {
    axios.defaults.headers.authorization = token;
  }

  const state = ctx.store.getState();
  if (token && !state.login.isLoggedIn) {
    ctx.store.dispatch({
      type: LOAD_ME_REQUEST,
      data: token,
    });
  }

  let pageProps = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx) || {};
  }
  return { pageProps };
};

/*
// 이 부분은 모두 똑같이 쓰이므로 그대로 쓰면 됨
export default withRedux((initialState, options) => {
  const sagaMiddleware = createSagaMiddleware();    // saga 미들웨어를 연결
  const middlewares = [sagaMiddleware];

  // redux dev tools 사용하기 위함
  const enhancer = process.env.NODE_ENV === 'production'
    ? compose(applyMiddleware(...middlewares))
    : compose(
      applyMiddleware(...middlewares),
    !options.isServer && typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined'
    ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f,
    );
  const store = createStore(reducer, initialState, enhancer);
  sagaMiddleware.run(rootSaga);
  return store;
})(ReactSample);
*/
const configureStore = (initialState, options) => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware];
  const enhancer = process.env.NODE_ENV === 'production'
    ? compose(applyMiddleware(...middlewares))
    : compose(
      applyMiddleware(...middlewares),
      !options.isServer && typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
    );
  const store = createStore(reducer, initialState, enhancer);
  store.sagaTask = sagaMiddleware.run(rootSaga); // next 에서 saga를 ssr 을 위해서 필요.
  return store;
};

export default withRedux(configureStore)(withReduxSaga(StoryJam));
