const express = require('express');
const next = require('next');
const morgan = require('morgan');
const path = require('path');

const port = parseInt(process.env.PORT, 10) || 13080;
const dev = process.env.NODE_ENV !== 'production';
// const prod = process.env.NODE_ENV === 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(morgan('dev'));
  server.use('/', express.static(path.join(__dirname, 'public')));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  server.get('/member/:id', (req, res) => app.render(req, res, '/member/member', { id: req.params.id }));


  server.get('*', (req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`next+express running on port ${port}`);
  });
});
