import { Object as FabricObject, Property } from 'fabric-contract-api';

@FabricObject()
export class Record {
    @Property()
    public recordId: string;
    @Property()
    public batchId: string;
    @Property()
    public arrivalBatchId: string;
    @Property()
    public supplyChainId: string;
    @Property()
    public qrCode: string;
    @Property()
    public createdRecordId: string;
    @Property()
    public detailsOnAnimalFeed: string;
    @Property()
    public detailsOnAnimalFeedFiles: string;
    @Property()
    public vaccinationDetails: string;
    @Property()
    public vaccinationDetailsFiles: string;
    @Property()
    public healthConditions: string;
    @Property()
    public healthConditionsFiles: string;
    @Property()
    public butchererDetails: string;
    @Property()
    public butchererDetailsFiles: string;
    @Property()
    public oneStrike: boolean;
    @Property()
    public inWeight: string;
    @Property()
    public outWeight: string;
    @Property()
    public butcheringProcess: string;
    @Property()
    public butcheringProcessFiles: string;
    @Property()
    public shippingDetails: string;
    @Property()
    public shippingDetailsFiles: string;
    @Property()
    public storageCondition: string;
    @Property()
    public storageConditionFiles: string;
    @Property()
    public humidityLevels: number;
    @Property()
    public temperature: number;
    @Property()
    public vehicleFleetSize: number;
    @Property()
    public vehicleID: number;
    @Property()
    public route: string;
    @Property()
    public productImages: string;
    @Property()
    public productName: string;
    @Property()
    public productDetails: string;
    @Property()
    public productionDate: string;
    @Property()
    public expirationDate: string;
    @Property()
    public quantity: number;
    @Property()
    public deliveryStatus: string;
    @Property()
    public ownership: boolean;
    @Property()
    public gtin: string;
    @Property()
    public receiver: string;
    @Property()
    public sender: string;
    @Property()
    public reasonReject: string;
    @Property()
    public reasonRejectFiles: string;
    @Property()
    public supplyChainOrderNumber: number;
    @Property()
    public departureTime: string;
    @Property()
    public arrivalTime: string;
    @Property()
    public productType: string;
    @Property()
    public departureHistories: string;
    @Property()
    public createdAt: string;
    @Property()
    public updatedAt: string;
}