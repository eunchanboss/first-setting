import React from 'react';
import axios from 'axios';
import { Container } from 'next/app';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import withReduxSaga from 'next-redux-saga'; // next용 redux-saga
import { createStore, compose, applyMiddleware } from 'redux';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import rootSaga from '../sagas';
import reducer from '../reducers';
import { auth } from '../utils/auth';
import { LOAD_ME_REQUEST } from '../actions';

const Main = ({ Component, store, pageProps }) => {
  return (
    <Container>
      <Provider store={store}>
        <Helmet
          title="Storyjam Factory"
          htmlAttributes={{ lang: 'ko' }}
          meta={[
            { charset: 'UTF-8' },
            {
              name: 'viewport',
              content: 'width=device-width,initial-scale=1,maximum-scale=1, viewport-fit=cover',
            },
            {
              name: 'format-detection', content: 'telephone=no',
            },
            {
              'http-equiv': 'X-UA-Compatible', content: 'IE=edge',
            }, {
              name: 'description', content: 'Amin Page Page',
            }, {
              property: 'og:title', content: 'Amin Page',
            }, {
              property: 'og:description', content: 'Amin Page Page',
            }, {
              property: 'og:type', content: 'website',
            },
          ]}
        />
      </Provider>
    </Container>
  );
};

Main.propTypes = {
  Component: PropTypes.elementType.isRequired,
  store: PropTypes.object.isRequired,
  pageProps: PropTypes.object.isRequired,
};

Main.getInitialProps = async (context) => {
  const { ctx, Component } = context;

  const token = auth(ctx);
  if (token) {
    axios.defaults.headers.authorization = token;
  }

  const state = ctx.store.getState();
  if (token && !state.user.isLoggedIn) {
    ctx.store.dispacth({
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

export default withRedux(configureStore)(withReduxSaga(Main));