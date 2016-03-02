import http from 'http';
import express from 'express';
import webpack from 'webpack';
import path from 'path';

const ENV = (process.env.NODE_ENV || 'development').trim();
console.log('Run mode:', ENV);

export function createServer(config, webpackConfig, callback) {

    const compiler = webpack(webpackConfig);
    const { port } = config;

    const httpServer = http.createServer();
    const app = express();

    httpServer.on('request', app);

    let devMiddleware;

    if (ENV === 'development') {

        devMiddleware = require('webpack-dev-middleware')(compiler, {
            noInfo: true,
            publicPath: webpackConfig.output.publicPath
        });

        app.use(devMiddleware);
        app.use(require('webpack-hot-middleware')(compiler));

    }

    callback(app, httpServer);

    if (ENV === 'development') {

        app.get('*', function(req, res) {
            const index = devMiddleware.fileSystem.readFileSync(
                path.join(webpackConfig.output.path, 'index.html')
            );
            res.end(index);
        });

    }

    httpServer.listen(port, function() {
      console.log('Listening at http://localhost:' + port)
    });

    return { app, httpServer };
}

