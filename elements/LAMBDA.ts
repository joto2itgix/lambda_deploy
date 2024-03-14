import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as archive from "@pulumi/archive";

export type lambdaRecipe = {
    src: string,
    runtime: string,
    handler: string
}

export function createLambda (
        env:string, 
        nameAppend: string, 
        recipe: lambdaRecipe, 
        actions: Array<string>, 
        subnets: any, 
        sg: any, 
        vars: any,
        tags?: any
    ) {
    
    const assumeRole = aws.iam.getPolicyDocument({
        statements: [
            {
                sid: "1",
                effect: "Allow",
                principals: [{
                    type: "Service",
                    identifiers: ["lambda.amazonaws.com"],
                }],
                actions: [
                    "sts:AssumeRole"
                ],
            },
        ],
    });
    const policyOne = new aws.iam.Policy(env+"-"+nameAppend+"-policy", {policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: actions,
            Effect: "Allow",
            Resource: "*",
        }],
    })});
    const iamForLambda = new aws.iam.Role(env+"-"+nameAppend+"-iam", {
        assumeRolePolicy: assumeRole.then(assumeRole => assumeRole.json),
        managedPolicyArns: [
            policyOne.arn
        ],
        tags: tags
    });
    if (recipe.runtime.includes("python")){
        var filetype = ".py"
    } else {
        var filetype = ".js"
    }
    
    const lambda = archive.getFile({
        type: "zip",
        sourceFile: "lambdas/"+recipe.src+filetype,
        outputPath: "lambdas/"+recipe.src+".zip",
    });
    const loadbalancerLambda = new aws.lambda.Function(env+"-"+nameAppend+"-"+recipe.src, {
        code: new pulumi.asset.FileArchive("lambdas/"+recipe.src+".zip"),
        role: iamForLambda.arn,
        handler: recipe.src+".lambda_handler",
        runtime: recipe.runtime,
        environment: {
            variables: vars,
        },
        vpcConfig: {
            subnetIds: subnets,
            securityGroupIds: sg
        }
    });
    const url = new aws.lambda.FunctionUrl(env+"-"+nameAppend+"-url", {
        functionName: loadbalancerLambda.name,
        authorizationType: "NONE",
        cors: {
            allowCredentials: true,
            allowOrigins: ["*"],
            allowMethods: ["*"],
            allowHeaders: [
                "date",
                "keep-alive",
            ],
            exposeHeaders: [
                "keep-alive",
                "date",
            ],
            maxAge: 86400,
        },
    });
    return url
}