// import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';

test('SQS Queue Created', () => {
    const app = new cdk.App();
    new cdk.Stack(app, "TestStack");
});