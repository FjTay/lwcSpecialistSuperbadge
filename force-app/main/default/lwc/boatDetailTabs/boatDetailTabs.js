import { LightningElement, wire } from 'lwc';
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import { APPLICATION_SCOPE, MessageContext, subscribe } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { NavigationMixin } from 'lightning/navigation';

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    boatId;
    subscription;
    @wire(MessageContext) messageContext;
    @wire(getRecord, {recordId: '$boatId', fields: BOAT_FIELDS}) wiredRecord;
    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelFullDetails,
        labelPleaseSelectABoat,
    }
  
    get detailsTabIconName() {
        return this.wiredRecord.data ? 'utility:anchor' : null;
    }
  
    get boatName() {
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
    }
  
    subscribeMC() {
        if(this.subscription) {
            return;
        }
        this.subscription = subscribe(
            this.messageContext, 
            BOATMC, 
            (message) => {this.boatId = message.recordId}, 
                {scope : APPLICATION_SCOPE }
        )
    }
  
    connectedCallback() {
        this.subscribeMC()
    }
  
    navigateToRecordViewPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
                attributes: {
                    recordId: this.boatId,
                    objectApiName: 'Boat__c',
                    actionName: 'view'
                }
        })
    }
  
    handleReviewCreated() {
        this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
        this.template.querySelector('c-boat-reviews').refresh();
    }
}
