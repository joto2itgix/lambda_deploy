import * as aws from "@pulumi/aws";
import * as ELEMENTS from "./elements"

(async () => {
    var clientName = "lambdas"
    var env = clientName+"-dev"
    var CONFIG: any;
    CONFIG = await ELEMENTS.readFile(env+".yaml");

    const vpc_main = ELEMENTS.createVPC(env, CONFIG["vpc"]["name"], CONFIG["vpc"]["cidr"], CONFIG["vpc"]["tenancy"], CONFIG["default_tags"])

    const gw1 = ELEMENTS.createGW(env, "gw", vpc_main, CONFIG["default_tags"])

    const subnets:any = []
    CONFIG["subnets"].forEach(function (subnet: any) {
        subnets.push(
            ELEMENTS.createSubnet (env, subnet["name"], vpc_main, subnet["cidr"], CONFIG["region"], subnet["zone"], gw1, CONFIG["default_tags"])
        )
    });

    var ingress_public = [
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] },
    ]
    var egress = [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ]
    const webSecurityGroup = ELEMENTS.createNSG (env, "-sg-web", vpc_main, ingress_public, egress)

    //SECRETS
    const secretManager1 = new aws.secretsmanager.Secret(env+"-sm", {
        forceOverwriteReplicaSecret: false,
    });
    // Store a new secret version
    const secretVersion1 = new aws.secretsmanager.SecretVersion(env+"-secrets", {
        secretId: secretManager1.id,
        secretString: '{"test_var1":"test_valu1","test_valu2":"asd","test_var3":"test_valu3"}',
    });
    // const secretManagerEndpoint = new aws.ec2.VpcEndpoint(env+"-sm-endpoint", {
    //     vpcId: vpc_main.id,
    //     serviceName: "com.amazonaws."+CONFIG["region"]+".secretsmanager",
    //     vpcEndpointType: "Interface",
    //     privateDnsEnabled: true,
    //     subnetIds: subnets, 
    //     securityGroupIds: [], 
    // });

    //Hello World Lambda
    var recipe = {
        src: "helloworld", 
        runtime: "python3.12",
        handler: "lambda_handler"
    }
    var actions = [
        "ec2:CreateNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DeleteNetworkInterface"
    ]
    const lambdaHW = ELEMENTS.createLambda(env, "hw-py", recipe, actions, [subnets[0].id], [webSecurityGroup.id], {foo: "bar"})
    const lambdaHWDistribution = ELEMENTS.createCF(env, "hw-py", lambdaHW.functionUrl)

    //Print env Lambda
    var recipe = {
        src: "printenv", 
        runtime: "python3.12",
        handler: "lambda_handler"
    }
    var actions = [
        "ec2:CreateNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DeleteNetworkInterface"
    ]
    const lambdaPE = ELEMENTS.createLambda(env, "pe-py", recipe, actions, [subnets[0].id], [webSecurityGroup.id], {foo2: "bar2"})
})()


