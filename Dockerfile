FROM jsii/superchain AS build
ARG DOMAIN_NAME
ARG DOMAIN_OWNER
ARG REPOSITORY_NAME
ARG REGION
# VOLUME ["/home/ec2-user/environment/pipeline"]
WORKDIR /home/ec2-user/environment/pipeline
COPY . .

RUN curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip -qq awscliv2.zip && ./aws/install
RUN npm install -g jsii-pacmak && npm install && npm run build
RUN jsii-pacmak -t python
RUN jsii-pacmak -t js
RUN jsii-pacmak -t java

# PYTHON
RUN aws codeartifact login --tool twine --domain $DOMAIN_NAME --repository $REPOSITORY_NAME ${DOMAIN_OWNER:+'--domain-owner' $DOMAIN_OWNER} --region $REGION\
  && twine upload --repository codeartifact $(find ./dist/python/*.tar.gz)

# NPM
RUN aws codeartifact login --tool npm --domain $DOMAIN_NAME --repository $REPOSITORY_NAME ${DOMAIN_OWNER:+'--domain-owner' $DOMAIN_OWNER} --region $REGION\ 
  && packageInfo="$(tar -zxOf $(find ./dist/js/*.tgz) package/package.json)" \
  && ver="$(node -e "console.log(${packageInfo}.version);")" \
  && mod="$(node -e "console.log(${packageInfo}.name);")" \
  && npm publish $(find ./dist/js/*.tgz)

# JAVA/Maven
RUN export pom=$(find ./dist/java -name '*.pom') && echo $pom
RUN MAVEN_PASSWORD=$(aws codeartifact get-authorization-token --domain $DOMAIN_NAME --query authorizationToken --output text ${DOMAIN_OWNER:+'--domain-owner' $DOMAIN_OWNER} --region $REGION) && touch ./mvn-settings.xml && echo "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><settings xmlns=\"http://maven.apache.org/SETTINGS/1.0.0\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://maven.apache.org/SETTINGS/1.0.0http://maven.apache.org/xsd/settings-1.0.0.xsd\"><servers><server><id>${DOMAIN_NAME}--${REPOSITORY_NAME}</id><username>aws</username><password>${MAVEN_PASSWORD}</password></server></servers></settings>" > ./mvn-settings.xml
RUN mvn --settings=./mvn-settings.xml -f $(find ./dist/java -name '*.pom') deploy \
  -DrepositoryDirectory="dist/java" \
  -DrepositoryId="${DOMAIN_NAME}--${REPOSITORY_NAME}" \
  -DaltDeploymentRepository="${DOMAIN_NAME}--${REPOSITORY_NAME}::default::$(aws codeartifact get-repository-endpoint --format maven --output text --domain ${DOMAIN_NAME} --repository ${REPOSITORY_NAME} ${DOMAIN_OWNER:+'--domain-owner' $DOMAIN_OWNER} --region $REGION)" \
  -DserverId="${DOMAIN_NAME}--${REPOSITORY_NAME}"