import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Organization } from './models/organization';
import { CertificateRequest } from './models/certificate-request';
import { Record } from './models/record';
import { DepartureTransaction } from './models/departure-transaction';
import { SupplyChainRecord } from './models/supply-chain-record';
import { SupplyRecord } from './models/supply-record';
import 'reflect-metadata';

@Info({ title: 'SupplyChain', description: 'Smart Contract for handling onboarding.' })
export class SupplyChainContract extends Contract {

    @Transaction()
    public async testConnection(ctx: Context): Promise<string> {
        return 'Connection successful';
    }

    @Transaction()
    public async createOrg(ctx: Context, orgData: string): Promise<{ orgId: string, certId?: string }> {
        const data = JSON.parse(orgData);

        const transactionId = ctx.stub.getTxID();
        const orgKey = `ORG_${transactionId}`;

        const org = new Organization();
        Object.assign(org, {
            id: transactionId,
            user: data.user,
            licenseId: parseInt(data.licenseId),
            license: data.license,
            organizationName: data.organizationName,
            brandLogo: data.brandLogo,
            representativeName: data.representativeName,
            location: data.location,
            contactInformation: data.contactInformation,
            farmSize: parseFloat(data.farmSize),
            farmType: data.farmType,
            registrationDate: data.registrationDate,
            certificationDate: data.certificationDate,
            capacity: parseInt(data.capacity),
            butcherLicense: data.butcherLicense,
            videoRecording: data.videoRecording,
            meatFragmentation: data.meatFragmentation,
            inspectionStatus: data.inspectionStatus,
            accreditationStatus: data.accreditationStatus,
            accreditationExpiration: data.accreditationExpiration,
            regulationDate: data.regulationDate,
            productTypeAndIngredients: data.productTypeAndIngredients,
            listOfAccreditedCertificationBodies: data.listOfAccreditedCertificationBodies,
            regulationsAndPolicies: data.regulationsAndPolicies,
            enforcementStatus: data.enforcementStatus,
            enforcementActions: data.enforcementActions,
        });

        let certId: string | undefined;
        if (data.halalCertificate && data.halalCertificate !== null) {
            const certKey = `CERT_${transactionId}`;
            const newRequest = new CertificateRequest();
            Object.assign(newRequest, {
                blockChainRequestId: transactionId,
                requestId: data.halalCertificate.requestId,
                orgId: transactionId,
                certificationBodyId: data.halalCertificate.certificationBodyId,
                certificationBodyIdOther: data.halalCertificate.certificationBodyIdOther,
                certificationBodyName: data.halalCertificate.certificationBodyName,
                certificatePaths: data.halalCertificate.certificatePaths,
                evidencePaths: data.halalCertificate.evidencePaths,
                type: data.halalCertificate.type,
                expiryDate: data.halalCertificate.expiryDate,
                status: data.halalCertificate.status,
                createdRequestId: data.halalCertificate.createdRequestId,
                auditCheck: data.halalCertificate.auditCheck,
                siteAuditVisitDate: data.halalCertificate.siteAuditVisitDate,
                details: data.halalCertificate.details,
                reasonReject: data.halalCertificate.reasonReject
            });
            await ctx.stub.putState(certKey, Buffer.from(JSON.stringify(newRequest)));
            certId = transactionId;
            org.certificateInfo = JSON.stringify([transactionId]);
        } else {
            org.certificateInfo = JSON.stringify([]);
        }
        
        await ctx.stub.putState(orgKey, Buffer.from(JSON.stringify(org)));
        return { orgId: transactionId, certId: certId };
    }

    @Transaction()
    public async updateOrg(ctx: Context, id: string, updates: string): Promise<{ orgId: string, certId?: string }> {
        const orgKey = `ORG_${id}`;
        const orgAsBytes = await ctx.stub.getState(orgKey);
        if (!orgAsBytes || orgAsBytes.length === 0) {
            throw new Error(`Organization with ID ${id} does not exist`);
        }
        const org = JSON.parse(orgAsBytes.toString()) as Organization;
        const updateObj = JSON.parse(updates);

        // Update only provided fields in the organization
        for (const key in updateObj) {
            if (updateObj.hasOwnProperty(key)) {
                if (key === 'halalCertificate' || key === 'id'){
                    continue;
                } else if (key === 'licenseId' || key === 'capacity') {
                    org[key] = parseInt(updateObj[key]);
                } else if (key === 'farmSize') {
                    org[key] = parseFloat(updateObj[key]);
                } else {
                    org[key] = updateObj[key];
                }
            }
        }

        let certId: string | undefined;
        if (updateObj.halalCertificate) {
            const listCertificateIds = JSON.parse(org.certificateInfo);
            const certReq = updateObj.halalCertificate;

            if (certReq.blockChainRequestId) {
                const certKey = `CERT_${certReq.blockChainRequestId}`;
                const certAsBytes = await ctx.stub.getState(certKey);
                if (certAsBytes && certAsBytes.length > 0) {
                    const certificate = JSON.parse(certAsBytes.toString()) as CertificateRequest;
                    for (const key in certReq) {
                        if (certReq.hasOwnProperty(key)) {
                            certificate[key] = certReq[key];
                        }
                    }
                    await ctx.stub.putState(certKey, Buffer.from(JSON.stringify(certificate)));
                    certId = certReq.blockChainRequestId;
                } else {
                    const newCertId = ctx.stub.getTxID();
                    const newCertKey = `CERT_${newCertId}`;
                    const newCertificate = new CertificateRequest();
                    Object.assign(newCertificate, {
                        blockChainRequestId: newCertId,
                        requestId: certReq.requestId,
                        orgId: id,
                        certificationBodyId: certReq.certificationBodyId,
                        certificationBodyIdOther: certReq.certificationBodyIdOther,
                        certificationBodyName: certReq.certificationBodyName,
                        certificatePaths: certReq.certificatePaths,
                        evidencePaths: certReq.evidencePaths,
                        type: certReq.type,
                        expiryDate: certReq.expiryDate,
                        status: certReq.status,
                        createdRequestId: certReq.createdRequestId,
                        auditCheck: certReq.auditCheck,
                        siteAuditVisitDate: certReq.siteAuditVisitDate,
                        details: certReq.details,
                        reasonReject: certReq.reasonReject
                    });
                    await ctx.stub.putState(newCertKey, Buffer.from(JSON.stringify(newCertificate)));
                    listCertificateIds.push(newCertId);
                    certId = newCertId;
                }
            } else {
                const newCertId = ctx.stub.getTxID();
                const newCertKey = `CERT_${newCertId}`;
                const newCertificate = new CertificateRequest();
                Object.assign(newCertificate, {
                    blockChainRequestId: newCertId,
                    requestId: certReq.requestId,
                    orgId: id,
                    certificationBodyId: certReq.certificationBodyId,
                    certificationBodyIdOther: certReq.certificationBodyIdOther,
                    certificatePaths: certReq.certificatePaths,
                    evidencePaths: certReq.evidencePaths,
                    type: certReq.type,
                    expiryDate: certReq.expiryDate,
                    status: certReq.status,
                    createdRequestId: certReq.createdRequestId,
                    auditCheck: certReq.auditCheck,
                    siteAuditVisitDate: certReq.siteAuditVisitDate,
                    details: certReq.details,
                    reasonReject: certReq.reasonReject
                });
                await ctx.stub.putState(newCertKey, Buffer.from(JSON.stringify(newCertificate)));
                listCertificateIds.push(newCertId);
                certId = newCertId;
            }
            org.certificateInfo = JSON.stringify(listCertificateIds);
        }

        await ctx.stub.putState(orgKey, Buffer.from(JSON.stringify(org)));
        return { orgId: id, certId: certId };
    }

    @Transaction()
    public async uploadCertificate(ctx: Context, certificateData: string): Promise<{ certId: string, orgId: string }> {
        const certificate = JSON.parse(certificateData);
        const orgKey = `ORG_${certificate.orgId}`;
        const orgAsBytes = await ctx.stub.getState(orgKey);
        if (!orgAsBytes || orgAsBytes.length === 0) {
            throw new Error(`Organization with ID ${certificate.orgId} does not exist`);
        }

        const org = JSON.parse(orgAsBytes.toString()) as Organization;

        const certificateId = ctx.stub.getTxID();
        const certKey = `CERT_${certificateId}`;
        const listCertificateIds = JSON.parse(org.certificateInfo);

        const newRequest = new CertificateRequest();
        Object.assign(newRequest, {
            blockChainRequestId: certificateId,
            requestId: certificate.requestId,
            orgId: org.id,
            certificationBodyId: certificate.certificationBodyId,
            certificationBodyIdOther: certificate.certificationBodyIdOther,
            certificationBodyName: certificate.certificationBodyName,
            certificatePaths: certificate.certificatePaths,
            evidencePaths: certificate.evidencePaths,
            expiryDate: certificate.expiryDate,
            type: certificate.type,
            status: certificate.status,
            createdRequestId: certificate.createdRequestId,
            auditCheck: certificate.auditCheck,
            siteAuditVisitDate: certificate.siteAuditVisitDate,
            details: certificate.details,
            reasonReject: certificate.reasonReject
        });

        await ctx.stub.putState(certKey, Buffer.from(JSON.stringify(newRequest)));
        listCertificateIds.push(certificateId);
        org.certificateInfo = JSON.stringify(listCertificateIds);
        await ctx.stub.putState(orgKey, Buffer.from(JSON.stringify(org)));
        return { certId: certificateId, orgId: certificate.orgId };
    }

    @Transaction()
    public async updateCertificate(ctx: Context, blockChainRequestId: string, updates: string): Promise<{ certId: string }> {
        const certKey = `CERT_${blockChainRequestId}`;
        const certAsBytes = await ctx.stub.getState(certKey);
        if (!certAsBytes || certAsBytes.length === 0) {
            throw new Error(`Certificate Request with ID ${blockChainRequestId} does not exist`);
        }

        const certificate = JSON.parse(certAsBytes.toString()) as CertificateRequest;

        const updateObj = JSON.parse(updates);

        // Update only provided fields in the certificate
        for (const key in updateObj) {
            if (updateObj.hasOwnProperty(key)) {
                certificate[key] = updateObj[key];
            }
        }

        await ctx.stub.putState(certKey, Buffer.from(JSON.stringify(certificate)));
        return { certId: blockChainRequestId };
    }

    @Transaction()
    @Returns('Organization')
    public async queryOrgById(ctx: Context, id: string): Promise<Organization> {
        const orgKey = `ORG_${id}`;
        const orgAsBytes = await ctx.stub.getState(orgKey);
        if (!orgAsBytes || orgAsBytes.length === 0) {
            throw new Error(`Organization with ID ${id} does not exist`);
        }
        return JSON.parse(orgAsBytes.toString()) as Organization;
    }

    @Transaction()
    @Returns('Organization[]')
    public async queryAllOrgs(ctx: Context): Promise<Organization[]> {
        const iterator = await ctx.stub.getStateByRange('ORG_', 'ORG_\uffff');
        const results = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                results.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return results;
    }

    @Transaction()
    @Returns('Organization[]')
    public async queryOrgsByListIds(ctx: Context, idsJSON: string): Promise<Organization[]> {
        const ids: string[] = JSON.parse(idsJSON);
        const results = [];

        for (const id of ids) {
            const orgKey = `ORG_${id}`;
            const orgAsBytes = await ctx.stub.getState(orgKey);
            if (orgAsBytes && orgAsBytes.length > 0) {
                results.push(JSON.parse(orgAsBytes.toString()) as Organization);
            }
        }

        return results;
    }

    @Transaction()
    @Returns('CertificateRequest')
    public async queryCertificateRequestById(ctx: Context, blockChainRequestId: string): Promise<CertificateRequest> {
        const certKey = `CERT_${blockChainRequestId}`;
        const certAsBytes = await ctx.stub.getState(certKey);
        if (!certAsBytes || certAsBytes.length === 0) {
            throw new Error(`Certificate Request with ID ${certKey} does not exist`);
        }
        return JSON.parse(certAsBytes.toString()) as CertificateRequest;
    }

    @Transaction()
    @Returns('CertificateRequest[]')
    public async queryCertificateRequestByListIds(ctx: Context, requestIdsJSON: string): Promise<CertificateRequest[]> {
        const requestIds: string[] = JSON.parse(requestIdsJSON);
        const results = [];
        for (const requestId of requestIds) {
            const certKey = `CERT_${requestId}`;
            const certAsBytes = await ctx.stub.getState(certKey);
            if (certAsBytes && certAsBytes.length > 0) {
                results.push(JSON.parse(certAsBytes.toString()) as CertificateRequest);
            }
        }   
        return results;
    }

    @Transaction()
    @Returns('CertificateRequest[]')
    public async queryCertificateRequestByOrgId(ctx: Context, orgId: string): Promise<CertificateRequest[]> {
        const orgKey = `ORG_${orgId}`;
        const orgAsBytes = await ctx.stub.getState(orgKey);
        if (!orgAsBytes || orgAsBytes.length === 0) {
            throw new Error(`Organization with ID ${orgId} does not exist`);
        }

        const org = JSON.parse(orgAsBytes.toString()) as Organization;
        const certificateRequests: CertificateRequest[] = [];
        const listCertificateIds = JSON.parse(org.certificateInfo);
        for (const certId of listCertificateIds) {
            const certAsBytes = await ctx.stub.getState(certId);
            if (certAsBytes && certAsBytes.length > 0) {
                certificateRequests.push(JSON.parse(certAsBytes.toString()) as CertificateRequest);
            }
        }

        return certificateRequests;
    }

    @Transaction()
    @Returns('CertificateRequest[]')
    public async queryAllCertificateRequests(ctx: Context): Promise<CertificateRequest[]> {
        const iterator = await ctx.stub.getStateByRange('CERT_', 'CERT_\uffff');
        const allResults: CertificateRequest[] = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                allResults.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return allResults;
    }

    @Transaction()
    @Returns('Object')
    public async queryOrgWithCertificates(ctx: Context, id: string): Promise<{ organization: Organization, certificateRequests: CertificateRequest[] }> {
        const orgKey = `ORG_${id}`;
        const orgAsBytes = await ctx.stub.getState(orgKey);
        if (!orgAsBytes || orgAsBytes.length === 0) {
            throw new Error(`Organization with ID ${id} does not exist`);
        }

        const org: Organization = JSON.parse(orgAsBytes.toString());
        const certificateRequests: CertificateRequest[] = [];
        const listCertificateIds = JSON.parse(org.certificateInfo);
        for (const certId of listCertificateIds) {
            const certKey = `CERT_${certId}`;
            const certAsBytes = await ctx.stub.getState(certKey);
            if (certAsBytes && certAsBytes.length > 0) {
                const certRequest: CertificateRequest = JSON.parse(certAsBytes.toString());
                certificateRequests.push(certRequest);
            }
        }

        return { organization: org, certificateRequests: certificateRequests };
    }

    @Transaction()
    @Returns('Object[]')
    public async queryAllOrgsWithCertificates(ctx: Context): Promise<{ organization: Organization, certificateRequests: CertificateRequest[] }[]> {
        const iterator = await ctx.stub.getStateByRange('ORG_', 'ORG_\uffff');
        const allResults: { organization: Organization, certificateRequests: CertificateRequest[] }[] = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const org: Organization = JSON.parse(res.value.value.toString());
                const certificateRequests: CertificateRequest[] = [];
                const listCertificateIds = JSON.parse(org.certificateInfo);
                for (const certId of listCertificateIds) {
                    const certKey = `CERT_${certId}`;
                    const certAsBytes = await ctx.stub.getState(certKey);
                    if (certAsBytes && certAsBytes.length > 0) {
                        const certRequest: CertificateRequest = JSON.parse(certAsBytes.toString());
                        certificateRequests.push(certRequest);
                    }
                }

                allResults.push({ organization: org, certificateRequests: certificateRequests });
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return allResults;
    }

    @Transaction()
    @Returns('Object[]')
    public async queryOrgsWithCertificatesByListIds(ctx: Context, idsJSON: string): Promise<{ organization: Organization, certificateRequests: CertificateRequest[] }[]> {
        const results: { organization: Organization, certificateRequests: CertificateRequest[] }[] = [];
        const ids: string[] = JSON.parse(idsJSON);

        for (const id of ids) {
            const orgKey = `ORG_${id}`;
            const orgAsBytes = await ctx.stub.getState(orgKey);
            if (orgAsBytes && orgAsBytes.length > 0) {
                const org: Organization = JSON.parse(orgAsBytes.toString());
                const certificateRequests: CertificateRequest[] = [];
                const listCertificateIds = JSON.parse(org.certificateInfo);

                for (const certId of listCertificateIds) {
                    const certKey = `CERT_${certId}`;
                    const certAsBytes = await ctx.stub.getState(certKey);
                    if (certAsBytes && certAsBytes.length > 0) {
                        const certRequest: CertificateRequest = JSON.parse(certAsBytes.toString());
                        certificateRequests.push(certRequest);
                    }
                }

                results.push({ organization: org, certificateRequests: certificateRequests });
            }
        }

        return results;
    }

    //supply chain record section

    @Transaction()
    public async createRecord(ctx: Context, recordData: string): Promise<{ recordId: string }> {
        const data = JSON.parse(recordData);

        const transactionId = ctx.stub.getTxID();
        const recordKey = `RECORD_${transactionId}`;

        const record = new Record();
        Object.assign(record, {
            recordId: transactionId,
            batchId: data.batchId,
            arrivalBatchId: data.arrivalBatchId,
            supplyChainId: data.supplyChainId,
            qrCode: data.qrCode,
            detailsOnAnimalFeed: data.detailsOnAnimalFeed,
            detailsOnAnimalFeedFiles: data.detailsOnAnimalFeedFiles,
            vaccinationDetails: data.vaccinationDetails,
            vaccinationDetailsFiles: data.vaccinationDetailsFiles,
            healthConditions: data.healthConditions,
            healthConditionsFiles: data.healthConditionsFiles,
            butchererDetails: data.butchererDetails,
            butchererDetailsFiles: data.butchererDetailsFiles,
            oneStrike: data.oneStrike,
            inWeight: data.inWeight,
            outWeight: data.outWeight,
            butcheringProcess: data.butcheringProcess,
            butcheringProcessFiles: data.butcheringProcessFiles,
            shippingDetails: data.shippingDetails,
            shippingDetailsFiles: data.shippingDetailsFiles,
            storageCondition: data.storageCondition,
            storageConditionFiles: data.storageConditionFiles,
            humidityLevels: parseFloat(data.humidityLevels),
            temperature: parseFloat(data.temperature),
            vehicleFleetSize: parseInt(data.vehicleFleetSize),
            vehicleID: parseInt(data.vehicleID),
            route: data.route,
            productImages: data.productImages,
            productName: data.productName,
            productDetails: data.productDetails,
            productionDate: data.productionDate,
            expirationDate: data.expirationDate,
            quantity: parseInt(data.quantity),
            ownership: data.ownership,
            gtin: data.gtin,
            receiver: data.receiver,
            sender: data.sender,
            deliveryStatus: data.deliveryStatus,
            supplyChainOrderNumber: parseInt(data.supplyChainOrderNumber),
            reasonReject: data.reasonReject,
            reasonRejectFiles: data.reasonRejectFiles,
            departureTime: data.departureTime,
            arrivalTime: data.arrivalTime,
            productType: data.productType,
            departureHistories: data.departureHistories,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        });

        await ctx.stub.putState(recordKey, Buffer.from(JSON.stringify(record)));
        return { recordId: transactionId };
    }

    @Transaction()
    public async updateRecord(ctx: Context, recordId: string, updatedData: string): Promise<{ recordId: string }> {
        const recordKey = `RECORD_${recordId}`;
        const existingRecordBytes = await ctx.stub.getState(recordKey);

        if (!existingRecordBytes || existingRecordBytes.length === 0) {
            throw new Error(`Record with ID ${recordId} does not exist`);
        }

        const existingRecord = JSON.parse(existingRecordBytes.toString()) as Record;
        const updates = JSON.parse(updatedData);

        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                existingRecord[key] = updates[key];
            }
        }

        await ctx.stub.putState(recordKey, Buffer.from(JSON.stringify(existingRecord)));
        return { recordId: recordId };
    }

    
    @Transaction(false)
    public async getRecordByRecordId(ctx: Context, recordId: string): Promise<Record> {
        const recordKey = `RECORD_${recordId}`;
        const recordBytes = await ctx.stub.getState(recordKey);
        
        if (!recordBytes || recordBytes.length === 0) {
            throw new Error(`Record with ID ${recordId} does not exist`);
        }

        const record = JSON.parse(recordBytes.toString());
        return record;
    }

    @Transaction(false)
    public async getRecordsByListOfRecordIds(ctx: Context, recordIdsJSON: string): Promise<Record[]> {
        const recordIds: string[] = JSON.parse(recordIdsJSON);
        const records: Record[] = [];
        for (const recordId of recordIds) {
            const recordKey = `RECORD_${recordId}`;
            const recordBytes = await ctx.stub.getState(recordKey);
            if (recordBytes && recordBytes.length > 0) {
                records.push(JSON.parse(recordBytes.toString()));
            }
        }
        return records;
    }
    
    @Transaction(false)
    public async getRecordByCreatedRecordId(ctx: Context, createdRecordId: string): Promise<Record[]> {
        const queryString = {
            selector: {
                createdRecordId: createdRecordId
            }
        };
        const queryResults = await this.queryRecordWithQueryString(ctx, JSON.stringify(queryString));
        
        const filteredResults = queryResults.filter(result => result.key.startsWith('RECORD_'));
        
        return filteredResults.map(result => result.record);
    }

    private async queryRecordWithQueryString(ctx: Context, queryString: string): Promise<{key: string, record: Record}[]> {
        const iterator = await ctx.stub.getQueryResult(queryString);
        const results = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const record = JSON.parse(res.value.value.toString());
                results.push({ key: res.value.key, record });
            }
            if (res.done) {
                await iterator.close();
                return results;
            }
        }
    }
    @Transaction()
    public async deleteRecord(ctx: Context, recordId: string): Promise<void> {
        const recordKey = `RECORD_${recordId}`;
        const existingRecordBytes = await ctx.stub.getState(recordKey);

        if (!existingRecordBytes || existingRecordBytes.length === 0) {
            throw new Error(`Record with ID ${recordId} does not exist`);
        }

        await ctx.stub.deleteState(recordKey);
    }

    @Transaction()
    public async createDepartureTransaction(ctx: Context, transactionData: string): Promise<{ recordId: string, transactionId: string, supplyRecordId: string, supplychainId: string }> {
        const data = JSON.parse(transactionData);

        const transactionId = ctx.stub.getTxID();
        const transactionKey = `TRANSACTION_${transactionId}`;

        // Tạo thông tin về DepartureTransaction
        const departureTransaction = new DepartureTransaction();
        Object.assign(departureTransaction, {
            transactionId: transactionId,
            batchId: data.batchId,
            quantity: parseInt(data.quantity),
            sender: data.sender,
            receiver: data.receiver,
            scanResult: data.scanResult,
            reasonForDenial: data.reasonForDenial,
            reasonReject: data.reasonReject,
            reasonRejectFiles: data.reasonRejectFiles,
            transactionTime: data.transactionTime,
        });
        await ctx.stub.putState(transactionKey, Buffer.from(JSON.stringify(departureTransaction)));

        // Cập nhật thông tin của Record
        const recordKey = `RECORD_${data.recordId}`;
        const existingRecordBytes = await ctx.stub.getState(recordKey);
        if (!existingRecordBytes || existingRecordBytes.length === 0) {
            throw new Error(`Record with batch ID ${data.recordId} does not exist`);
        }
        const record = JSON.parse(existingRecordBytes.toString()) as Record;
        record.deliveryStatus = data.deliveryStatus;
        record.receiver = data.receiver;
        record.updatedAt = data.updatedAt;
        await ctx.stub.putState(recordKey, Buffer.from(JSON.stringify(record)));

        // Tạo hoặc cập nhật SupplyChainRecord
        const supplyChainId = record.supplyChainId || transactionId;
        const supplyChainRecordKey = `SUPPLYCHAIN_${supplyChainId}`;
        const existingSupplyChainRecordBytes = await ctx.stub.getState(supplyChainRecordKey);
        let supplyChainRecord: SupplyChainRecord;

        if (!existingSupplyChainRecordBytes || existingSupplyChainRecordBytes.length === 0) {
            supplyChainRecord = new SupplyChainRecord();
            supplyChainRecord.supplyChainId = supplyChainId;
            supplyChainRecord.supplyRecordIds = JSON.stringify([]);
        } else {
            supplyChainRecord = JSON.parse(existingSupplyChainRecordBytes.toString()) as SupplyChainRecord;
        }

        // Tạo SupplyRecord và lưu trữ
        const supplyRecordId = `SUPPLYRECORD_${transactionId}`;
        const supplyRecord = new SupplyRecord();
        Object.assign(supplyRecord, {
            id: supplyRecordId,
            user: data.sender,
            orgId: data.senderOrgId,
            certificateInfo: data.certificateInfo,
            batchId: data.batchId,
            deliveryStatus: data.deliveryStatus,
            departureTime: data.departureTime,
            arrivalTime: '',
            arrivalStatus: '',
        });
        await ctx.stub.putState(supplyRecordId, Buffer.from(JSON.stringify(supplyRecord)));

        // Cập nhật supplyRecordIds
        const supplyRecordIds = JSON.parse(supplyChainRecord.supplyRecordIds);
        supplyRecordIds.push(supplyRecordId);
        supplyChainRecord.supplyRecordIds = JSON.stringify(supplyRecordIds);
        await ctx.stub.putState(supplyChainRecordKey, Buffer.from(JSON.stringify(supplyChainRecord)));

        return { recordId: data.recordId, transactionId: transactionId, supplyRecordId: transactionId, supplychainId: supplyChainId };
    }
    
    @Transaction()
    public async arrivalProcess(ctx: Context, transactionId: string, processData: string): Promise<{ recordId: string, transactionId: string, arrivalSupplyRecordId: string, departureSupplyRecordId: string, supplychainId: string }> {
        const data = JSON.parse(processData);

        const transactionKey = `TRANSACTION_${transactionId}`;
        const existingTransactionBytes = await ctx.stub.getState(transactionKey);

        if (!existingTransactionBytes || existingTransactionBytes.length === 0) {
            throw new Error(`Transaction with ID ${transactionId} does not exist`);
        }

        const departureTransaction = JSON.parse(existingTransactionBytes.toString()) as DepartureTransaction;
        departureTransaction.scanResult = data.scanResult;
        departureTransaction.reasonForDenial = data.reasonForDenial || '';
        departureTransaction.reasonReject = data.reasonReject,
        departureTransaction.reasonRejectFiles = data.reasonRejectFiles,

        await ctx.stub.putState(transactionKey, Buffer.from(JSON.stringify(departureTransaction)));

        // Cập nhật thông tin của Record
        const recordKey = `RECORD_${departureTransaction.transactionId}`;
        const existingRecordBytes = await ctx.stub.getState(recordKey);
        if (!existingRecordBytes || existingRecordBytes.length === 0) {
            throw new Error(`Record with batch ID ${departureTransaction.transactionId} does not exist`);
        }

        const record = JSON.parse(existingRecordBytes.toString()) as Record;
        record.deliveryStatus = data.deliveryStatus;
        await ctx.stub.putState(recordKey, Buffer.from(JSON.stringify(record)));

        // Cập nhật SupplyChainRecord
        const supplyChainId = record.supplyChainId;
        const supplyChainRecordKey = `SUPPLYCHAIN_${supplyChainId}`;
        const existingSupplyChainRecordBytes = await ctx.stub.getState(supplyChainRecordKey);
        if (!existingSupplyChainRecordBytes || existingSupplyChainRecordBytes.length === 0) {
            throw new Error(`SupplyChainRecord with ID ${supplyChainId} does not exist`);
        }

        const supplyChainRecord = JSON.parse(existingSupplyChainRecordBytes.toString()) as SupplyChainRecord;

        let departureSupplyRecordId = '';
        const supplyRecordIds = JSON.parse(supplyChainRecord.supplyRecordIds);
        for (const supplyRecordId of supplyRecordIds) {
            const supplyRecordBytes = await ctx.stub.getState(supplyRecordId);
            if (supplyRecordBytes && supplyRecordBytes.length > 0) {
                const supplyRecord = JSON.parse(supplyRecordBytes.toString()) as SupplyRecord;
                if (supplyRecord.batchId === departureTransaction.batchId && supplyRecord.user === departureTransaction.sender) {
                    supplyRecord.deliveryStatus = data.deliveryStatus;
                    await ctx.stub.putState(supplyRecordId, Buffer.from(JSON.stringify(supplyRecord)));
                    departureSupplyRecordId = supplyRecordId;
                    break;
                }
            }
        }

        // Tạo thông tin của receiver
        const receiverSupplyRecordId = `SUPPLYRECORD_${transactionId}`;
        const receiverSupplyRecord = new SupplyRecord();
        Object.assign(receiverSupplyRecord, {
            id: receiverSupplyRecordId,
            user: departureTransaction.receiver,
            orgId: data.receiverOrgId,
            certificateInfo: data.certificateInfo,
            batchId: record.arrivalBatchId || departureTransaction.batchId,
            deliveryStatus: data.deliveryStatus,
            departureTime: '',
            arrivalTime: data.arrivalTime,
            arrivalStatus: data.arrivalStatus,
        });
        await ctx.stub.putState(receiverSupplyRecordId, Buffer.from(JSON.stringify(receiverSupplyRecord)));

        // Cập nhật supplyRecordIds
        supplyRecordIds.push(receiverSupplyRecordId);
        supplyChainRecord.supplyRecordIds = JSON.stringify(supplyRecordIds);
        await ctx.stub.putState(supplyChainRecordKey, Buffer.from(JSON.stringify(supplyChainRecord)));

        return { recordId: departureTransaction.transactionId, transactionId: transactionId, arrivalSupplyRecordId: transactionId, departureSupplyRecordId: departureSupplyRecordId, supplychainId: supplyChainId };
    }


    @Transaction(false)
    public async getSupplyChainRecordsBySupplyChainId(ctx: Context, supplyChainId: string): Promise<any> {
        const supplyChainRecordKey = `SUPPLYCHAIN_${supplyChainId}`;
        const supplyChainRecordBytes = await ctx.stub.getState(supplyChainRecordKey);

        if (!supplyChainRecordBytes || supplyChainRecordBytes.length === 0) {
            throw new Error(`SupplyChainRecord with ID ${supplyChainId} does not exist`);
        }

        const supplyChainRecord = JSON.parse(supplyChainRecordBytes.toString()) as SupplyChainRecord;

        // Lấy tất cả các SupplyRecord dựa trên supplyRecordIds
        const supplyRecordIds = JSON.parse(supplyChainRecord.supplyRecordIds);
        const supplyRecords: SupplyRecord[] = [];
        for (const supplyRecordId of supplyRecordIds) {
            const supplyRecordBytes = await ctx.stub.getState(supplyRecordId);
            if (supplyRecordBytes && supplyRecordBytes.length > 0) {
                const supplyRecord = JSON.parse(supplyRecordBytes.toString()) as SupplyRecord;
                supplyRecords.push(supplyRecord);
            }
        }

        return { supplyChainId: supplyChainRecord.supplyChainId, supplyRecords: supplyRecords };
    }
}
