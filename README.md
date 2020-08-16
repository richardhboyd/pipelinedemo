# Welcome to your CDK TypeScript Construct Library project!

You should explore the contents of this project. It demonstrates a CDK Construct Library that includes a construct (`Pipeline`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The construct defines an interface (`PipelineProps`) to configure the visibility timeout of the queue.

## Useful commands
```bash
docker container prune --force
docker image prune --force
docker volume prune --force
docker build -t fan .
docker create --name extract2 fan:latest
docker cp extract2:/home/ec2-user/environment/pipeline ./out
```