# LamdaHandler

_LambdaHandler_ is a library designed to make it easy to write AWS Lambda function in typescript. It tries to abstract the more mondane logic related to implementing a AWS Lambda function.

The library caters primarely to handling AWS API Gateaway request using the _Lambda Proxy integration_.

The _LambdaHandler_ library is designed to write reusable object oriented code for Lambda.

# Key features
* Abstract the AWS API Gateway Event and AWS Lambda Proxy Callback via `Request` and `Response` objects.
* Provide classes for standard HTTP errors.
* Provide a handlers for typical task like accessing a Dynamo table via a RESTFull API, Queing requests in an SQS Queue or Proxying a request to a different server.


# Installation
```bash
npm install --save ts-lambda-handler
```

# Sample project with Serverless
[Have a look at the sample project](https://github.com/syrp-nz/serverless-ts-lambda-handler-sample) to see how you can use the Serverless Framework and LambdaHandler to build a simple AWS micro-service.

The Serverless Framework make it really easy to deploy micro service to AWS. _LambdaHandler_ can be use without the Serverless if you would rather deploy your function some other way.

# Show me some examples

```typescript

import * as LambdaHandler from 'ts-lambda-handler';

class HelloWorld extends LambdaHandler.Handlers.AbstractHandler {
    public process(request: LambdaHandler.Request, response: LambdaHandler.Response): Promise<void> {
        response
            .setBody('Hello World')
            .addHeader('content-type', 'text/plain')
            .send();
        return Promise.resolve();
    }
}

export let handler = new HelloWorld().handle;

```

# Steps taken to allow this project to be loaded from github via npm (instead of npm.org):
* Disabled source maps in local tsconfig.json by removing `mapRoot` property and setting `sourceMaps` to `false`
* Added `"files": ["dist"]` to local package.json so that npm would download the `dist` directory when pulling from github
* Built this project using `npm run compile`
* Pushed `dist` directory (and other local config changes) to github

# To use this library from another npm project:
* Update package.json inside the project in which you want to use ts-lambda-handler so that the ts-lambda-handler package "ref" says:
`"ts-lambda-handler": "github:hannonhill/ts-lambda-handler"`
* Run `npm install` in the project which uses this fork.


