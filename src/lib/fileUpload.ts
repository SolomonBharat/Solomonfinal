import { supabase } from './supabase';
import { api } from './api';

export class FileUploadService {
  // Upload RFQ images
  async uploadRFQImages(files: File[], rfqId: string): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${rfqId}/${Date.now()}-${index}.${fileExt}`;
      
      const result = await api.uploadFile('rfq-images', fileName, file);
      return result.success ? result.url! : null;
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null) as string[];
  }

  // Upload quotation images
  async uploadQuotationImages(files: File[], quotationId: string): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${quotationId}/${Date.now()}-${index}.${fileExt}`;
      
      const result = await api.uploadFile('quotation-images', fileName, file);
      return result.success ? result.url! : null;
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null) as string[];
  }

  // Upload factory media
  async uploadFactoryMedia(files: File[], supplierId: string): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${supplierId}/${Date.now()}-${index}.${fileExt}`;
      
      const result = await api.uploadFile('factory-media', fileName, file);
      return result.success ? result.url! : null;
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null) as string[];
  }

  // Upload verification documents
  async uploadDocuments(files: File[], profileId: string): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileId}/${Date.now()}-${index}.${fileExt}`;
      
      const result = await api.uploadFile('documents', fileName, file);
      return result.success ? result.url! : null;
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null) as string[];
  }

  // Delete file
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      return !error;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

export const fileUpload = new FileUploadService();