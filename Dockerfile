FROM jsii/superchain AS build

# VOLUME ["/home/ec2-user/environment/pipeline"]
ARG MAVEN_PASSWORD
ARG ENDPOINT
WORKDIR /home/ec2-user/environment/pipeline
COPY . .
RUN curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip -qq awscliv2.zip && ./aws/install
RUN npm install -g jsii-pacmak && npm install && npm run build
RUN jsii-pacmak -t python
RUN jsii-pacmak -t js
RUN jsii-pacmak -t java

# PYTHON
RUN aws codeartifact login --tool twine --domain testdomain --repository fnma \ 
  && twine upload --repository codeartifact $(find ./dist/python/*.tar.gz)

# NPM
RUN aws codeartifact login --tool npm --domain testdomain --repository fnma \ 
  && packageInfo="$(tar -zxOf $(find ./dist/js/*.tgz) package/package.json)" \
  && ver="$(node -e "console.log(${packageInfo}.version);")" \
  && mod="$(node -e "console.log(${packageInfo}.name);")" \
  && npm publish $(find ./dist/js/*.tgz)

# JAVA/Maven
RUN export pom=$(find ./dist/java -name '*.pom') && echo $pom
RUN MAVEN_PASSWORD=$(aws codeartifact get-authorization-token --domain testdomain --query authorizationToken --output text) && touch ./mvn-settings.xml && echo "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><settings xmlns=\"http://maven.apache.org/SETTINGS/1.0.0\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://maven.apache.org/SETTINGS/1.0.0http://maven.apache.org/xsd/settings-1.0.0.xsd\"><servers><server><id>testdomain--fnma</id><username>aws</username><password>${MAVEN_PASSWORD}</password></server></servers></settings>" > ./mvn-settings.xml
RUN mvn --settings=./mvn-settings.xml -f $(find ./dist/java -name '*.pom') deploy -DrepositoryDirectory="dist/java" -DrepositoryId=testdomain--fnma  -DaltDeploymentRepository="testdomain--fnma::default::https://testdomain-744682116483.d.codeartifact.us-west-2.amazonaws.com/maven/fnma/" -DserverId=testdomain--fnma