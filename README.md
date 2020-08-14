# Welcome to your CDK TypeScript Construct Library project!

You should explore the contents of this project. It demonstrates a CDK Construct Library that includes a construct (`Pipeline`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The construct defines an interface (`PipelineProps`) to configure the visibility timeout of the queue.

## Useful commands

 * `sudo rm -rf ./node_modules/ && sudo rm -rf ./dist/ && docker run -v ${PWD}:/code -w="/code" -ti jsii/superchain /bin/bash -c "npm clean-install; npm run build; npm run package"`   compile typescript to js