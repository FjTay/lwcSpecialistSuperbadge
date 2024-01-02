import { LightningElement, api, wire, track } from "lwc";
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { MessageContext, publish } from "lightning/messageService";
import { refreshApex } from '@salesforce/apex';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {
    columns = [
        { label: 'Name', fieldName: 'Name', editable: true },
        { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true},
        { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true},
        { label: 'Description', fieldName: 'Description__c', editable: true},    
    ];

    boatTypeId = '';
    isLoading = false;

    @api selectedBoatId;
    @track boats;
    @track draftValues = [];
    @wire(MessageContext) messageContext;
    @wire(getBoats, {boatTypeId : '$boatTypeId'})
    wiredBoats({data, error}) {
        if (data) {
            this.boats = data;
        } else if (error) {
            console.error(error);
        }
    }
  
    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading)
        this.boatTypeId = boatTypeId;
    }
  
    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api
    async refresh() {
        this.isLoading = true;
        this.notifyLoading(this.isLoading)
        await refreshApex(this.boats)
        this.isLoading = false;
        this.notifyLoading(this.isLoading)
    }
    
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId)
    }
    
    sendMessageService(boatId) { 
        publish(this.messageContext, BOATMC, {recordId : boatId})
    }

    handleSave(event) {
        const updatedFields = event.detail.draftValues;
        updateBoatList({ data: updatedFields })
            .then(result => {
                const toast = new ShowToastEvent({
                    title : SUCCESS_TITLE ,
                    variant: SUCCESS_VARIANT,
                    message: MESSAGE_SHIP_IT
                });
                this.dispatchEvent(toast);
                this.draftValues = [];
                return this.refresh();
            })
            .catch(error => {
                const toast = new ShowToastEvent({
                    title: ERROR_TITLE,
                    variant: ERROR_VARIANT,
                    message: error.message
                });

                this.dispatchEvent(toast);
            }).finally(() => {})
    }

    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        const loadingEvent = new CustomEvent(isLoading ? 'loading' : 'doneloading');
        this.dispatchEvent(loadingEvent);
    }
}
