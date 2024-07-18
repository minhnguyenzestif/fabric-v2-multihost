import { Object as FabricObject, Property } from 'fabric-contract-api';

@FabricObject()
export class Organization {
    @Property()
    public id: string;
    @Property()
    public user: string;
    @Property()
    public licenseId: number;
    @Property()
    public license: string;
    @Property()
    public organizationName: string;
    @Property()
    public brandLogo: string;
    @Property()
    public representativeName: string;
    @Property()
    public location: string;
    @Property()
    public contactInformation: string;
    @Property()
    public farmSize: number;
    @Property()
    public farmType: string;
    @Property()
    public registrationDate: string;
    @Property()
    public certificationDate: string;
    @Property()
    public capacity: number;
    @Property()
    public butcherLicense: boolean;
    @Property()
    public videoRecording: boolean;
    @Property()
    public meatFragmentation: string;
    @Property()
    public inspectionStatus: string;
    @Property()
    public accreditationStatus: string;
    @Property()
    public accreditationExpiration: string;
    @Property()
    public regulationDate: string;
    @Property()
    public productTypeAndIngredients: string;
    @Property()
    public listOfAccreditedCertificationBodies: string;
    @Property()
    public regulationsAndPolicies: string;
    @Property()
    public enforcementStatus: string;
    @Property()
    public enforcementActions: string;
    @Property()
    public certificateInfo: string; // Lưu mảng dưới dạng JSON string
}