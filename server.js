const express = require('express');
const request = require('request');

const app = express();
const port = process.env.PORT || 3030;

app.set('strict routing', true);

app.get('/api/ping', (req, res) => {
  res.send({ express: 'pong' });
});

app.use('/api/cors/', (req, res) => {
  console.log(req.url);
  console.log(req.originalUrl);
  console.log(req.params);
  console.log(req.query);
  //req.pipe(request())
});

/*
// Forward all requests from /api to http://foo.com/api
app.use('/api', function(req, res) {
  req.pipe(request("http://foo.com/api" + req.url)).pipe(res);
});
 */

app.listen(port, () => console.log(`Express server listening on port ${port}`));
