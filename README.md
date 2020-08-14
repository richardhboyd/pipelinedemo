# Welcome to your CDK TypeScript Construct Library project!

You should explore the contents of this project. It demonstrates a CDK Construct Library that includes a construct (`Pipeline`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The construct defines an interface (`PipelineProps`) to configure the visibility timeout of the queue.

## Useful commands
```bash
docker container prune --force
docker image prune --force
docker volume prune --force
docker build -t wtf .
docker create --name extract wtf:latest
docker cp extract:/home/ec2-user/environment/pipeline/dist ./
```
```text
CREDS=$(curl -s http://169.254.169.254/latest/meta-data/identity-credentials/ec2/security-credentials/ec2-instance)
export AWS_ACCESS_KEY_ID=$(echo "${CREDS}" | jq -r '.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo "${CREDS}" | jq -r '.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo "${CREDS}" | jq -r '.Token')
docker build --build-arg AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID --build-arg AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY --build-arg AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN -t wtf .
```