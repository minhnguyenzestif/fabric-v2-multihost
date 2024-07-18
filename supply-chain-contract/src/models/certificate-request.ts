import { Object as FabricObject, Property } from 'fabric-contract-api';

@FabricObject()
export class CertificateRequest {
    @Property()
    public blockChainRequestId: string;
    @Property()
    public requestId: string;
    @Property()
    public orgId: string;
    @Property()
    public type: string;
    @Property()
    public expiryDate: string;
    @Property()
    public certificationBodyId: string;
    @Property()
    public certificationBodyIdOther: string;
    @Property()
    public certificationBodyName: string;
    @Property()
    public certificatePaths: string;
    @Property()
    public status: string; // "Pending", "Approved", "Verified", "Rejected"
    @Property()
    public auditCheck: boolean;
    @Property()
    public siteAuditVisitDate: string;
    @Property()
    public details: string;
    @Property()
    public evidencePaths: string;
    @Property()
    public reasonReject: string;
    @Property()
    public createdRequestId: string;
}