import * as cp from '@aws-cdk/aws-codepipeline';
import * as cpa from '@aws-cdk/aws-codepipeline-actions';
import * as cb from '@aws-cdk/aws-codebuild';
import * as cc from '@aws-cdk/aws-codecommit';
import * as cdk from '@aws-cdk/core';

export interface PipelineProps {
  readonly projectName: string;
}

export interface AzureDeployProps extends cp.CommonAwsActionProps {
  readonly projectName: string;
  readonly input: cp.Artifact;
  readonly buildspec: cb.BuildSpec;
}

export class AzureDeployAction extends cpa.CodeBuildAction {
  constructor(scope: cdk.Construct, props: AzureDeployProps) {
    super({
        ...props,
        project: new cb.PipelineProject(scope, 'CdkBuild', {buildSpec: props.buildspec})
    });
      
    // actionName: 'CodeBuild',
    // project,
    // input: sourceOutput,
    // outputs: [new codepipeline.Artifact()], // optional
    console.log(props.projectName);
  }
}

export class FanPipeline extends cdk.Construct {
  public readonly pipeline: cp.Pipeline;

  constructor(scope: cdk.Construct, id: string, props: PipelineProps) {
    super(scope, id);
    const repo = new cc.Repository(this, `repo_${props.projectName}`, {repositoryName: props.projectName})
    
    const buildProject = new cb.PipelineProject(this, 'CdkBuild', {
      buildSpec: cb.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: 'npm install',
          },
          build: {
            commands: [
              'npm run build',
              'npm run cdk synth -- -o dist'
            ],
          },
        },
        artifacts: {
          'base-directory': 'dist',
          files: [
            'LambdaStack.template.json',
          ],
        },
      }),
      environment: {
        buildImage: cb.LinuxBuildImage.STANDARD_4_0,
      },
    });

    const sourceOutput = new cp.Artifact();
    const lambdaBuildOutput = new cp.Artifact('LambdaBuildOutput');

    this.pipeline = new cp.Pipeline(this, 'Pipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [
            new cpa.CodeCommitSourceAction({
              actionName: 'CodeCommit_Source',
              repository: repo,
              output: sourceOutput,
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new cpa.CodeBuildAction({
              actionName: 'Lambda_Build',
              project: buildProject,
              input: sourceOutput,
              outputs: [lambdaBuildOutput],
            })
          ]
        }
      ],
    });
  }
}