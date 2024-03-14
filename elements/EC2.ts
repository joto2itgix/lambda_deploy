import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as archive from "@pulumi/archive";
import { SecurityGroup, Subnet } from "@pulumi/aws/ec2";

export function createEC2 (env: string, nameAppend: string, flavor: string, sg: any, subnet: Subnet, tags?: any) {
    const ubuntu = aws.ec2.getAmi({
        mostRecent: true,
        filters: [
            {
                name: "name",
                values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"],
            },
            {
                name: "virtualization-type",
                values: ["hvm"],
            },
        ],
        owners: ["099720109477"],
    });
    return new aws.ec2.Instance(env+"-"+nameAppend, {
        ami: ubuntu.then(ubuntu => ubuntu.id),
        instanceType: flavor,
        vpcSecurityGroupIds: sg,
        subnetId: subnet.id,
        keyName: "vdimitrov",
        associatePublicIpAddress: true,
        tags: tags,
    });
    
}