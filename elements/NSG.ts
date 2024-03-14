import * as aws from "@pulumi/aws";
import { Vpc } from "@pulumi/aws/ec2";

export type ingress = {
    protocol: string,
    fromPort: number,
    toPort: number,
    cidrBlocks: string[]
}
export type egress = {
    protocol: string,
    fromPort: number,
    toPort: number,
    cidrBlocks: string[]
}

export function createNSG(env: string, nameAppend: string, vpc: Vpc, ingress: Array<ingress>, egress: Array<egress>, tags?: any) {
    return new aws.ec2.SecurityGroup(env+nameAppend, {
        vpcId: vpc.id,
        ingress: ingress,
        egress: egress,
    });
}