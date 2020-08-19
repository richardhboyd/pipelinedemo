# Welcome to your CDK TypeScript Construct Library project!

You should explore the contents of this project. It demonstrates a CDK Construct Library that includes a construct (`Pipeline`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The construct defines an interface (`PipelineProps`) to configure the visibility timeout of the queue.

## Useful commands
```bash
REGION=$(curl -s http://169.254.169.254/latest/dynamic/instance-identity/document | sed -n 's/.*"region" : "\([a-z0-9-]*\)",/\1/p')
docker container prune --force
docker image prune --force
docker volume prune --force
docker build -t fan \
  --build-arg DOMAIN_NAME=testdomain \
  --build-arg DOMAIN_OWNER=775000485103 `#Only needed if the domain is owned by an external account` \
  --build-arg REPOSITORY_NAME=testrepo \
  --build-arg REGION=$REGION \
  .
docker create --name extract2 fan:latest
docker cp extract2:/app/dist ./dist
```