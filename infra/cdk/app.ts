import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2, aws_ecs as ecs, aws_sqs as sqs, aws_s3 as s3, aws_rds as rds, aws_logs as logs } from 'aws-cdk-lib';
const app = new cdk.App();
const stage = app.node.tryGetContext('stage');
if (!['dev', 'prod'].includes(stage)) throw new Error('stage must be dev or prod');
const stack = new cdk.Stack(app, `edutech-${stage}`);
cdk.Tags.of(stack).add('Environment', stage);
const vpc = new ec2.Vpc(stack, 'Vpc', {maxAzs:2, natGateways:0, subnetConfiguration:[{name:'isolated',subnetType:ec2.SubnetType.PRIVATE_ISOLATED}]});
const cluster = new ecs.Cluster(stack, 'Cluster', {vpc});
const dlq = new sqs.Queue(stack, 'Dlq', {encryption:sqs.QueueEncryption.SQS_MANAGED});
new sqs.Queue(stack, 'Jobs', {encryption:sqs.QueueEncryption.SQS_MANAGED,deadLetterQueue:{queue:dlq,maxReceiveCount:3}});
new s3.Bucket(stack, 'Assets', {blockPublicAccess:s3.BlockPublicAccess.BLOCK_ALL,encryption:s3.BucketEncryption.S3_MANAGED,enforceSSL:true});
new rds.DatabaseInstance(stack, 'Database', {vpc, vpcSubnets:{subnetType:ec2.SubnetType.PRIVATE_ISOLATED}, engine:rds.DatabaseInstanceEngine.postgres({version:rds.PostgresEngineVersion.VER_16}), instanceType:ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),credentials:rds.Credentials.fromGeneratedSecret('migration_admin'),multiAz:stage==='prod',publiclyAccessible:false,storageEncrypted:true,deletionProtection:stage==='prod',backupRetention:cdk.Duration.days(stage==='prod'?7:1)});
for (const name of ['web','api','ai-service','ai-worker']) {
 const task = new ecs.FargateTaskDefinition(stack, `${name}Task`, {cpu:256,memoryLimitMiB:512});
 task.addContainer(name, {image:ecs.ContainerImage.fromRegistry('public.ecr.aws/docker/library/busybox:1.37'),command:['sh','-c','echo image-placeholder; sleep 3600'],logging:ecs.LogDrivers.awsLogs({streamPrefix:name,logRetention:logs.RetentionDays.ONE_WEEK})});
 new ecs.FargateService(stack, `${name}Service`, {cluster,vpcSubnets:{subnetType:ec2.SubnetType.PRIVATE_ISOLATED},taskDefinition:task,desiredCount:0,assignPublicIp:false});
}
