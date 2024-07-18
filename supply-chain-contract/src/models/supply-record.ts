import { Object as FabricObject, Property } from 'fabric-contract-api';

@FabricObject()
export class SupplyRecord {
    @Property()
    public id: string;
    @Property()
    public user: string;
    @Property()
    public orgId: string;
    @Property()
    public certificateInfo: string;
    @Property()
    public batchId: string;
    @Property()
    public deliveryStatus: string;
    @Property()
    public departureTime: string;
    @Property()
    public arrivalTime: string;
    @Property()
    public arrivalStatus: string;
}