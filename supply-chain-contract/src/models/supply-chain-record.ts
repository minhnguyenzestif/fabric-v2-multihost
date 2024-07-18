import { Object as FabricObject, Property } from 'fabric-contract-api';

@FabricObject()
export class SupplyChainRecord {
    @Property()
    public supplyChainId: string;
    @Property()
    public supplyRecordIds: string;
}