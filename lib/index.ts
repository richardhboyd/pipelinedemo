// import * as cp from '@aws-cdk/aws-codepipeline';
// import * as cpa from '@aws-cdk/aws-codepipeline-actions';
// import * as cb from '@aws-cdk/aws-codebuild';
import * as cc from '@aws-cdk/aws-codecommit';
import * as cdk from '@aws-cdk/core';

export interface PipelineProps {
  /**
   * The visibility timeout to be configured on the SQS Queue, in seconds.
   *
   * @default Duration.seconds(300)
   */
  readonly projectName: string;
}

export class BuildSystem extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: PipelineProps) {
    super(scope, id);
    new cc.Repository(this, `repo_${props.projectName}`, {repositoryName: props.projectName})
    
    // new cb.PipelineProject(this, 'CdkBuild', {
    //   environment: {
    //     buildImage: cb.LinuxBuildImage.STANDARD_2_0,
    //   },
    // });

    // const sourceOutput = new cp.Artifact();
    // const lambdaBuildOutput = new cp.Artifact('LambdaBuildOutput');

    // new cp.Pipeline(this, 'Pipeline', {
    //   stages: [
    //     {
    //       stageName: 'Source',
    //       actions: [
    //         new cpa.CodeCommitSourceAction({
    //           actionName: 'CodeCommit_Source',
    //           repository: repo,
    //           output: sourceOutput,
    //         }),
    //       ],
    //     },
    //     {
    //       stageName: 'Build',
    //       actions: [
    //         new cpa.CodeBuildAction({
    //           actionName: 'Lambda_Build',
    //           project: buildProject,
    //           input: sourceOutput,
    //           outputs: [lambdaBuildOutput],
    //         })
    //       ]
    //     }
    //   ],
    // });
  }
}