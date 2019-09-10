import cookie from 'js-cookie';
import nextCookie from 'next-cookies';
import Router from 'next/router';


export const setToken = (token) => {
  cookie.set('token', token, { expires: 7 });
};

export const unsetToken = () => {
  cookie.remove('token');
  // to support logging out from all windows
  window.localStorage.setItem('logout', Date.now());
};

export const getToken = () => cookie.get('token');

export const auth = (ctx) => {
  const { token } = nextCookie(ctx);

  /*
   * This happens on server only, ctx.req is available means it's being
   * rendered on server. If we are on server and token is not available,
   * means user is not logged in.
   */
  if (ctx.req && !token) {
    if (ctx.req.url !== '/login') {
      ctx.res.writeHead(302, { Location: 'https://dev.storyjam.co.kr:9030/login' });
      ctx.res.end();
    }
    return undefined;
  }

  // We already checked for server. This should only happen on client.
  if (!token) {
    Router.push('/login');
    return undefined;
  }

  return token;
};

// Gets the display name of a JSX component for dev tools
/*
const getDisplayName = component => component.displayName || component.name || 'Component';

export const withAuthSync = WrappedComponent =>
  class extends Component {
    static displayName = `withAuthSync(${getDisplayName(WrappedComponent)})`

    static async getInitialProps(ctx) {
      const token = auth(ctx);
      const componentProps = WrappedComponent.getInitialProps
      && (await WrappedComponent.getInitialProps(ctx));

      return { ...componentProps, token };
    }

    constructor(props) {
      super(props);

      this.syncLogout = this.syncLogout.bind(this);
    }

    componentDidMount() {
      window.addEventListener('storage', this.syncLogout);
    }

    componentWillUnmount() {
      window.removeEventListener('storage', this.syncLogout);
      window.localStorage.removeItem('logout');
    }


    render() {
      return <WrappedComponent {...this.props} />
    }
  };
*/
