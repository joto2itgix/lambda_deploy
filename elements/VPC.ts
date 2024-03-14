import * as aws from "@pulumi/aws";
import { Gateway } from "@pulumi/aws/directconnect";
import { InternetGateway, Vpc } from "@pulumi/aws/ec2";

export function createVPC (env: string, nameAppend: string, cidr: string, tenancy: string, tags?: any) {
    return new aws.ec2.Vpc(env+"-"+nameAppend, {
        cidrBlock: cidr,
        instanceTenancy: tenancy,
        enableDnsSupport: true,
        enableDnsHostnames: true,
        tags: tags
    });
}

export function createGW (env: string, nameAppend: string, vpc: Vpc, tags?: any) {
    return new aws.ec2.InternetGateway(env+"-"+nameAppend, {
        vpcId: vpc.id,
        tags: tags,
    })
}

export function createSubnet (env: string, nameAppend: string, vpc: Vpc, cidr: string, region: string, zone: string, gw: InternetGateway, tags?: any){
    const subnet = new aws.ec2.Subnet(env+"-"+nameAppend, {
        vpcId: vpc.id,
        cidrBlock: cidr,
        availabilityZone: region+zone,
        tags: tags,
    });
    const routeTable1 = new aws.ec2.RouteTable(env+"-rt1", {
        vpcId: vpc.id,
        routes: [
            {
                cidrBlock: "0.0.0.0/0",
                gatewayId: gw.id,
            },
        ],
    });
    
    const routeTableAssociation = new aws.ec2.RouteTableAssociation(env+"-rt1a", {
        subnetId: subnet.id,
        routeTableId: routeTable1.id,
    });
    return subnet
}