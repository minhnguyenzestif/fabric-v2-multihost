import { Object as FabricObject, Property } from 'fabric-contract-api';

@FabricObject()
export class DepartureTransaction {
    @Property()
    public transactionId: string;
    @Property()
    public batchId: string;
    @Property()
    public quantity: number;
    @Property()
    public sender: string;
    @Property()
    public receiver: string;
    @Property()
    public scanResult: string; // 'accept' or 'reject'
    @Property()
    public reasonForDenial: string;
    @Property()
    public reasonReject: string;
    @Property()
    public reasonRejectFiles: string;
    @Property()
    public transactionTime: string;
}