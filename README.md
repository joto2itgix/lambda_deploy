# lambda_deploy
Deploy multiple lambdas with Pulumi


#INIT
pulumi new aws-typescript
npm install
npm install @pulumi/archive

#S3 LOGIN
pulumi login 's3://<BUCKETNAME>?region=<REGION>&profile=<PROFILE>'


#RUN
export PULUMI_CONFIG_PASSPHRASE=
pulumi stack select lambdas --create --non-interactive
pulumi config set aws:region <REGION>
pulumi config set aws:profile <PROFILE>

pulumi preview

pulumi up --yes --non-interactive

