import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Define the Layer interface
export interface LayerField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'color' | 'image' | 'dropdown' | 'date' | 'boolean' | 'number';
  label: string;
  required: boolean;
  options?: string[]; // For dropdown fields
  enabled?: boolean;
}

// Define the CustomField interface
export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'dropdown' | 'boolean' | 'date';
  required: boolean;
  options?: string[];
}

export interface Layer {
  _id?: string;
  id?: string;
  name: string;
  location: string; // Changed to string to support multiple comma-separated locations
  priority?: number; // Made optional as we're removing this field from the UI
  fields: LayerField[];
  active: boolean;
  parentId?: string; // Reference to parent tag
  color?: string; // Color for the tag
  createdAt: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  customFields?: CustomField[]; // Custom fields for the tag
}

// Create the Layers collection
export const Layers = new Mongo.Collection<Layer>('layers');

// Ensure we have indexes for better performance
if (Meteor.isServer) {
  Meteor.startup(() => {
    // Create indexes for commonly queried fields
    Layers.createIndex({ id: 1 });
    Layers.createIndex({ name: 1 });
    Layers.createIndex({ location: 1 });
  });
}

// Define methods for layers
if (Meteor.isServer) {
  // Publish all layers
  Meteor.publish('layers.all', function() {
    return Layers.find();
  });
  
  // Publish a single layer by ID
  Meteor.publish('layers.single', function(layerId) {
    check(layerId, String);
    return Layers.find({ _id: layerId });
  });

  Meteor.methods({
    // Create a new layer
    async 'layers.create'(layerData: Layer) {
      // Basic validation
      if (!layerData || typeof layerData !== 'object') {
        throw new Meteor.Error('invalid-data', 'Invalid layer data');
      }
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to create a layer');
      }
      
      // Extract only the fields we need
      const layer = {
        id: layerData.id,
        name: layerData.name,
        location: layerData.location,
        parentId: layerData.parentId || undefined,
        color: layerData.color || '#552a47',
        fields: Array.isArray(layerData.fields) ? layerData.fields.map((field: any) => {
          // Ensure each field has the required properties
          return {
            id: field.id || `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: field.name || '',
            type: field.type || 'text',
            label: field.label || '',
            required: !!field.required,
            options: Array.isArray(field.options) ? field.options : [],
            enabled: field.enabled !== undefined ? !!field.enabled : true
          };
        }) : [],
        // Handle custom fields
        customFields: Array.isArray(layerData.customFields) ? layerData.customFields.map((field: any) => {
          return {
            id: field.id || `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: field.name || '',
            type: field.type || 'text',
            required: !!field.required,
            options: Array.isArray(field.options) ? field.options : undefined
          };
        }) : [],
        active: layerData.active !== undefined ? layerData.active : true,
        createdAt: new Date(),
        createdBy: this.userId
      };
      
      // Insert the layer
      try {
        console.log('Attempting to insert layer:', JSON.stringify(layer));
        
        // Make sure we have a valid layer object with all required fields
        if (!layer.id || !layer.name || !layer.location) {
          console.error('Missing required fields in layer object');
          throw new Meteor.Error('validation-error', 'Missing required fields');
        }
        
        // Ensure fields is an array
        if (!Array.isArray(layer.fields)) {
          layer.fields = [];
        }
        
        // Insert the layer using async method
        const layerId = await Layers.insertAsync(layer);
        console.log('Layer inserted successfully with ID:', layerId);
        return layerId;
      } catch (error: any) {
        console.error('Error inserting layer:', error);
        
        // Provide more specific error messages
        if (error.code === 11000) {
          throw new Meteor.Error('duplicate-error', 'A layer with this name already exists');
        } else {
          throw new Meteor.Error('db-error', `Failed to save layer to database: ${error.message || 'Unknown error'}`);
        }
      }
    },

    // Update an existing layer
    async 'layers.update'(layerId: string, layer: Partial<Layer>) {
      check(layerId, String);
      check(layer, Object);

      // Check if user is logged in
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to update a layer');
      }

      // Update the layer
      try {
        console.log('Updating layer with _id:', layerId, 'with data:', layer);
        const result = await Layers.updateAsync({ _id: layerId }, { $set: { ...layer, updatedAt: new Date(), updatedBy: this.userId } });
        console.log('Update result:', result);
        return result;
      } catch (error: any) {
        console.error('Error updating layer:', error);
        throw new Meteor.Error('db-error', `Failed to update layer in database: ${error.message || 'Unknown error'}`);
      }
    },

    // Remove a layer
    async 'layers.remove'(layerId: string) {
      check(layerId, String);

      // Check if user is logged in
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to delete a layer');
      }

      // Delete the layer
      try {
        console.log('Deleting layer with _id:', layerId);
        const result = await Layers.removeAsync({ _id: layerId });
        console.log('Delete result:', result);
        return result;
      } catch (error: any) {
        console.error('Error removing layer:', error);
        throw new Meteor.Error('db-error', `Failed to remove layer from database: ${error.message || 'Unknown error'}`);
      }
    },

    // Update layer status (active/inactive)
    async 'layers.updateStatus'(layerId: string, active: boolean) {
      check(layerId, String);
      check(active, Boolean);

      // Check if user is logged in
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to update layer status');
      }

      // Update the layer status
      try {
        console.log('Updating layer status with _id:', layerId, 'to:', active ? 'active' : 'inactive');
        const result = await Layers.updateAsync(
          { _id: layerId }, 
          { $set: { active, updatedAt: new Date(), updatedBy: this.userId } }
        );
        console.log('Status update result:', result);
        return result;
      } catch (error: any) {
        console.error('Error updating layer status:', error);
        throw new Meteor.Error('db-error', `Failed to update layer status: ${error.message || 'Unknown error'}`);
      }
    },
    
    // Get layers by array of IDs
    async 'layers.getByIds'(layerIds: string[]) {
      check(layerIds, [String]);
      
      // Check if user is logged in
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to fetch layers');
      }
      
      try {
        console.log('Fetching layers with IDs:', layerIds);
        const layers = await Layers.find({ _id: { $in: layerIds } }).fetchAsync();
        console.log(`Found ${layers.length} layers`);
        return layers;
      } catch (error: any) {
        console.error('Error fetching layers by IDs:', error);
        throw new Meteor.Error('db-error', `Failed to fetch layers: ${error.message || 'Unknown error'}`);
      }
    }
  });
}
