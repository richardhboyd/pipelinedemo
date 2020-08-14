FROM jsii/superchain

# VOLUME ["/home/ec2-user/environment/pipeline"]
WORKDIR /home/ec2-user/environment/pipeline

RUN npm install && npm run build && npm run package

# ENTRYPOINT ["/app/node_modules/.bin/cdk"]