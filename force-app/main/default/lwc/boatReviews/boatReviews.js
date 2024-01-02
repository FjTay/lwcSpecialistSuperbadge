import { LightningElement, api } from 'lwc';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews'
import { NavigationMixin } from 'lightning/navigation';

export default class BoatReviews extends NavigationMixin(LightningElement) {
    boatId;
    error;
    boatReviews;
    isLoading;
    
    get recordId() {
        return this.boatId
    }
    @api
    set recordId(value) {
        this.setAttribute('boatId', value);
        this.boatId = value;
        this.getReviews();
    }
    
    get reviewsToShow() {
        // return this.boatReviews ?? false;
        return this.boatReviews != null && this.boatReviews !== undefined && this.boatReviews.length > 0;
    }
    
    @api
    refresh() {
        this.getReviews();
    }
    
    getReviews() {
        if (this.boatId) {
            this.isLoading = true;
            getAllReviews({boatId: this.boatId}).then((result) => {
                this.boatReviews = result;
                this.error = undefined;
            }).catch((error) => {
                this.error = error;
            }).finally(() => {
                this.isLoading = false;
            });
        } else {
            return;
        }
        // if(!boatId) {
        //     return
        // } else {
        //     this.isLoading = true;
        //     getAllReviews({boatId : this.boatId})
        //     .then(result => {
        //         this.boatReviews = result;
        //         this.error = undefined;
        //     })
        //     .catch(error => {
        //         this.error = error;
        //     })
        //     .finally(() => {
        //         this.isLoading = false;
        //     })
        // }
    }
    
    navigateToRecord(event) {
        event.preventDefault();
        event.stopPropagation();
        let recordId = event.target.dataset.recordId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes : {
                recordId: recordId,
                objectApiName: "User",
                actionName: "view"
            }
        });
    }
}
  