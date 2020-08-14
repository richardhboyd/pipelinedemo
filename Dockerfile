FROM jsii/superchain AS build

# VOLUME ["/home/ec2-user/environment/pipeline"]

WORKDIR /home/ec2-user/environment/pipeline
COPY . .
ARG AWS_ACCESS_KEY_ID 
ARG AWS_SECRET_ACCESS_KEY 
ARG AWS_SESSION_TOKEN 
RUN aws sts get-caller-identity
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && ./aws/install
RUN npm install -g jsii-pacmak && npm install && npm run build
RUN jsii-pacmak -t python
# RUN jsii-pacmak -t java

RUN aws codeartifact login --tool twine --domain testdomain --repository fnma && twine upload --repository codeartifact ./dist/python/acme.hello-jsii-0.1.0.tar.gz
# RUN jsii-pacmak -t dotnet