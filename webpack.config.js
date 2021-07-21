const path = require('path');
module.exports = {
    mode: "production",
    entry: "./src/index.ts",
    output: {
        filename: "async-tools.js",
        path: path.resolve(__dirname, 'dist.webpack'),
        library: "AsyncTools",
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".js"]
    },
    module: {
        rules: [{ test: /\.ts$/, loader: "ts-loader" }]
    }
}
