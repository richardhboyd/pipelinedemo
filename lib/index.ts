import * as cp from '@aws-cdk/aws-codepipeline';
import * as cpa from '@aws-cdk/aws-codepipeline-actions';
import * as cb from '@aws-cdk/aws-codebuild';
import * as cc from '@aws-cdk/aws-codecommit';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export interface PipelineProps {
  readonly projectName: string;
}

export interface AzureDeployProps extends cp.CommonAwsActionProps {
  readonly stageName: string;
  readonly input: cp.Artifact;
}

export class TerraformApplyAction extends cpa.CodeBuildAction {
  constructor(scope: cdk.Construct, props: AzureDeployProps) {
    super({
        ...props,
        project: new cb.PipelineProject(scope, props.stageName, {
          buildSpec: cb.BuildSpec.fromObject({
            version: '0.2',
            phases: {
              install: {
                commands: [
                  'apt install unzip -y',
                  'wget https://releases.hashicorp.com/terraform/0.11.14/terraform_0.11.14_linux_amd64.zip',
                  'unzip terraform_0.11.14_linux_amd64.zip',
                  'mv terraform /usr/local/bin/'
                ],
              },
              pre_build: {
                commands: ['terraform init'],
              },
              build: {
                commands: ['terraform apply -auto-approve'],
              },
            }
          })
        })
    });
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
    const artifactBucket = new s3.Bucket(this, "ArtifactBucket", {encryption:s3.BucketEncryption.KMS_MANAGED})

    this.pipeline = new cp.Pipeline(this, 'Pipeline', {
      artifactBucket: artifactBucket,
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

  addStage(name: string, action: TerraformApplyAction) {
    this.pipeline.addStage({stageName: name, actions: [action]})
  }
}