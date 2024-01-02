import { LightningElement, wire, api } from "lwc";
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
    @api boatTypeId;
    mapMarkers = [];
    isLoading = true;
    isRendered;
    latitude;
    longitude;
    
    @wire(getBoatsByLocation, {latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId'})
    wiredBoatsJSON({error, data}) {
        if(data) {
            this.createMapMarkers(data);
        } else {
            const errorEvent = new ShowToastEvent({
                title: ERROR_TITLE,
                variant: ERROR_VARIANT
            })
            console.error(error);
            this.dispatchEvent(errorEvent);
        }
        this.isLoading = false;
    }
    
    renderedCallback() {
        if (!this.isRendered) {
            this.getLocationFromBrowser();
        }
        this.isRendered = true;
    }
    
    getLocationFromBrowser() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                    this.latitude = position.coords.latitude;
                    this.longitude = position.coords.longitude;
                })
        }
    }
    
    createMapMarkers(boatData) {
        const firstMarker = {
            title: LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER,
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            }
        }

        const newMarkers = [firstMarker, ...JSON.parse(boatData).map(boat => {
            return {
                title: boat.Name,
                location: {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude: boat.Geolocation__Longitude__s
                }
            };
        })];
        this.mapMarkers = newMarkers;
    }
}
